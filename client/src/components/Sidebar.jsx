import { useState } from 'react';
import Avatar from './Avatar';

/** Левая панель: профиль, список каналов, кто онлайн */
export default function Sidebar({
  open,
  me,
  rooms,
  activeRoom,
  users,
  unread,
  onJoinRoom,
  onCreateRoom,
  onNavigate,
}) {
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState('');

  const submitRoom = (e) => {
    e.preventDefault();
    const label = draft.trim();
    if (!label) return;
    onCreateRoom(label);
    setDraft('');
    setCreating(false);
  };

  return (
    <aside className={`sidebar ${open ? 'sidebar--open' : ''}`}>
      <header className="sidebar__header">
        <Avatar name={me.name} color={me.color} />
        <div className="sidebar__me">
          <strong>{me.name}</strong>
          <span className="status status--online">в сети</span>
        </div>
      </header>

      <nav className="sidebar__section sidebar__rooms">
        <div className="sidebar__section-title">
          Каналы
          <button
            className="sidebar__add"
            title="Создать канал"
            onClick={() => setCreating((v) => !v)}
          >
            +
          </button>
        </div>

        {creating && (
          <form className="sidebar__create" onSubmit={submitRoom}>
            <input
              autoFocus
              value={draft}
              maxLength={24}
              placeholder="Название канала"
              onChange={(e) => setDraft(e.target.value)}
            />
            <button type="submit" title="Создать">✓</button>
          </form>
        )}

        <ul>
          {rooms.map((room) => (
            <li key={room.id}>
              <button
                className={`sidebar__room ${room.id === activeRoom ? 'sidebar__room--active' : ''}`}
                onClick={() => {
                  onJoinRoom(room.id);
                  onNavigate();
                }}
              >
                <span className="sidebar__room-hash">#</span>
                <span className="sidebar__room-label">{room.label}</span>
                {(unread[room.id] ?? 0) > 0 && room.id !== activeRoom && (
                  <span className="sidebar__badge">{unread[room.id]}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar__section sidebar__users">
        <div className="sidebar__section-title">В сети — {users.length}</div>
        <ul>
          {users.map((u) => (
            <li key={u.id} className={`sidebar__user ${u.id === me.id ? 'sidebar__user--me' : ''}`}>
              <Avatar name={u.name} color={u.color} size={28} />
              <span className="sidebar__user-name">{u.name}</span>
              {u.id === me.id && <span className="sidebar__you">вы</span>}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
