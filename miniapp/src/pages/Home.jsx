import Stories from '../components/Stories.jsx';
import Logo from '../components/Logo.jsx';
import PizzaImage from '../components/PizzaImage.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { ChevronDownIcon, ChevronRightIcon, PinIcon, SearchIcon } from '../components/Icons.jsx';
import { tgUser } from '../telegram.js';
import { etaMinutes, statusLabel, storage } from '../utils.js';

const PROMO_IMG = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80';

const CATEGORY_EMOJI = { Klassik: '🍕', "Go'shtli": '🥩', Pishloqli: '🧀', Vegetarian: '🥦', Achchiq: '🌶️' };

export default function Home({ profile, products, categories, options, activeOrder, onOpenProduct, onNavigate }) {
  const name = profile?.firstName || tgUser?.first_name || 'Mehmon';
  const address = storage.get('last_address');
  const popular = products.slice(0, 4);

  return (
    <div className="page">
      <header className="topbar">
        <div className="loc">
          <span className="loc-label">Yetkazish manzili</span>
          <button className="loc-value" onClick={() => onNavigate('cart')}>
            <PinIcon size={17} />
            <span>{address || 'Manzilni kiriting'}</span>
            <ChevronDownIcon size={16} />
          </button>
        </div>
        <button className="avatar" onClick={() => onNavigate('profile')} aria-label="Profil">
          {name.charAt(0).toUpperCase()}
        </button>
      </header>

      <h1 className="greet">
        Salom, {name}!
        <span>
          Bugun qaysi pizzani <em>tez</em> yetkazaylik?
        </span>
      </h1>

      <button className="search" onClick={() => onNavigate('catalog')}>
        <SearchIcon size={20} />
        <span>Pizza qidirish...</span>
      </button>

      <Stories />

      {activeOrder && (
        <button className="active-order" onClick={() => onNavigate('track', { orderId: activeOrder.id })}>
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

      <section className="promo-card" onClick={() => onNavigate('catalog')}>
        <div className="promo-text">
          <Logo size="sm" light />
          <h2>Issiq pizza 30 daqiqada</h2>
          <p>Buyurtma bering va kuryerni xaritada jonli kuzating</p>
          <span className="promo-btn">Buyurtma berish</span>
        </div>
        <div className="promo-img">
          <PizzaImage src={PROMO_IMG} alt="Pizza" />
        </div>
      </section>

      {categories.length > 0 && (
        <>
          <div className="section-head">
            <h3>Kategoriyalar</h3>
          </div>
          <div className="cats">
            {['all', ...categories].map((c) => (
              <button key={c} className="cat" onClick={() => onNavigate('catalog', { category: c })}>
                <span className="cat-icon">{c === 'all' ? '🔥' : CATEGORY_EMOJI[c] || '🍕'}</span>
                <span className="cat-name">{c === 'all' ? 'Barchasi' : c}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {popular.length > 0 && (
        <>
          <div className="section-head">
            <h3>Ommabop pizzalar</h3>
            <button onClick={() => onNavigate('catalog', { category: 'all' })}>Barchasi</button>
          </div>
          <div className="grid">
            {popular.map((p) => (
              <ProductCard key={p.id} product={p} options={options} onOpen={onOpenProduct} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
