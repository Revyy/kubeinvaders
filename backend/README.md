# KubeInvaders WebSocket Server (Single-Player Mode)

This is a simplified WebSocket server for the KubeInvaders game, designed for local single-player use on the same machine.

## Features

- Simple WebSocket connection for local game communication
- Minimal server designed for single client connection
- Low latency for same-machine communication

## Getting Started

### Prerequisites

- Go 1.21 or later
- [Gorilla WebSocket](https://github.com/gorilla/websocket) package

### Running the Server

```bash
# Navigate to the backend directory
cd backend

# Install dependencies
go mod download

# Run the server (default port 8080)
go run main.go

# Run on a specific port
go run main.go -port=9000
```

## Docker Support

```bash
# Build the Docker image
docker build -t kubeinvaders-server .

# Run the container
docker run -p 8080:8080 kubeinvaders-server
```

## Connecting from the Client

Connect to the WebSocket server from your game client:

```typescript
import { getWebSocketService } from './services/websocket';

// Initialize the WebSocket service
const wsService = getWebSocketService('ws://localhost:8080/ws');
wsService.connect()
  .then(() => {
    console.log('Connected to game server');
    
    // Register message handlers
    wsService.on('pong', (payload) => {
      console.log('Received pong response:', payload);
    });
    
    // Send a test message
    wsService.send('ping', { time: Date.now() });
  })
  .catch(err => {
    console.error('Failed to connect:', err);
  });
```

## Message Types

The server handles various message types:

- `ping`: Simple ping/pong for connection testing
- `playerMove`: Process player movement data

You can extend the message handler to support additional game-specific message types.
