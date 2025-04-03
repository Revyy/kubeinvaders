package server

import (
	"fmt"
	"log"
	"net/http"
	"path/filepath"
	"sync"
	"time"

	"github.com/gorilla/websocket"
	"go.uber.org/zap"
	"golang.org/x/net/context"
	v1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/watch"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/util/homedir"
)

// Message represents a WebSocket message structure
type Message struct {
	Type    string      `json:"type"`
	Payload interface{} `json:"payload"`
}

// WebSocketServer manages a single WebSocket connection
type WebSocketServer struct {
	client      *websocket.Conn
	isConnected bool
	mu          sync.Mutex // Mutex for thread-safe operations
	logger      *zap.Logger
	clientSet   *kubernetes.Clientset
	cancel      context.CancelFunc // Store the cancel function
}

// WebSocket connection upgrader
var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	// Allow all origins since we're running locally
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

// NewWebSocketServer creates a new WebSocket server
func NewWebSocketServer() (*WebSocketServer, error) {
	configPath := filepath.Join(homedir.HomeDir(), ".kube", "config")
	logger, err := zap.NewDevelopmentConfig().Build()
	if err != nil {
		return nil, fmt.Errorf("failed to create logger: %w", err)
	}

	config, err := getConfig(configPath, logger)
	if err != nil {
		return nil, fmt.Errorf("failed to get kubernetes config: %w", err)
	}

	clientset, err := newClientSet(config)
	if err != nil {
		return nil, fmt.Errorf("failed to create kubernetes clientset: %w", err)
	}

	return &WebSocketServer{
		isConnected: false,
		logger:      logger,
		clientSet:   clientset,
	}, nil
}

// HandleConnection handles a new WebSocket connection
// Since we only support one client, this will replace any existing connection
func (server *WebSocketServer) HandleConnection(w http.ResponseWriter, r *http.Request) {
	// Lock to prevent race conditions if multiple connection attempts happen
	server.mu.Lock()

	// If we already have a connection, close it and replace with the new one
	if server.isConnected && server.client != nil {
		log.Println("Replacing existing connection with new one")
		server.client.Close()
		// Cancel any existing context to stop running goroutines
		if server.cancel != nil {
			server.cancel()
		}
	}
	server.mu.Unlock()

	// Upgrade the HTTP connection to a WebSocket connection
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Error upgrading connection:", err)
		return
	}

	log.Println("Client connected")

	// Create a new context with cancel function for this connection
	ctx, cancel := context.WithCancel(context.Background())

	// Update the server with the new connection
	server.mu.Lock()
	server.client = conn
	server.isConnected = true
	server.cancel = cancel // Store the cancel function
	server.mu.Unlock()

	// Send welcome message
	server.Send(Message{
		Type: "connected",
		Payload: map[string]interface{}{
			"message": "Connected to the game server",
		},
	})

	// Handle incoming messages in a separate goroutine
	go server.watchPods(ctx, server.client)
	go server.listenForMessages(conn)
}

// Send sends a message to the connected client
func (server *WebSocketServer) Send(message Message) error {
	server.mu.Lock()
	defer server.mu.Unlock()

	if !server.isConnected || server.client == nil {
		log.Println("Cannot send message: No client connected")
		return fmt.Errorf("no client connected")
	}

	if err := server.client.WriteJSON(message); err != nil {
		log.Printf("Error sending message: %v", err)
		// Close the connection on error
		server.client.Close()
		server.isConnected = false
		server.client = nil
		return err
	}
	return nil
}

// watchPods watches for changes in Kubernetes pods and sends updates to the client
func (server *WebSocketServer) watchPods(ctx context.Context, conn *websocket.Conn) {
	listPodsCtx, listPodsCancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer listPodsCancel()

	podList, err := listAllPods(listPodsCtx, server.clientSet)
	if err != nil {
		// TODO: Handle error appropriately
		log.Println("Error listing pods:", err)
		return
	}

	// Send the initial list of pods to the client
	server.Send(Message{
		Type:    "podList",
		Payload: podList.Items,
	})

	// Watch for changes in the pod list
	watcher, err := setupWatcher(ctx, server.clientSet, nil, podList.ResourceVersion)
	if err != nil {
		log.Println("Error setting up watcher:", err)
		return
	}
	defer watcher.Stop()

	for event := range watcher.ResultChan() {
		// Check if context is done before processing events
		select {
		case <-ctx.Done():
			server.logger.Info("Context cancelled, stopping pod watcher")
			return
		default:
			// Continue processing the event
		}

		server.logger.Info("Received event", zap.Any("eventType", event.Type))

		switch event.Type {
		case watch.Added:
			pod, ok := event.Object.(*v1.Pod)
			if !ok {
				server.logger.Info("Error casting event object to Pod")
				continue
			}
			log.Printf("Pod added: %s/%s", pod.Namespace, pod.Name)
			err := server.Send(Message{
				Type:    "podAdded",
				Payload: pod,
			})
			if err != nil {
				server.logger.Error("Error sending pod added message", zap.Error(err))
				break
			}

		case watch.Deleted:
			pod, ok := event.Object.(*v1.Pod)
			if !ok {
				server.logger.Info("Error casting event object to Pod")
				continue
			}

			log.Printf("Pod deleted: %s/%s", pod.Namespace, pod.Name)

			err := server.Send(Message{
				Type:    "podDeleted",
				Payload: pod,
			})
			if err != nil {
				server.logger.Error("Error sending pod deleted message", zap.Error(err))
				break
			}
		}
	}

	// Close the connection when done
	watcher.Stop()
	server.logger.Info("Watcher stopped")
	return
}

// listenForMessages reads messages from the client
func (server *WebSocketServer) listenForMessages(conn *websocket.Conn) {
	defer func() {
		log.Println("Client disconnected")
		server.mu.Lock()
		server.isConnected = false
		server.client = nil
		// Call cancel to stop any active watchers
		if server.cancel != nil {
			server.cancel()
			server.cancel = nil
		}
		conn.Close()
		server.mu.Unlock()
	}()

	for {
		var message Message
		err := conn.ReadJSON(&message)
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("Error reading message: %v", err)
			}
			break
		}

		// Process the received message
		server.handleMessage(message)
	}
}

// handleMessage processes messages based on their type
func (server *WebSocketServer) handleMessage(message Message) {
	switch message.Type {
	case "playerMove":
		// Process player movement data if needed
		log.Printf("Received player movement: %v", message.Payload)
		// Echo back the processed data
		server.Send(Message{
			Type:    "moveProcessed",
			Payload: message.Payload,
		})

	case "ping":
		// Simple ping-pong for connection testing
		server.Send(Message{
			Type:    "pong",
			Payload: message.Payload,
		})

	default:
		log.Printf("Received message type: %s, payload: %v", message.Type, message.Payload)
		// Echo back by default
		server.Send(message)
	}
}
