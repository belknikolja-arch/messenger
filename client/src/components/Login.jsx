import { useState } from 'react';
import { GITHUB_URL } from '../config';

/** Кнопка-ссылка на исходники в GitHub */
function GithubLink({ className }) {
  return (
    <a className={className} href={GITHUB_URL} target="_blank" rel="noreferrer">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.72-1.54-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 2.89-.39c.98 0 1.97.13 2.89.39 2.2-1.49 3.16-1.18 3.16-1.18.63 1.59.24 2.76.12 3.05.74.81 1.18 1.83 1.18 3.09 0 4.41-2.69 5.38-5.25 5.67.41.35.77 1.05.77 2.12 0 1.53-.01 2.76-.01 3.14 0 .3.2.67.8.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
      </svg>
      <span>Исходники на GitHub</span>
    </a>
  );
}

/** Экран входа: достаточно ввести имя, без регистрации */
export default function Login({ onJoin, connected }) {
  const [name, setName] = useState(() => localStorage.getItem('messenger:name') || '');

  const submit = (e) => {
    e.preventDefault();
    const clean = name.trim();
    if (clean.length < 2) return;
    localStorage.setItem('messenger:name', clean); // запомним для следующего визита
    onJoin(clean);
  };

  return (
    <div className="login">
      <form className="login__card" onSubmit={submit}>
        <div className="login__logo" aria-hidden="true">💬</div>
        <h1 className="login__title">Мессенджер</h1>
        <p className="login__subtitle">Чат в реальном времени — React + Node.js + Socket.IO</p>

        <input
          className="login__input"
          autoFocus
          value={name}
          maxLength={24}
          placeholder="Как вас называть?"
          onChange={(e) => setName(e.target.value)}
        />
        <button
          className="login__button"
          type="submit"
          disabled={!connected || name.trim().length < 2}
        >
          {connected ? 'Войти в чат' : 'Подключение…'}
        </button>
        {!connected && (
          <p className="login__hint">Нет соединения с сервером — попробуйте обновить страницу</p>
        )}
      </form>
    </div>
  );
}
