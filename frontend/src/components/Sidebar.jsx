import { useState } from 'react';
import { useChatStore } from '../store/chatStore';
import { formatListTime, roomTitle, otherMember } from '../utils/format';
import Avatar from './Avatar';

export default function Sidebar({ user, rooms, currentRoomId, connected, error, onSelect, onNewChat, onNewGroup, onLogout }) {
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const unread = useChatStore((state) => state.unread);
  const typing = useChatStore((state) => state.typing);
  const onlineUserIds = useChatStore((state) => state.onlineUserIds);

  const query = search.trim().toLowerCase();
  const visibleRooms = query
    ? rooms.filter((room) => roomTitle(room, user).toLowerCase().includes(query))
    : rooms;

  const preview = (room) => {
    const typers = Object.values(typing[room.id] ?? {});
    if (typers.length) {
      return <span className="typing-text">{room.direct ? 'typing…' : `${typers[0]} is typing…`}</span>;
    }
    const last = room.lastMessage;
    if (!last) return <span className="muted">{room.direct ? 'Say hi 👋' : 'Group created'}</span>;
    const fromMe = last.sender?.id === user.id;
    const prefix = fromMe ? 'You: ' : room.direct ? '' : `${last.sender?.username}: `;
    return (
      <>
        {fromMe && <span className="tick" aria-label="sent">✓</span>}
        {prefix}
        {last.content}
      </>
    );
  };

  return (
    <aside className="sidebar">
      <header className="sidebar-header">
        <div className="me">
          <Avatar name={user.username} size={40} />
          <div className="me-text">
            <strong>{user.username}</strong>
            <span className={`conn ${connected ? 'on' : 'off'}`}>{connected ? 'Online' : 'Connecting…'}</span>
          </div>
        </div>
        <div className="header-actions">
          <button className="icon-btn" title="New chat" aria-label="New chat" onClick={onNewChat}>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M19.005 3.175H4.674C3.642 3.175 3 3.789 3 4.821V21.02l3.544-3.514h12.461c1.033 0 2.064-1.06 2.064-2.093V4.821c-.001-1.032-1.032-1.646-2.064-1.646zm-4.989 9.869H7.041V11.1h6.975v1.944zm3-4H7.041V7.1h9.975v1.944z" /></svg>
          </button>
          <div className="menu-wrap">
            <button className="icon-btn" title="Menu" aria-label="Menu" onClick={() => setMenuOpen((o) => !o)}>
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M12 7a2 2 0 1 0-.001-4.001A2 2 0 0 0 12 7zm0 2a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 9zm0 6a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 15z" /></svg>
            </button>
            {menuOpen && (
              <ul className="menu" onMouseLeave={() => setMenuOpen(false)}>
                <li><button onClick={() => { setMenuOpen(false); onNewGroup(); }}>New group</button></li>
                <li><button onClick={() => { setMenuOpen(false); onLogout(); }}>Log out</button></li>
              </ul>
            )}
          </div>
        </div>
      </header>

      <div className="search-bar">
        <input
          type="search"
          placeholder="Search chats"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && <p className="sidebar-error">{error}</p>}

      <ul className="room-list">
        {visibleRooms.length === 0 && (
          <li className="room-empty">
            {query ? 'No chats match your search.' : 'No chats yet. Start one with the button above.'}
          </li>
        )}
        {visibleRooms.map((room) => {
          const title = roomTitle(room, user);
          const other = room.direct ? otherMember(room, user) : null;
          const count = unread[room.id] ?? 0;
          return (
            <li key={room.id}>
              <button
                className={`room-item ${room.id === currentRoomId ? 'active' : ''}`}
                onClick={() => onSelect(room.id)}
              >
                <Avatar
                  name={title}
                  size={48}
                  group={!room.direct}
                  online={other ? onlineUserIds.includes(other.id) : false}
                />
                <div className="room-body">
                  <div className="room-top">
                    <span className="room-name">{title}</span>
                    <span className={`room-time ${count ? 'unread' : ''}`}>
                      {formatListTime(room.lastMessage?.timestamp)}
                    </span>
                  </div>
                  <div className="room-bottom">
                    <span className="room-preview">{preview(room)}</span>
                    {count > 0 && <span className="badge">{count}</span>}
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
