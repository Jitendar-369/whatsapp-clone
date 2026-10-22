import { Client } from '@stomp/stompjs';

// Spring's STOMP endpoint (see WebSocketConfig.java)
const WS_URL = import.meta.env.VITE_WS_URL ?? 'ws://localhost:8080/ws';

let client = null;

// onConnect runs on the first connect and again after every reconnect,
// because subscriptions do not survive a dropped connection.
// onAuthError runs when the server rejects the token.
export const connectWebSocket = (token, { onConnect, onDisconnect, onAuthError } = {}) => {
  disconnectWebSocket();

  client = new Client({
    brokerURL: WS_URL,
    connectHeaders: { Authorization: `Bearer ${token}` },
    reconnectDelay: 3000,
    onConnect: () => {
      console.log('WebSocket connected');
      onConnect?.();
    },
    onWebSocketClose: () => {
      console.log('WebSocket disconnected');
      onDisconnect?.();
    },
    onStompError: (frame) => {
      const message = frame.headers.message ?? '';
      console.error('STOMP error', message);
      if (/token|authenticated/i.test(message)) onAuthError?.();
    },
  });

  client.activate();
  return client;
};

export const disconnectWebSocket = () => {
  if (client) client.deactivate();
  client = null;
};

// Returns the subscription (call .unsubscribe() on it), or null if not connected
export const subscribe = (destination, callback) => {
  if (!client?.connected) return null;
  return client.subscribe(destination, (frame) => callback(JSON.parse(frame.body)));
};

export const subscribeToRoom = (roomId, callback) => subscribe(`/topic/room/${roomId}`, callback);

// The server takes the sender from the signed-in session
export const sendMessage = (roomId, content) => {
  if (!client?.connected) return false;
  client.publish({
    destination: `/app/chat/${roomId}`,
    body: JSON.stringify({ content }),
  });
  return true;
};

export const sendTyping = (roomId, typing) => {
  if (!client?.connected) return;
  client.publish({
    destination: `/app/typing/${roomId}`,
    body: JSON.stringify({ typing }),
  });
};

export const getSocket = () => client;
