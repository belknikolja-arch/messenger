import { BUILDINGS, CLICK_UPGRADES, costOf, fmt } from '../game';

/** Карточка постройки: покупается кликом по всей карточке */
function BuildingCard({ building, owned, cookies, onBuy }) {
  const price = costOf(building, owned);
  const canBuy = cookies >= price;

  return (
    <button
      className={`card ${canBuy ? 'card--can' : ''}`}
      disabled={!canBuy}
      onClick={() => onBuy(building.id)}
      title={building.desc}
    >
      <span className="card__emoji" aria-hidden="true">{building.emoji}</span>
      <span className="card__body">
        <span className="card__name">{building.name}</span>
        <span className="card__desc">
          +{building.cps % 1 === 0 ? building.cps.toLocaleString('ru-RU') : building.cps} /сек
        </span>
      </span>
      <span className="card__side">
        <span className="card__cost">{fmt(price)} 🍪</span>
        <span className="card__owned">{owned > 0 && `× ${owned}`}</span>
      </span>
    </button>
  );
}

/** Карточка улучшения силы клика */
function UpgradeCard({ upgrade, cookies, onBuy }) {
  const canBuy = cookies >= upgrade.cost;
  return (
    <button
      className={`card card--upgrade ${canBuy ? 'card--can' : ''}`}
      disabled={!canBuy}
      onClick={() => onBuy(upgrade.id)}
      title={upgrade.desc}
    >
      <span className="card__emoji" aria-hidden="true">{upgrade.emoji}</span>
      <span className="card__body">
        <span className="card__name">{upgrade.name}</span>
        <span className="card__desc">{upgrade.desc}</span>
      </span>
      <span className="card__side">
        <span className="card__cost">{fmt(upgrade.cost)} 🍪</span>
      </span>
    </button>
  );
}

/** Магазин: улучшения клика + постройки с пассивным доходом */
export default function Shop({ cookies, counts, upgrades, onBuyBuilding, onBuyUpgrade }) {
  const nextUpgrades = CLICK_UPGRADES
    .filter((u) => !upgrades.includes(u.id))
    .slice(0, 2);

  return (
    <aside className="shop">
      <h2 className="shop__title">🛒 Магазин</h2>

      {nextUpgrades.length > 0 && (
        <>
          <div className="shop__section">Улучшения клика</div>
          {nextUpgrades.map((u) => (
            <UpgradeCard key={u.id} upgrade={u} cookies={cookies} onBuy={onBuyUpgrade} />
          ))}
        </>
      )}

      <div className="shop__section">Постройки</div>
      {BUILDINGS.map((b) => (
        <BuildingCard
          key={b.id}
          building={b}
          owned={counts[b.id] ?? 0}
          cookies={cookies}
          onBuy={onBuyBuilding}
        />
      ))}

      <p className="shop__hint">
        Цены растут на 15% с каждой покупкой. Прогресс сохраняется автоматически,
        а офлайн-доход капает до 8 часов 😉
      </p>
    </aside>
  );
}
