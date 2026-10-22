import { useState, useEffect } from 'react';
import { getAllUsers, openDirectChat, createGroup, errorText } from '../services/api';
import { useChatStore } from '../store/chatStore';
import Avatar from './Avatar';

export default function NewChatModal({ mode, user, onModeChange, onClose, onCreated }) {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const onlineUserIds = useChatStore((state) => state.onlineUserIds);

  useEffect(() => {
    getAllUsers()
      .then((response) => setUsers(response.data.filter((u) => u.id !== user.id)))
      .catch((err) => setError(errorText(err, 'Could not load users')));
  }, [user.id]);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const query = search.trim().toLowerCase();
  const visible = users.filter(
    (u) => u.username.toLowerCase().includes(query) || u.email?.toLowerCase().includes(query),
  );

  const startChat = async (other) => {
    setBusy(true);
    setError('');
    try {
      const response = await openDirectChat(other.id);
      onCreated(response.data);
    } catch (err) {
      setError(errorText(err, 'Could not start chat'));
    } finally {
      setBusy(false);
    }
  };

  const toggle = (id) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) return setError('Give the group a name.');
    if (selected.length === 0) return setError('Pick at least one member.');
    setBusy(true);
    setError('');
    try {
      const response = await createGroup(groupName.trim(), '', selected);
      onCreated(response.data);
    } catch (err) {
      setError(errorText(err, 'Could not create group'));
    } finally {
      setBusy(false);
    }
  };

  const isGroup = mode === 'group';

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={isGroup ? 'New group' : 'New chat'}>
        <header className="modal-header">
          <div className="tabs">
            <button className={!isGroup ? 'active' : ''} onClick={() => onModeChange('chat')}>New chat</button>
            <button className={isGroup ? 'active' : ''} onClick={() => onModeChange('group')}>New group</button>
          </div>
          <button className="icon-btn" aria-label="Close" onClick={onClose}>✕</button>
        </header>

        <form onSubmit={handleCreateGroup} className="modal-body">
          {isGroup && (
            <input
              className="group-name"
              placeholder="Group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              autoFocus
            />
          )}

          <input
            type="search"
            className="modal-search"
            placeholder="Search people"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus={!isGroup}
          />

          {error && <p className="login-error">{error}</p>}

          <ul className="user-list">
            {visible.length === 0 && (
              <li className="room-empty">
                {users.length === 0 ? 'No other users yet. Register a second account to chat.' : 'No one matches.'}
              </li>
            )}
            {visible.map((u) => (
              <li key={u.id}>
                {isGroup ? (
                  <label className="user-item">
                    <input type="checkbox" checked={selected.includes(u.id)} onChange={() => toggle(u.id)} />
                    <Avatar name={u.username} size={40} online={onlineUserIds.includes(u.id)} />
                    <span className="user-text">
                      <strong>{u.username}</strong>
                      <small>{u.email}</small>
                    </span>
                  </label>
                ) : (
                  <button type="button" className="user-item" disabled={busy} onClick={() => startChat(u)}>
                    <Avatar name={u.username} size={40} online={onlineUserIds.includes(u.id)} />
                    <span className="user-text">
                      <strong>{u.username}</strong>
                      <small>{onlineUserIds.includes(u.id) ? 'online' : u.email}</small>
                    </span>
                  </button>
                )}
              </li>
            ))}
          </ul>

          {isGroup && (
            <button type="submit" className="btn-primary" disabled={busy}>
              {busy ? 'Creating…' : `Create group${selected.length ? ` (${selected.length + 1})` : ''}`}
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
