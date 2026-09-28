import { useState } from 'react';
import Avatar from './Avatar';
import { GITHUB_URL } from '../config';

/** Ссылка на исходники — закреплена внизу сайдбара */
function SidebarFooter() {
  return (
    <footer className="sidebar__footer">
      <a className="sidebar__github" href={GITHUB_URL} target="_blank" rel="noreferrer">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.72-1.54-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 2.89-.39c.98 0 1.97.13 2.89.39 2.2-1.49 3.16-1.18 3.16-1.18.63 1.59.24 2.76.12 3.05.74.81 1.18 1.83 1.18 3.09 0 4.41-2.69 5.38-5.25 5.67.41.35.77 1.05.77 2.12 0 1.53-.01 2.76-.01 3.14 0 .3.2.67.8.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
        </svg>
        <span>Исходники на GitHub</span>
      </a>
    </footer>
  );
}

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

      <SidebarFooter />
    </aside>
  );
}
