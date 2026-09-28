import { useState } from 'react';

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
