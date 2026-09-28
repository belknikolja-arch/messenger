import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GITHUB_URL } from './config';
import {
  BUILDINGS,
  CLICK_UPGRADES,
  freshGame,
  loadGame,
  saveGame,
  clickPowerOf,
  costOf,
  cpsOf,
} from './game';
import Cookie from './components/Cookie';
import Shop from './components/Shop';

const TICK_MS = 100;        // игровой цикл — 10 раз в секунду
const AUTOSAVE_MS = 5_000;  // автосохранение

export default function App() {
  const initial = useRef(loadGame());
  const [game, setGame] = useState(initial.current.state);
  const [offlineGain, setOfflineGain] = useState(initial.current.offlineGain);

  const cps = useMemo(() => cpsOf(game.counts), [game.counts]);
  const clickPower = useMemo(() => clickPowerOf(game.upgrades), [game.upgrades]);
  const buildingCount = useMemo(
    () => Object.values(game.counts).reduce((s, n) => s + n, 0),
    [game.counts],
  );

  /* Производные значения в рефах, чтобы игровой цикл не пересоздавался */
  const cpsRef = useRef(cps);
  cpsRef.current = cps;
  const gameRef = useRef(game);
  gameRef.current = game;

  /* Игровой цикл: пассивный доход */
  useEffect(() => {
    const timer = setInterval(() => {
      if (cpsRef.current > 0) {
        const gain = cpsRef.current * (TICK_MS / 1000);
        setGame((g) => ({ ...g, cookies: g.cookies + gain, total: g.total + gain }));
      }
    }, TICK_MS);
    return () => clearInterval(timer);
  }, []);

  /* Автосохранение + сохранение при уходе со страницы */
  useEffect(() => {
    const timer = setInterval(() => saveGame(gameRef.current), AUTOSAVE_MS);
    const onLeave = () => saveGame(gameRef.current);
    window.addEventListener('beforeunload', onLeave);
    return () => {
      clearInterval(timer);
      window.removeEventListener('beforeunload', onLeave);
      saveGame(gameRef.current);
    };
  }, []);

  /* Клик по печенью */
  const handleClick = useCallback(() => {
    const power = clickPowerOf(gameRef.current.upgrades);
    setGame((g) => ({
      ...g,
      cookies: g.cookies + power,
      total: g.total + power,
      clicks: g.clicks + 1,
    }));
  }, []);

  /* Покупка постройки */
  const handleBuyBuilding = useCallback((id) => {
    setGame((g) => {
      const building = BUILDINGS.find((b) => b.id === id);
      const owned = g.counts[id] ?? 0;
      const price = costOf(building, owned);
      if (g.cookies < price) return g;
      return {
        ...g,
        cookies: g.cookies - price,
        counts: { ...g.counts, [id]: owned + 1 },
      };
    });
  }, []);

  /* Покупка улучшения клика */
  const handleBuyUpgrade = useCallback((id) => {
    setGame((g) => {
      const upgrade = CLICK_UPGRADES.find((u) => u.id === id);
      if (!upgrade || g.upgrades.includes(id) || g.cookies < upgrade.cost) return g;
      return {
        ...g,
        cookies: g.cookies - upgrade.cost,
        upgrades: [...g.upgrades, id],
      };
    });
  }, []);

  /* Сброс прогресса */
  const handleReset = useCallback(() => {
    if (window.confirm('Сбросить весь прогресс? Это необратимо!')) {
      const fresh = freshGame();
      setGame(fresh);
      saveGame(fresh);
    }
  }, []);

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar__title">🍪 Печенько-кликер</div>
        <div className="topbar__actions">
          <a className="topbar__link" href={GITHUB_URL} target="_blank" rel="noreferrer">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.72-1.54-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 2.89-.39c.98 0 1.97.13 2.89.39 2.2-1.49 3.16-1.18 3.16-1.18.63 1.59.24 2.76.12 3.05.74.81 1.18 1.83 1.18 3.09 0 4.41-2.69 5.38-5.25 5.67.41.35.77 1.05.77 2.12 0 1.53-.01 2.76-.01 3.14 0 .3.2.67.8.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
            </svg>
            GitHub
          </a>
          <button className="topbar__reset" onClick={handleReset} title="Начать заново">
            🔄 Сброс
          </button>
        </div>
      </header>

      <main className="game">
        <Cookie
          cookies={game.cookies}
          total={game.total}
          clicks={game.clicks}
          cps={cps}
          clickPower={clickPower}
          buildingCount={buildingCount}
          onClick={handleClick}
        />
        <Shop
          cookies={game.cookies}
          counts={game.counts}
          upgrades={game.upgrades}
          onBuyBuilding={handleBuyBuilding}
          onBuyUpgrade={handleBuyUpgrade}
        />
      </main>

      {offlineGain > 0 && (
        <div className="toast" role="status">
          <span>🌙 Пока вас не было, испечено: <strong>+{offlineGain.toLocaleString('ru-RU')} 🍪</strong></span>
          <button onClick={() => setOfflineGain(0)} aria-label="Закрыть">✕</button>
        </div>
      )}
    </div>
  );
}
