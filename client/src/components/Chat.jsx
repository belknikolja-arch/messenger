import { useLayoutEffect, useRef } from 'react';
import Message from './Message';
import MessageInput from './MessageInput';

/** Основная область: шапка канала, лента сообщений, индикатор набора, поле ввода */
export default function Chat({
  me,
  room,
  onlineCount,
  messages,
  typingNames,
  onSend,
  onTyping,
  onOpenSidebar,
}) {
  const listRef = useRef(null);
  const stickToBottom = useRef(true);

  // Автоскролл вниз — только если пользователь и так был у низа ленты
  const handleScroll = () => {
    const el = listRef.current;
    if (!el) return;
    stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };

  useLayoutEffect(() => {
    const el = listRef.current;
    if (el && stickToBottom.current) el.scrollTop = el.scrollHeight;
  }, [messages]);

  return (
    <main className="chat">
      <header className="chat__header">
        <button className="chat__burger" onClick={onOpenSidebar} aria-label="Меню">☰</button>
        <div className="chat__heading">
          <h2 className="chat__title"># {room.label}</h2>
          <span className="chat__subtitle">{onlineCount} в сети</span>
        </div>
      </header>

      <div className="chat__messages" ref={listRef} onScroll={handleScroll}>
        {messages.length === 0 ? (
          <div className="chat__empty">
            <div className="chat__empty-emoji">👋</div>
            <p>Канал <strong>#{room.label}</strong> пока пуст.</p>
            <p className="chat__empty-hint">Напишите первое сообщение!</p>
          </div>
        ) : (
          messages.map((m) => <Message key={m.id} message={m} me={me} />)
        )}
      </div>

      <div className="chat__typing" aria-live="polite">{typingText(typingNames)}</div>

      <MessageInput onSend={onSend} onTyping={onTyping} />
    </main>
  );
}

function typingText(names) {
  if (names.length === 0) return '';
  if (names.length === 1) return `${names[0]} печатает…`;
  if (names.length === 2) return `${names[0]} и ${names[1]} печатают…`;
  return 'Несколько человек печатают…';
}
