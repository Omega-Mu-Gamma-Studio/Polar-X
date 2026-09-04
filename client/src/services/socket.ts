import { io, type Socket } from 'socket.io-client';
import { API_BASE_URL, AUTH_TOKEN_KEY } from './api';

/**
 * Socket.io client — real events (Phase 7). The socket connects once with the
 * JWT in the handshake auth payload; controllers emit domain events after
 * mutations and hooks subscribe via onSocketEvent(). The HTTP layer is what
 * enforces auth on the mutations themselves.
 */
const SOCKET_URL = API_BASE_URL.replace(/\/api\/?$/, '') || 'http://localhost:5000';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      transports: ['websocket', 'polling'],
      auth: (callback) => callback({ token: localStorage.getItem(AUTH_TOKEN_KEY) ?? undefined }),
    });
  }
  return socket;
}

/** Connect (or reconnect) the singleton socket. Safe to call repeatedly. */
export function connectSocket(): Socket {
  const sock = getSocket();
  if (!sock.connected) sock.connect();
  return sock;
}

/** Disconnect and drop the singleton (called on logout). */
export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}

/**
 * Subscribe to a typed server event. Returns an unsubscribe function.
 * The socket connects lazily on first use so pages that never need live data
 * (e.g. the landing page) don't open a connection.
 */
export function onSocketEvent<T>(event: string, handler: (payload: T) => void): () => void {
  const sock = connectSocket();
  sock.on(event, handler as (...args: unknown[]) => void);
  return () => {
    sock.off(event, handler as (...args: unknown[]) => void);
  };
}