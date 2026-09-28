import { useRef, useState } from 'react';

const EMOJIS = ['😀', '😂', '😍', '😎', '🤔', '👍', '🔥', '❤️', '🎉', '😮', '😢', '🤝'];

/** Поле ввода: авторастущая textarea, Enter — отправить, Shift+Enter — перенос строки */
export default function MessageInput({ onSend, onTyping }) {
  const [text, setText] = useState('');
  const [emojiOpen, setEmojiOpen] = useState(false);
  const areaRef = useRef(null);
  const typingRef = useRef(false);
  const stopTimer = useRef(null);

  const autoGrow = () => {
    const el = areaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  };

  // Шлём «печатает…» один раз, пока пользователь набирает текст;
  // автоматически сбрасываем через 1.5 с тишины
  const signalTyping = (value) => {
    const typing = value.trim().length > 0;
    if (typing && !typingRef.current) {
      typingRef.current = true;
      onTyping(true);
    }
    clearTimeout(stopTimer.current);
    if (typing) {
      stopTimer.current = setTimeout(() => {
        typingRef.current = false;
        onTyping(false);
      }, 1500);
    } else if (typingRef.current) {
      typingRef.current = false;
      onTyping(false);
    }
  };

  const handleChange = (e) => {
    setText(e.target.value);
    autoGrow();
    signalTyping(e.target.value);
  };

  const send = () => {
    const value = text.trim();
    if (!value) return;
    onSend(value);
    setText('');
    signalTyping('');
    requestAnimationFrame(autoGrow);
    areaRef.current?.focus();
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const insertEmoji = (emoji) => {
    const el = areaRef.current;
    if (!el) return;
    const start = el.selectionStart ?? text.length;
    const end = el.selectionEnd ?? text.length;
    setText(text.slice(0, start) + emoji + text.slice(end));
    requestAnimationFrame(() => {
      const pos = start + emoji.length;
      el.focus();
      el.setSelectionRange(pos, pos);
      autoGrow();
    });
  };

  return (
    <div className="input-area">
      {emojiOpen && (
        <div className="input-area__emojis">
          {EMOJIS.map((emoji) => (
            <button key={emoji} type="button" onClick={() => insertEmoji(emoji)}>
              {emoji}
            </button>
          ))}
        </div>
      )}

      <form className="input-area__row" onSubmit={(e) => { e.preventDefault(); send(); }}>
        <button
          type="button"
          className="input-area__emoji-btn"
          title="Эмодзи"
          onClick={() => setEmojiOpen((v) => !v)}
        >
          😊
        </button>
        <textarea
          ref={areaRef}
          rows={1}
          value={text}
          maxLength={2000}
          onChange={handleChange}
          onKeyDown={onKeyDown}
          placeholder="Написать сообщение… (Enter — отправить)"
        />
        <button type="submit" className="input-area__send" disabled={!text.trim()} title="Отправить">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </form>
    </div>
  );
}
