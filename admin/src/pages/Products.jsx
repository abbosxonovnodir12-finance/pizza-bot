import { useCallback, useEffect, useState } from 'react';
import { api } from '../api.js';
import { formatPrice } from '../utils.js';
import ProductModal from '../components/ProductModal.jsx';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);

  const load = useCallback(async () => {
    try {
      const data = await api.products();
      setProducts(data.products);
      setCategories(data.categories);
      setError('');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async (form) => {
    if (editing?.id) await api.updateProduct(editing.id, form);
    else await api.createProduct(form);
    setEditing(null);
    await load();
  };

  const remove = async (product) => {
    if (!window.confirm(`"${product.name}" pizzasini o'chirishni tasdiqlaysizmi?`)) return;
    try {
      await api.deleteProduct(product.id);
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Mahsulotlar</h1>
          <p className="muted">Jami: {products.length} ta pizza</p>
        </div>
        <button className="btn btn-primary" onClick={() => setEditing({})}>
          + Yangi pizza
        </button>
      </div>

      {error && <div className="alert">{error}</div>}

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Rasm</th>
              <th>Nomi</th>
              <th>Kategoriya</th>
              <th>Eski narx</th>
              <th>Yangi narx</th>
              <th className="right">Amallar</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="table-empty">
                  Yuklanmoqda...
                </td>
              </tr>
            )}
            {!loading && products.length === 0 && (
              <tr>
                <td colSpan={6} className="table-empty">
                  Mahsulotlar yo'q. Birinchi pizzani qo'shing!
                </td>
              </tr>
            )}
            {products.map((p) => (
              <tr key={p.id}>
                <td>
                  <img className="thumb" src={p.imageUrl} alt={p.name} onError={(e) => (e.currentTarget.style.visibility = 'hidden')} />
                </td>
                <td>
                  <div className="cell-main">{p.name}</div>
                  <div className="cell-sub clamp">{p.description}</div>
                </td>
                <td>
                  <span className="chip">{p.category}</span>
                </td>
                <td className="nowrap muted strike">{p.oldPrice ? formatPrice(p.oldPrice) : '—'}</td>
                <td className="nowrap price">{formatPrice(p.newPrice)}</td>
                <td className="right nowrap">
                  <button className="btn btn-light btn-sm" onClick={() => setEditing(p)}>
                    ✏️ Tahrirlash
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => remove(p)}>
                    🗑 O'chirish
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <ProductModal product={editing} categories={categories} onClose={() => setEditing(null)} onSave={save} />
      )}
    </div>
  );
}
