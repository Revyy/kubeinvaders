package server

import (
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
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
func NewWebSocketServer() *WebSocketServer {
	return &WebSocketServer{
		isConnected: false,
	}
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
	}
	server.mu.Unlock()

	// Upgrade the HTTP connection to a WebSocket connection
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Error upgrading connection:", err)
		return
	}

	log.Println("Client connected")

	// Update the server with the new connection
	server.mu.Lock()
	server.client = conn
	server.isConnected = true
	server.mu.Unlock()

	// Send welcome message
	server.Send(Message{
		Type: "connected",
		Payload: map[string]interface{}{
			"message": "Connected to the game server",
		},
	})

	// Handle incoming messages in a separate goroutine
	go server.listenForMessages(conn)
}

// Send sends a message to the connected client
func (server *WebSocketServer) Send(message Message) {
	server.mu.Lock()
	defer server.mu.Unlock()

	if !server.isConnected || server.client == nil {
		log.Println("Cannot send message: No client connected")
		return
	}

	if err := server.client.WriteJSON(message); err != nil {
		log.Printf("Error sending message: %v", err)
		// Close the connection on error
		server.client.Close()
		server.isConnected = false
		server.client = nil
	}
}

// listenForMessages reads messages from the client
func (server *WebSocketServer) listenForMessages(conn *websocket.Conn) {
	defer func() {
		log.Println("Client disconnected")
		server.mu.Lock()
		server.isConnected = false
		server.client = nil
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
