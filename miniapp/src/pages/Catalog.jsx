import { useMemo, useState } from 'react';
import { haptic } from '../telegram.js';
import { useFavorites } from '../FavoritesContext.jsx';
import { CATEGORY_ICONS } from '../utils.js';
import ProductCard from '../components/ProductCard.jsx';
import { SearchIcon } from '../components/Icons.jsx';

export default function Catalog({ products, categories, options, initialCategory = 'all', onOpenProduct }) {
  const [active, setActive] = useState(initialCategory);
  const [query, setQuery] = useState('');
  const fav = useFavorites();

  const q = query.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      products.filter((p) => {
        if (active === 'fav' && !fav.has(p.id)) return false;
        if (active !== 'all' && active !== 'fav' && p.category !== active) return false;
        return !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
      }),
    [products, active, q, fav]
  );

  const chips = [
    { id: 'all', label: '🔥 Barchasi' },
    { id: 'fav', label: '❤️ Sevimlilar' },
    ...categories.map((c) => ({ id: c, label: `${CATEGORY_ICONS[c] || '🍽️'} ${c}` })),
  ];

  const grouped = active === 'all' && !q;

  const grid = (list) => (
    <div className="grid">
      {list.map((p) => (
        <ProductCard key={p.id} product={p} options={options} onOpen={onOpenProduct} />
      ))}
    </div>
  );

  return (
    <div className="page">
      <h1 className="page-title">Menyu</h1>

      <label className="search glass">
        <SearchIcon size={20} />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Pizza, burger, lavash..." />
      </label>

      <div className="chips">
        {chips.map((c) => (
          <button
            key={c.id}
            className={`chip ${active === c.id ? 'active' : ''}`}
            onClick={() => {
              haptic();
              setActive(c.id);
            }}
          >
            {c.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty">
          <div className="empty-circle">{active === 'fav' ? '🤍' : '🔎'}</div>
          <p className="muted">
            {active === 'fav' ? "Sevimlilar hali yo'q. Yoqqan taom ustidagi ♥ ni bosing." : 'Hech narsa topilmadi'}
          </p>
        </div>
      ) : grouped ? (
        categories.map((c) => {
          const list = filtered.filter((p) => p.category === c);
          if (!list.length) return null;
          return (
            <section key={c} className="menu-group">
              <h3 className="group-title">
                {CATEGORY_ICONS[c] || '🍽️'} {c} <span>{list.length}</span>
              </h3>
              {grid(list)}
            </section>
          );
        })
      ) : (
        grid(filtered)
      )}
    </div>
  );
}
