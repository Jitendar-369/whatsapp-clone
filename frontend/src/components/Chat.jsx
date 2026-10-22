import { useState, useEffect, useRef, useCallback } from 'react';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import { getMyRooms, getOnlineUsers } from '../services/api';
import { connectWebSocket, disconnectWebSocket, subscribe, subscribeToRoom } from '../services/websocket';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';
import NewChatModal from './NewChatModal';

// How long a "typing…" indicator stays without a fresh event
const TYPING_TIMEOUT_MS = 4000;

const safeUnsubscribe = (sub) => {
  try {
    sub?.unsubscribe();
  } catch {
    // connection already closed
  }
};

export default function Chat() {
  const [connected, setConnected] = useState(false);
  const [connectionId, setConnectionId] = useState(0); // bumps on every (re)connect
  const [modal, setModal] = useState(null); // 'chat' | 'group' | null
  const [loadError, setLoadError] = useState('');

  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);

  const rooms = useChatStore((state) => state.rooms);
  const currentRoomId = useChatStore((state) => state.currentRoomId);
  const setRooms = useChatStore((state) => state.setRooms);
  const upsertRoom = useChatStore((state) => state.upsertRoom);
  const addMessage = useChatStore((state) => state.addMessage);
  const selectRoom = useChatStore((state) => state.selectRoom);
  const setOnlineUserIds = useChatStore((state) => state.setOnlineUserIds);
  const setTyping = useChatStore((state) => state.setTyping);
  const reset = useChatStore((state) => state.reset);

  const roomSubs = useRef(new Map()); // roomId -> [messageSub, typingSub]
  const typingTimers = useRef({});

  const fetchRooms = useCallback(
    () =>
      getMyRooms()
        .then((response) => {
          setRooms(response.data);
          setLoadError('');
        })
        .catch((err) => {
          console.error('Failed to fetch rooms', err);
          setLoadError('Could not load your chats. Is the backend running?');
        }),
    [setRooms],
  );

  // Connect once per signed-in user
  useEffect(() => {
    connectWebSocket(token, {
      onConnect: () => {
        roomSubs.current = new Map();
        setConnected(true);
        setConnectionId((n) => n + 1);
      },
      onDisconnect: () => setConnected(false),
      onAuthError: logout,
    });
    return () => {
      disconnectWebSocket();
      roomSubs.current = new Map();
    };
  }, [token, logout]);

  // After each (re)connect: refresh chats and listen for presence and new rooms
  useEffect(() => {
    fetchRooms();
    getOnlineUsers()
      .then((response) => setOnlineUserIds(response.data))
      .catch(() => {});
    if (!connectionId) return;

    const subs = [
      subscribe('/topic/presence', (ids) => setOnlineUserIds(ids)),
      subscribe(`/topic/user/${user.id}/rooms`, (room) => upsertRoom(room)),
    ];
    return () => subs.forEach(safeUnsubscribe);
  }, [connectionId, user.id, fetchRooms, setOnlineUserIds, upsertRoom]);

  // Listen to every room the user is in, so the chat list and unread counts stay live
  useEffect(() => {
    if (!connectionId) return;
    const subs = roomSubs.current;
    rooms.forEach((room) => {
      if (subs.has(room.id)) return;

      const messageSub = subscribeToRoom(room.id, (msg) => {
        addMessage(msg, user.id);
        setTyping(room.id, msg.sender?.id, null, false);
      });
      const typingSub = subscribe(`/topic/typing/${room.id}`, (event) => {
        if (event.senderId === user.id) return;
        setTyping(room.id, event.senderId, event.sender, event.typing);

        const key = `${room.id}:${event.senderId}`;
        clearTimeout(typingTimers.current[key]);
        if (event.typing) {
          typingTimers.current[key] = setTimeout(
            () => setTyping(room.id, event.senderId, null, false),
            TYPING_TIMEOUT_MS,
          );
        }
      });
      if (messageSub && typingSub) subs.set(room.id, [messageSub, typingSub]);
    });
  }, [rooms, connectionId, user.id, addMessage, setTyping]);

  useEffect(() => {
    const timers = typingTimers.current;
    return () => Object.values(timers).forEach(clearTimeout);
  }, []);

  const handleLogout = () => {
    disconnectWebSocket();
    reset();
    logout();
  };

  const handleRoomCreated = (room) => {
    upsertRoom(room);
    selectRoom(room.id);
    setModal(null);
  };

  const currentRoom = rooms.find((r) => r.id === currentRoomId) ?? null;

  return (
    <div className={`app-shell ${currentRoom ? 'show-chat' : ''}`}>
      <Sidebar
        user={user}
        rooms={rooms}
        currentRoomId={currentRoomId}
        connected={connected}
        error={loadError}
        onSelect={selectRoom}
        onNewChat={() => setModal('chat')}
        onNewGroup={() => setModal('group')}
        onLogout={handleLogout}
      />

      {currentRoom ? (
        <ChatWindow
          key={currentRoom.id}
          room={currentRoom}
          user={user}
          connected={connected}
          connectionId={connectionId}
          onBack={() => selectRoom(null)}
        />
      ) : (
        <div className="chat-empty">
          <div className="chat-empty-inner">
            <svg viewBox="0 0 24 24" width="72" height="72" fill="currentColor" aria-hidden="true">
              <path d="M12 2C6.48 2 2 6.2 2 11.4c0 2.9 1.4 5.5 3.6 7.2L5 22l3.8-1.9c1 .3 2.1.4 3.2.4 5.52 0 10-4.2 10-9.4S17.52 2 12 2z" />
            </svg>
            <h2>Chat</h2>
            <p>Pick a conversation on the left, or start a new chat or group.</p>
            <div className="chat-empty-actions">
              <button className="btn-primary" onClick={() => setModal('chat')}>New chat</button>
              <button className="btn-secondary" onClick={() => setModal('group')}>New group</button>
            </div>
          </div>
        </div>
      )}

      {modal && (
        <NewChatModal
          mode={modal}
          user={user}
          onModeChange={setModal}
          onClose={() => setModal(null)}
          onCreated={handleRoomCreated}
        />
      )}
    </div>
  );
}
