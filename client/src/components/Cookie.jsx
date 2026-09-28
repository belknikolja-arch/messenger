import { useState } from 'react';
import { fmt } from '../game';

/**
 * Центральная панель: счётчик печенья, большая кликабельная печенька
 * с всплывающими «+N» и блок статистики.
 */
export default function Cookie({ cookies, total, clicks, cps, clickPower, buildingCount, onClick }) {
  const [floats, setFloats] = useState([]);

  const handleClick = (e) => {
    onClick();

    // всплывающий «+N» в точке клика
    const rect = e.currentTarget.getBoundingClientRect();
    const id = crypto.randomUUID();
    const x = e.clientX - rect.left + (Math.random() * 36 - 18);
    const y = e.clientY - rect.top - 12;
    setFloats((f) => [...f.slice(-19), { id, x, y, text: `+${fmt(clickPower)}` }]);
    setTimeout(() => setFloats((f) => f.filter((t) => t.id !== id)), 900);
  };

  return (
    <section className="cookie-panel">
      <div className="counter">
        <h1 className="counter__value">{fmt(cookies)} 🍪</h1>
        <p className="counter__cps">
          {fmt(cps)} в секунду · клик +{fmt(clickPower)}
        </p>
      </div>

      <button className="cookie" onClick={handleClick} aria-label="Испечь печенье">
        <span className="cookie__emoji" aria-hidden="true">🍪</span>
        <span className="cookie__ring" aria-hidden="true" />
        {floats.map((f) => (
          <span key={f.id} className="float" style={{ left: f.x, top: f.y }}>
            {f.text}
          </span>
        ))}
      </button>

      <dl className="stats">
        <div><dt>Всего испечено</dt><dd>{fmt(total)}</dd></div>
        <div><dt>Кликов</dt><dd>{clicks.toLocaleString('ru-RU')}</dd></div>
        <div><dt>Построек</dt><dd>{buildingCount}</dd></div>
      </dl>
    </section>
  );
}
