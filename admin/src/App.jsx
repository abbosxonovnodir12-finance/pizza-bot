import { useEffect, useState } from 'react';
import { auth, setUnauthorizedHandler } from './api.js';
import Login from './pages/Login.jsx';
import Orders from './pages/Orders.jsx';
import Products from './pages/Products.jsx';

const PAGES = [
  { id: 'orders', icon: '📦', label: 'Buyurtmalar' },
  { id: 'products', icon: '🍕', label: 'Mahsulotlar' },
];

const pageFromHash = () => (window.location.hash === '#products' ? 'products' : 'orders');

export default function App() {
  const [loggedIn, setLoggedIn] = useState(Boolean(auth.get()));
  const [page, setPage] = useState(pageFromHash);

  useEffect(() => {
    setUnauthorizedHandler(() => setLoggedIn(false));
    const onHash = () => setPage(pageFromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  if (!loggedIn) return <Login onLogin={() => setLoggedIn(true)} />;

  const logout = () => {
    auth.clear();
    setLoggedIn(false);
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand">
          <span>🍕</span> TEZ Admin
        </div>
        <nav>
          {PAGES.map((p) => (
            <a key={p.id} href={`#${p.id}`} className={`nav-link ${page === p.id ? 'active' : ''}`}>
              <span>{p.icon}</span> {p.label}
            </a>
          ))}
        </nav>
        <button className="nav-link logout" onClick={logout}>
          <span>🚪</span> Chiqish
        </button>
      </aside>
      <main className="content">{page === 'orders' ? <Orders /> : <Products />}</main>
    </div>
  );
}
