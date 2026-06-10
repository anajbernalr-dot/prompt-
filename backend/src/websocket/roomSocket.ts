import { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';

type RoomCode = string;

interface WSMessage {
  type: 'join_room' | 'sale_recorded' | 'stand_joined' | 'stats_update' | 'ping';
  roomCode?: string;
  data?: unknown;
}

const rooms = new Map<RoomCode, Set<WebSocket>>();

function broadcastToRoom(roomCode: string, message: WSMessage, sender?: WebSocket): void {
  const room = rooms.get(roomCode);
  if (!room) return;
  
  const payload = JSON.stringify(message);
  room.forEach(client => {
    if (client !== sender && client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

export function setupWebSocket(server: HttpServer): WebSocketServer {
  const wss = new WebSocketServer({ server, path: '/' });
  
  wss.on('connection', (ws: WebSocket) => {
    let currentRoom: string | null = null;
    
    ws.on('message', (data) => {
      try {
        const message: WSMessage = JSON.parse(data.toString());
        
        switch (message.type) {
          case 'join_room': {
            const roomCode = message.roomCode;
            if (!roomCode) break;
            
            if (currentRoom) {
              const oldRoom = rooms.get(currentRoom);
              if (oldRoom) {
                oldRoom.delete(ws);
                if (oldRoom.size === 0) rooms.delete(currentRoom);
              }
            }
            
            currentRoom = roomCode;
            if (!rooms.has(roomCode)) {
              rooms.set(roomCode, new Set());
            }
            rooms.get(roomCode)!.add(ws);
            
            ws.send(JSON.stringify({ type: 'join_room', data: { roomCode, success: true } }));
            broadcastToRoom(roomCode, { type: 'stand_joined', data: { roomCode } }, ws);
            break;
          }
          
          case 'sale_recorded':
          case 'stats_update': {
            if (currentRoom) {
              broadcastToRoom(currentRoom, message, ws);
            }
            break;
          }
          
          case 'ping':
            ws.send(JSON.stringify({ type: 'ping', data: { pong: true } }));
            break;
        }
      } catch {
        // Ignore malformed messages
      }
    });
    
    ws.on('close', () => {
      if (currentRoom) {
        const room = rooms.get(currentRoom);
        if (room) {
          room.delete(ws);
          if (room.size === 0) rooms.delete(currentRoom);
        }
      }
    });
  });
  
  return wss;
}
