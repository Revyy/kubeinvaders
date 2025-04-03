/**
 * Simple WebSocket client service for local single-player game
 */
export class WebSocketService {
  private socket: WebSocket | null = null;
  private messageHandlers: { [type: string]: ((payload: any) => void)[] } = {};
  private isConnected: boolean = false;
  private url: string;

  /**
   * Create a new WebSocket service
   * @param url The WebSocket server URL (e.g. ws://localhost:8080/ws)
   */
  constructor(url: string) {
    this.url = url;
  }

  /**
   * Connect to the local WebSocket server
   */
  public connect(): Promise<void> {
    // If already connected, return immediately
    if (this.isConnected) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      try {
        this.socket = new WebSocket(this.url);

        this.socket.onopen = () => {
          console.log("Connected to local game server");
          this.isConnected = true;
          resolve();
        };

        this.socket.onclose = () => {
          console.log("Disconnected from local game server");
          this.isConnected = false;
        };

        this.socket.onerror = (error) => {
          console.error("WebSocket error:", error);
          this.isConnected = false;
          reject(error);
        };

        this.socket.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            // Call handlers for this message type
            const handlers = this.messageHandlers[message.type] || [];
            handlers.forEach((handler) => handler(message.payload));
          } catch (e) {
            console.error("Error processing message:", e);
          }
        };
      } catch (e) {
        console.error("Failed to connect to local WebSocket server:", e);
        reject(e);
      }
    });
  }

  /**
   * Disconnect from the WebSocket server
   */
  public disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.isConnected = false;
    }
  }

  /**
   * Check if connected to the server
   */
  public isConnectedToServer(): boolean {
    return this.isConnected;
  }

  /**
   * Send a message to the server
   * @param type Message type
   * @param payload Message payload
   */
  public send(type: string, payload: any): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type, payload }));
    } else {
      console.warn("Cannot send message: WebSocket is not connected");
    }
  }

  /**
   * Register a handler for a specific message type
   * @param type Message type
   * @param handler Handler function
   */
  public on(type: string, handler: (payload: any) => void): void {
    if (!this.messageHandlers[type]) {
      this.messageHandlers[type] = [];
    }
    this.messageHandlers[type].push(handler);
  }

  /**
   * Remove a handler for a specific message type
   * @param type Message type
   * @param handler Handler function
   */
  public off(type: string, handler: (payload: any) => void): void {
    if (this.messageHandlers[type]) {
      this.messageHandlers[type] = this.messageHandlers[type].filter(
        (h) => h !== handler
      );
    }
  }
}

// Simple singleton pattern
let wsInstance: WebSocketService | null = null;

/**
 * Get the WebSocket service instance
 * @param url Optional WebSocket URL (only used when creating the instance)
 */
export function getWebSocketService(url?: string): WebSocketService {
  if (!wsInstance && url) {
    wsInstance = new WebSocketService(url);
  } else if (!wsInstance) {
    throw new Error("WebSocket service not initialized. Provide a URL.");
  }
  return wsInstance;
}
