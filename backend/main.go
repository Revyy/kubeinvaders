package main

import (
	"flag"
	"log"
	"net/http"

	"kubeinvaders/server"
)

func main() {
	port := flag.String("port", "8080", "port to serve on")
	flag.Parse()

	// Create a new WebSocket server
	wsServer, err := server.NewWebSocketServer()
	if err != nil {
		log.Fatalf("Failed to create WebSocket server: %v", err)
	}

	// Set up HTTP server for WebSocket connections
	http.HandleFunc("/ws", wsServer.HandleConnection)

	// Optionally serve the game client from the same server
	http.Handle("/", http.FileServer(http.Dir("../dist")))

	// Start the server
	log.Printf("Server starting on port %s...\n", *port)
	log.Printf("Connect to the WebSocket at ws://localhost:%s/ws\n", *port)
	if err := http.ListenAndServe(":"+*port, nil); err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}
