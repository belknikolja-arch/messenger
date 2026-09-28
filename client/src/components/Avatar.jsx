/** Круглый аватар с первой буквой имени (или эмодзи) на цветном фоне */
export default function Avatar({ name, color, size = 36 }) {
  const letter = Array.from((name || '?').trim())[0] ?? '?';
  return (
    <span
      className="avatar"
      style={{ background: color, width: size, height: size, fontSize: Math.round(size * 0.45) }}
      title={name}
    >
      {letter.toUpperCase()}
    </span>
  );
}
