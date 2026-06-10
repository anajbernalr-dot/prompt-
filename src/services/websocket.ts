import { WS_URL } from '../config';

type MessageHandler = (message: WSMessage) => void;

export interface WSMessage {
  type: 'join_room' | 'sale_recorded' | 'stand_joined' | 'stats_update' | 'ping';
  roomCode?: string;
  data?: unknown;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private roomCode: string | null = null;
  private handlers: Set<MessageHandler> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private isConnecting = false;
  private shouldReconnect = true;

  connect(roomCode: string): void {
    this.roomCode = roomCode;
    this.shouldReconnect = true;
    this.reconnectAttempts = 0;
    this._connect();
  }

  private _connect(): void {
    if (this.isConnecting) return;
    this.isConnecting = true;

    try {
      this.ws = new WebSocket(WS_URL);

      this.ws.onopen = () => {
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        if (this.roomCode) {
          this.send({ type: 'join_room', roomCode: this.roomCode });
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WSMessage = JSON.parse(event.data);
          this.handlers.forEach(handler => handler(message));
        } catch {
          // Ignore malformed messages
        }
      };

      this.ws.onclose = () => {
        this.isConnecting = false;
        this.ws = null;
        if (this.shouldReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
          this.reconnectAttempts++;
          this.reconnectTimer = setTimeout(() => this._connect(), delay);
        }
      };

      this.ws.onerror = () => {
        this.isConnecting = false;
      };
    } catch {
      this.isConnecting = false;
    }
  }

  disconnect(): void {
    this.shouldReconnect = false;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.roomCode = null;
  }

  send(message: WSMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  onMessage(handler: MessageHandler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

export const wsService = new WebSocketService();
