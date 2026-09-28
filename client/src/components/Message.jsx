import Avatar from './Avatar';

const fmtTime = (t) =>
  new Date(t).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

/** Одно сообщение: обычное, своё (справа) или системное (по центру) */
export default function Message({ message, me }) {
  if (message.type === 'system') {
    return (
      <div className="message message--system">
        <span>{message.text}</span>
        <time>{fmtTime(message.time)}</time>
      </div>
    );
  }

  const own = message.user.id === me.id;

  return (
    <div className={`message ${own ? 'message--own' : 'message--other'}`}>
      {!own && <Avatar name={message.user.name} color={message.user.color} size={34} />}
      <div className="message__body">
        {!own && (
          <div className="message__author" style={{ color: message.user.color }}>
            {message.user.name}
          </div>
        )}
        <div className="message__bubble">
          <div className="message__text">{message.text}</div>
          <time className="message__time">{fmtTime(message.time)}</time>
        </div>
      </div>
    </div>
  );
}
