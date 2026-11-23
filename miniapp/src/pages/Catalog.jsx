import { useMemo, useState } from 'react';
import { haptic } from '../telegram.js';
import ProductCard from '../components/ProductCard.jsx';
import { SearchIcon } from '../components/Icons.jsx';

export default function Catalog({ products, categories, options, initialCategory = 'all', onOpenProduct }) {
  const [active, setActive] = useState(initialCategory);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter(
      (p) => (active === 'all' || p.category === active) && (!q || p.name.toLowerCase().includes(q))
    );
  }, [products, active, query]);

  return (
    <div className="page">
      <h1 className="page-title">Menyu</h1>

      <label className="search">
        <SearchIcon size={20} />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Pizza qidirish..." />
      </label>

      <div className="chips">
        {['all', ...categories].map((c) => (
          <button
            key={c}
            className={`chip ${active === c ? 'active' : ''}`}
            onClick={() => {
              haptic();
              setActive(c);
            }}
          >
            {c === 'all' ? 'Barchasi' : c}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty">
          <div className="empty-circle">🔎</div>
          <p className="muted">Hech narsa topilmadi</p>
        </div>
      ) : (
        <div className="grid">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} options={options} onOpen={onOpenProduct} />
          ))}
        </div>
      )}
    </div>
  );
}
