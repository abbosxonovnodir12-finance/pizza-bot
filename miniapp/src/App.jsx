import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from './api.js';
import { startTrackId, tg } from './telegram.js';
import { storage } from './utils.js';
import { useCart } from './CartContext.jsx';
import Splash from './components/Splash.jsx';
import Onboarding from './components/Onboarding.jsx';
import BottomNav from './components/BottomNav.jsx';
import ProductSheet from './components/ProductSheet.jsx';
import Home from './pages/Home.jsx';
import Catalog from './pages/Catalog.jsx';
import Cart from './pages/Cart.jsx';
import Track from './pages/Track.jsx';
import Profile from './pages/Profile.jsx';

const SPLASH_MIN_MS = 1800;

export default function App() {
  const [splash, setSplash] = useState('show');
  const [onboarded, setOnboarded] = useState(() => storage.get('onboarded') === '1');
  const [tab, setTab] = useState('home');
  const [selected, setSelected] = useState(null);
  const [catalogCategory, setCatalogCategory] = useState('all');
  const [trackId, setTrackId] = useState(startTrackId);
  const [data, setData] = useState({ products: [], categories: [], colaPrice: 5000, colaName: 'Coca-Cola', options: null });
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { syncWithProducts } = useCart();
  const startedAt = useRef(Date.now());

  const loadOrders = useCallback(async () => {
    try {
      const { orders: list } = await api.myOrders();
      setOrders(list);
    } catch {
      /* buyurtmalar ikkinchi darajali */
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [me, catalog] = await Promise.all([api.me(), api.products()]);
      setProfile(me.profile);
      setData(catalog);
      syncWithProducts(catalog.products, catalog.options);
      loadOrders();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [syncWithProducts, loadOrders]);

  useEffect(() => {
    load();
  }, [load]);

  const openTrackOnStart = useRef(Boolean(trackId));
  useEffect(() => {
    if (!loading && openTrackOnStart.current) {
      openTrackOnStart.current = false;
      setTab('track');
    }
  }, [loading]);

  const splashScheduled = useRef(false);
  useEffect(() => {
    if (loading || splashScheduled.current) return;
    splashScheduled.current = true;
    const wait = Math.max(0, SPLASH_MIN_MS - (Date.now() - startedAt.current));
    setTimeout(() => setSplash('leaving'), wait);
    setTimeout(() => setSplash('done'), wait + 450);
  }, [loading]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [tab]);

  useEffect(() => {
    const bb = tg?.BackButton;
    if (!bb || !tg.initData) return undefined;
    const visible = Boolean(selected) || tab !== 'home';
    const handler = () => (selected ? setSelected(null) : setTab('home'));
    try {
      if (visible) {
        bb.show();
        bb.onClick(handler);
      } else {
        bb.hide();
      }
    } catch {
      return undefined;
    }
    return () => {
      try {
        bb.offClick(handler);
      } catch {
        /* ignore */
      }
    };
  }, [selected, tab]);

  const navigate = useCallback((next, params = {}) => {
    if (next === 'catalog' && params.category) setCatalogCategory(params.category);
    if (next === 'track' && params.orderId) setTrackId(params.orderId);
    setTab(next);
  }, []);

  const onOrderPlaced = useCallback(
    (order) => {
      setProfile((p) => (p && !p.phone ? { ...p, phone: order.phone } : p));
      setOrders((list) => [order, ...list]);
      setTrackId(order.id);
    },
    []
  );

  const finishOnboarding = () => {
    storage.set('onboarded', '1');
    setOnboarded(true);
  };

  const activeOrder = orders.find((o) => o.status !== 'DELIVERED') || null;

  let content;
  if (!onboarded) {
    content = <Onboarding onFinish={finishOnboarding} />;
  } else if (error) {
    content = (
      <div className="center-screen">
        <div className="empty-circle">😕</div>
        <h3>Xatolik yuz berdi</h3>
        <p className="muted">{error}</p>
        <button className="btn btn-primary" onClick={load}>
          Qayta urinish
        </button>
      </div>
    );
  } else if (loading) {
    content = (
      <div className="center-screen">
        <div className="spinner" />
      </div>
    );
  } else {
    const pages = {
      home: (
        <Home
          profile={profile}
          products={data.products}
          categories={data.categories}
          options={data.options}
          activeOrder={activeOrder}
          onOpenProduct={setSelected}
          onNavigate={navigate}
        />
      ),
      catalog: (
        <Catalog
          products={data.products}
          categories={data.categories}
          options={data.options}
          initialCategory={catalogCategory}
          onOpenProduct={setSelected}
        />
      ),
      track: (
        <Track
          orderId={trackId}
          orders={orders}
          onSelectOrder={setTrackId}
          onOrderUpdate={(o) => setOrders((list) => list.map((x) => (x.id === o.id ? o : x)))}
          onNavigate={navigate}
        />
      ),
      cart: (
        <Cart
          profile={profile}
          colaPrice={data.colaPrice}
          colaName={data.colaName}
          onNavigate={navigate}
          onOrderPlaced={onOrderPlaced}
        />
      ),
      profile: (
        <Profile profile={profile} products={data.products} options={data.options} orders={orders} onNavigate={navigate} />
      ),
    };
    content = (
      <>
        {pages[tab]}
        <BottomNav active={tab} onChange={(t) => navigate(t)} hasActiveOrder={Boolean(activeOrder)} />
        <ProductSheet product={selected} options={data.options} onClose={() => setSelected(null)} />
      </>
    );
  }

  return (
    <div className="app">
      {content}
      {splash !== 'done' && <Splash leaving={splash === 'leaving'} />}
    </div>
  );
}
