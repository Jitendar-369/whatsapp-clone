import { create } from 'zustand';

const lastActivity = (room) => room.lastMessage?.timestamp ?? '';

// Most recently active chats first, like WhatsApp
const sortRooms = (rooms) =>
  [...rooms].sort((a, b) => lastActivity(b).localeCompare(lastActivity(a)));

export const useChatStore = create((set) => ({
  rooms: [],              // rooms the user is in, each with lastMessage
  messages: {},           // roomId -> messages, oldest first
  currentRoomId: null,
  unread: {},             // roomId -> count
  onlineUserIds: [],
  typing: {},             // roomId -> { userId: username }

  setRooms: (rooms) => set({ rooms: sortRooms(rooms) }),

  // Add a room, or replace it if we already have it
  upsertRoom: (room) => set((state) => {
    const existing = state.rooms.find((r) => r.id === room.id);
    const merged = { ...existing, ...room, lastMessage: room.lastMessage ?? existing?.lastMessage ?? null };
    return { rooms: sortRooms([...state.rooms.filter((r) => r.id !== room.id), merged]) };
  }),

  setMessages: (roomId, list) => set((state) => ({
    messages: { ...state.messages, [roomId]: list },
  })),

  // A message arrived over the WebSocket
  addMessage: (message, myUserId) => set((state) => {
    const roomId = message.room?.id;
    if (roomId == null) return {};

    const list = state.messages[roomId] ?? [];
    if (list.some((m) => m.id === message.id)) return {};

    const fromMe = message.sender?.id === myUserId;
    const isOpen = state.currentRoomId === roomId;
    return {
      messages: state.messages[roomId]
        ? { ...state.messages, [roomId]: [...list, message] }
        : state.messages, // not loaded yet - it will be fetched when opened
      rooms: sortRooms(state.rooms.map((r) => (r.id === roomId ? { ...r, lastMessage: message } : r))),
      unread: fromMe || isOpen
        ? state.unread
        : { ...state.unread, [roomId]: (state.unread[roomId] ?? 0) + 1 },
    };
  }),

  selectRoom: (roomId) => set((state) => ({
    currentRoomId: roomId,
    unread: { ...state.unread, [roomId]: 0 },
  })),

  setOnlineUserIds: (ids) => set({ onlineUserIds: ids }),

  setTyping: (roomId, userId, username, isTyping) => set((state) => {
    const room = { ...(state.typing[roomId] ?? {}) };
    if (isTyping) room[userId] = username;
    else delete room[userId];
    return { typing: { ...state.typing, [roomId]: room } };
  }),

  reset: () => set({ rooms: [], messages: {}, currentRoomId: null, unread: {}, onlineUserIds: [], typing: {} }),
}));
