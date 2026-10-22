import { useState, useEffect, useRef } from 'react';
import { useChatStore } from '../store/chatStore';
import { getMessages } from '../services/api';
import { sendMessage, sendTyping } from '../services/websocket';
import { formatTime, formatDayLabel, dayKey, roomTitle, otherMember } from '../utils/format';
import Avatar from './Avatar';

const EMOJIS = ['😀', '😂', '😍', '😊', '😎', '🤔', '😢', '😡', '👍', '👏', '🙏', '🔥', '🎉', '❤️', '✅', '👋'];

// Stop sending "typing" after this long without a keystroke
const TYPING_IDLE_MS = 2000;

const NAME_COLORS = ['#06cf9c', '#53bdeb', '#ff7d6b', '#a77bf3', '#f7b500', '#e26ab6'];
const nameColor = (id) => NAME_COLORS[(id ?? 0) % NAME_COLORS.length];

export default function ChatWindow({ room, user, connected, connectionId, onBack }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);

  const messages = useChatStore((state) => state.messages[room.id]);
  const setMessages = useChatStore((state) => state.setMessages);
  const typingUsers = useChatStore((state) => state.typing[room.id]);
  const onlineUserIds = useChatStore((state) => state.onlineUserIds);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const typingRef = useRef({ active: false, timer: null });

  // Load history when the chat opens, and again after a reconnect to catch anything missed
  useEffect(() => {
    let cancelled = false;
    getMessages(room.id)
      .then((response) => {
        if (!cancelled) {
          setMessages(room.id, response.data);
          setError('');
        }
      })
      .catch(() => !cancelled && setError('Could not load messages.'))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [room.id, connectionId, setMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [messages?.length, room.id]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [room.id]);

  // Tell others we stopped typing when leaving the chat
  useEffect(() => {
    const typing = typingRef.current;
    return () => {
      clearTimeout(typing.timer);
      if (typing.active) sendTyping(room.id, false);
    };
  }, [room.id]);

  const stopTyping = () => {
    const typing = typingRef.current;
    clearTimeout(typing.timer);
    if (typing.active) {
      typing.active = false;
      sendTyping(room.id, false);
    }
  };

  const handleChange = (e) => {
    setText(e.target.value);
    const typing = typingRef.current;
    if (!typing.active && e.target.value) {
      typing.active = true;
      sendTyping(room.id, true);
    }
    clearTimeout(typing.timer);
    typing.timer = setTimeout(stopTyping, TYPING_IDLE_MS);
  };

  const handleSend = (e) => {
    e?.preventDefault();
    const content = text.trim();
    if (!content) return;
    if (!sendMessage(room.id, content)) {
      setError('Not connected - your message was not sent. Reconnecting…');
      return;
    }
    setError('');
    setText('');
    setShowEmoji(false);
    stopTyping();
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) handleSend(e);
  };

  const addEmoji = (emoji) => {
    setText((t) => t + emoji);
    inputRef.current?.focus();
  };

  const title = roomTitle(room, user);
  const other = room.direct ? otherMember(room, user) : null;
  const typers = Object.values(typingUsers ?? {});

  let subtitle;
  if (typers.length) {
    subtitle = <span className="typing-text">{room.direct ? 'typing…' : `${typers.join(', ')} typing…`}</span>;
  } else if (room.direct) {
    subtitle = other && onlineUserIds.includes(other.id) ? 'online' : '';
  } else {
    const names = (room.members ?? []).map((m) => (m.id === user.id ? 'You' : m.username));
    subtitle = names.sort((a, b) => (a === 'You' ? 1 : b === 'You' ? -1 : a.localeCompare(b))).join(', ');
  }

  return (
    <section className="chat-window">
      <header className="chat-header">
        <button className="icon-btn back-btn" onClick={onBack} aria-label="Back to chats">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M12 4l1.4 1.4L7.8 11H20v2H7.8l5.6 5.6L12 20l-8-8 8-8z" /></svg>
        </button>
        <Avatar name={title} size={40} group={!room.direct} />
        <div className="chat-header-text">
          <strong>{title}</strong>
          <span className="chat-sub">{subtitle}</span>
        </div>
      </header>

      <div className="messages">
        {loading && !messages && <p className="system-note">Loading messages…</p>}
        {!loading && messages?.length === 0 && (
          <p className="system-note">No messages yet. Say hello!</p>
        )}

        {(messages ?? []).map((msg, idx) => {
          const prev = messages[idx - 1];
          const mine = msg.sender?.id === user.id;
          const newDay = !prev || dayKey(prev.timestamp) !== dayKey(msg.timestamp);
          const firstInRun = newDay || prev.sender?.id !== msg.sender?.id;
          return (
            <div key={msg.id ?? idx}>
              {newDay && <div className="day-sep"><span>{formatDayLabel(msg.timestamp)}</span></div>}
              <div className={`msg-row ${mine ? 'mine' : 'theirs'} ${firstInRun ? 'first' : ''}`}>
                <div className="bubble">
                  {!mine && !room.direct && firstInRun && (
                    <span className="sender" style={{ color: nameColor(msg.sender?.id) }}>
                      {msg.sender?.username}
                    </span>
                  )}
                  <span className="content">{msg.content}</span>
                  <span className="meta">
                    {formatTime(msg.timestamp)}
                    {mine && <span className="tick">✓</span>}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {error && <p className="chat-error" role="alert">{error}</p>}

      {showEmoji && (
        <div className="emoji-panel">
          {EMOJIS.map((emoji) => (
            <button key={emoji} type="button" onClick={() => addEmoji(emoji)}>{emoji}</button>
          ))}
        </div>
      )}

      <form className="composer" onSubmit={handleSend}>
        <button
          type="button"
          className={`icon-btn ${showEmoji ? 'active' : ''}`}
          aria-label="Emoji"
          onClick={() => setShowEmoji((s) => !s)}
        >
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm-3.5-9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm7 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM12 17.5c2.3 0 4.3-1.4 5.1-3.5H6.9c.8 2.1 2.8 3.5 5.1 3.5z" /></svg>
        </button>
        <textarea
          ref={inputRef}
          rows={1}
          placeholder={connected ? 'Type a message' : 'Connecting…'}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
        <button type="submit" className="send-btn" aria-label="Send" disabled={!text.trim() || !connected}>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M1.101 21.757 23.8 12.028 1.101 2.3l.011 7.912 13.623 1.816-13.623 1.817-.011 7.912z" /></svg>
        </button>
      </form>
    </section>
  );
}
