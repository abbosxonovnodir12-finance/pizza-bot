import Stories from '../components/Stories.jsx';
import PizzaImage from '../components/PizzaImage.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { ChevronRightIcon, FlameIcon, GridIcon, SearchIcon, SlidersIcon } from '../components/Icons.jsx';
import { tgUser } from '../telegram.js';
import { CATEGORY_ICONS, discountPercent, etaMinutes, statusLabel } from '../utils.js';

const CATEGORY_TITLES = { Pizza: 'Pitsalar', Burger: 'Burgerlar', Lavash: 'Lavashlar', Ichimlik: 'Ichimliklar' };

export default function Home({ profile, products, categories, options, activeOrder, onOpenProduct, onNavigate }) {
  const name = profile?.firstName || tgUser?.first_name || 'Mehmon';
  const discountOf = (p) => discountPercent(p.oldPrice, p.newPrice);

  const offer = [...products].filter((p) => discountOf(p) > 0).sort((a, b) => discountOf(b) - discountOf(a))[0];

  // "Ommabop": har kategoriyadan navbatma-navbat
  const byCat = categories.map((c) => products.filter((p) => p.category === c));
  const popular = [];
  for (let i = 0; popular.length < 8 && byCat.some((l) => l[i]); i += 1) {
    byCat.forEach((l) => l[i] && popular.length < 8 && popular.push(l[i]));
  }

  return (
    <div className="page home">
      <header className="topbar">
        <button className="glass-round" onClick={() => onNavigate('catalog')} aria-label="Menyu">
          <GridIcon size={20} />
        </button>
        <button className="avatar" onClick={() => onNavigate('profile')} aria-label="Profil">
          {name.charAt(0).toUpperCase()}
          <span className="avatar-dot" />
        </button>
      </header>

      <p className="hello">Salom, {name} 👋</p>
      <h1 className="headline">
        Mazali taom,
        <br />
        <span>Zo'r kayfiyat!</span>
      </h1>

      <button className="search glass" onClick={() => onNavigate('catalog')}>
        <SearchIcon size={20} />
        <span className="search-text">Sevimli taomingizni qidiring</span>
        <span className="search-filter">
          <SlidersIcon size={18} />
        </span>
      </button>

      <div className="cat-tiles">
        {categories.map((c) => (
          <button key={c} className="cat-tile glass" onClick={() => onNavigate('catalog', { category: c })}>
            <span className="cat-emoji">{CATEGORY_ICONS[c] || '🍽️'}</span>
            <span className="cat-name">{c}</span>
          </button>
        ))}
      </div>

      {activeOrder && (
        <button className="active-order glass" onClick={() => onNavigate('track', { orderId: activeOrder.id })}>
          <span className="ao-icon">🛵</span>
          <span className="ao-text">
            <b>
              Buyurtma №{activeOrder.id} · {statusLabel(activeOrder.status)}
            </b>
            <span>Taxminan {etaMinutes(activeOrder)} daqiqa · Jonli kuzatish</span>
          </span>
          <ChevronRightIcon size={20} />
        </button>
      )}

      {offer && (
        <section className="offer glass" onClick={() => onOpenProduct(offer)}>
          <div className="offer-text">
            <span className="offer-kicker">
              <FlameIcon size={14} /> Cheklangan taklif
            </span>
            <h2>
              {offer.name}
              <br />
              <span>{offer.category}</span>
            </h2>
            <span className="btn btn-primary btn-sm">Buyurtma berish</span>
          </div>
          <div className="offer-img">
            <PizzaImage src={offer.imageUrl} alt={offer.name} />
          </div>
          <div className="offer-badge">
            <b>{discountOf(offer)}%</b>
            <small>chegirma</small>
          </div>
        </section>
      )}

      <Stories />

      {popular.length > 0 && (
        <>
          <div className="section-head">
            <h3>Ommabop</h3>
            <button onClick={() => onNavigate('catalog', { category: 'all' })}>Barchasi</button>
          </div>
          <div className="h-scroll">
            {popular.map((p) => (
              <ProductCard key={p.id} product={p} options={options} onOpen={onOpenProduct} compact />
            ))}
          </div>
        </>
      )}

      {categories.map((c) => {
        const list = products.filter((p) => p.category === c);
        if (!list.length) return null;
        return (
          <div key={c}>
            <div className="section-head">
              <h3>
                {CATEGORY_ICONS[c] || '🍽️'} {CATEGORY_TITLES[c] || c}
              </h3>
              <button onClick={() => onNavigate('catalog', { category: c })}>Barchasi</button>
            </div>
            <div className="h-scroll">
              {list.map((p) => (
                <ProductCard key={p.id} product={p} options={options} onOpen={onOpenProduct} compact />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
