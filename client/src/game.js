/**
 * Игровая логика «Печенько-кликера»:
 * постройки, улучшения, форматирование чисел, сохранение и офлайн-доход.
 */

export const COST_GROWTH = 1.15;      // рост цены постройки за каждую купленную
export const OFFLINE_CAP_H = 8;       // максимум офлайн-дохода — 8 часов
export const SAVE_KEY = 'clicker-save-v1';

/** Постройки — пассивный доход в секунду */
export const BUILDINGS = [
  { id: 'cursor',  emoji: '🖱️', name: 'Курсор',  desc: 'Щёлкает вместо вас',        baseCost: 15,       cps: 0.1 },
  { id: 'grandma', emoji: '👵', name: 'Бабушка', desc: 'Печёт с любовью',           baseCost: 100,      cps: 1 },
  { id: 'farm',    emoji: '🌾', name: 'Ферма',   desc: 'Поля печеневого злака',     baseCost: 1_100,    cps: 8 },
  { id: 'mine',    emoji: '⛏️', name: 'Шахта',   desc: 'Добывает печеневую руду',   baseCost: 12_000,   cps: 47 },
  { id: 'factory', emoji: '🏭', name: 'Завод',   desc: 'Конвейер свежего печенья',  baseCost: 130_000,  cps: 260 },
  { id: 'bank',    emoji: '🏦', name: 'Банк',    desc: 'Вклады под честное слово',  baseCost: 1_400_000, cps: 1_400 },
  { id: 'portal',  emoji: '🌀', name: 'Портал',  desc: 'Печенье из других миров',   baseCost: 20_000_000, cps: 7_800 },
];

/** Улучшения — множители к силе клика */
export const CLICK_UPGRADES = [
  { id: 'finger',  emoji: '👆', name: 'Крепкий палец',      desc: 'Сила клика ×2', cost: 100,        mult: 2 },
  { id: 'knuckle', emoji: '🥊', name: 'Кастет',             desc: 'Сила клика ×2', cost: 2_500,      mult: 2 },
  { id: 'hammer',  emoji: '🔨', name: 'Печной молоток',     desc: 'Сила клика ×2', cost: 50_000,     mult: 2 },
  { id: 'tractor', emoji: '🚜', name: 'Трактор',            desc: 'Сила клика ×2', cost: 1_000_000,  mult: 2 },
  { id: 'laser',   emoji: '🔫', name: 'Космический лазер',  desc: 'Сила клика ×3', cost: 50_000_000, mult: 3 },
];

/** Цена следующей постройки этого типа */
export const costOf = (building, owned) =>
  Math.ceil(building.baseCost * COST_GROWTH ** owned);

/** Доход в секунду для набора построек */
export const cpsOf = (counts) =>
  BUILDINGS.reduce((sum, b) => sum + (counts[b.id] ?? 0) * b.cps, 0);

/** Сила клика для купленных улучшений */
export const clickPowerOf = (upgrades) =>
  CLICK_UPGRADES.reduce((mult, u) => (upgrades.includes(u.id) ? mult * u.mult : mult), 1);

export const freshGame = () => ({
  cookies: 0,
  total: 0,
  clicks: 0,
  counts: {},
  upgrades: [],
});

/**
 * Загружает сохранение и начисляет офлайн-доход.
 * Возвращает { state, offlineGain }.
 */
export function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return { state: freshGame(), offlineGain: 0 };

    const saved = JSON.parse(raw);
    const state = {
      ...freshGame(),
      ...saved,
      counts: { ...(saved.counts ?? {}) },
      upgrades: [...(saved.upgrades ?? [])],
    };

    const elapsedSec = Math.min(
      (Date.now() - (saved.savedAt ?? Date.now())) / 1000,
      OFFLINE_CAP_H * 3600,
    );
    const offlineGain = Math.floor(cpsOf(state.counts) * elapsedSec);
    if (offlineGain > 0) {
      state.cookies += offlineGain;
      state.total += offlineGain;
    }
    return { state, offlineGain };
  } catch {
    return { state: freshGame(), offlineGain: 0 };
  }
}

export function saveGame(state) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ ...state, savedAt: Date.now() }));
  } catch {
    /* приватный режим и т.п. — просто играем без сохранения */
  }
}

/** Красивые числа: 950 → «950», 1 234 → «1,23 K», 5,6 млн → «5,60 M» */
export function fmt(n) {
  if (!Number.isFinite(n)) return '0';
  if (n < 1000) {
    return n < 10 && n % 1 !== 0
      ? n.toFixed(1).replace('.', ',')
      : Math.floor(n).toLocaleString('ru-RU');
  }
  const UNITS = ['K', 'M', 'B', 'T', 'Qa'];
  let v = n;
  let i = -1;
  while (v >= 1000 && i < UNITS.length - 1) {
    v /= 1000;
    i++;
  }
  const digits = v < 10 ? 2 : v < 100 ? 1 : 0;
  return `${v.toFixed(digits).replace('.', ',')} ${UNITS[i]}`;
}
