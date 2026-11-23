import { useEffect, useState } from 'react';

const toForm = (p) => ({
  name: p.name || '',
  category: p.category || '',
  imageUrl: p.imageUrl || '',
  description: p.description || '',
  ingredients: (p.ingredients || []).join('\n'),
  oldPrice: p.oldPrice ?? '',
  newPrice: p.newPrice ?? '',
});

export default function ProductModal({ product, categories, onClose, onSave }) {
  const [form, setForm] = useState(() => toForm(product));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(product.id);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await onSave({
        ...form,
        ingredients: form.ingredients.split('\n').map((s) => s.trim()).filter(Boolean),
        oldPrice: form.oldPrice === '' ? null : Number(form.oldPrice),
        newPrice: Number(form.newPrice),
      });
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <form className="modal" onMouseDown={(e) => e.stopPropagation()} onSubmit={submit}>
        <div className="modal-head">
          <h2>{isEdit ? 'Pizzani tahrirlash' : 'Yangi pizza'}</h2>
          <button type="button" className="icon-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="image-preview">
            {form.imageUrl ? <img src={form.imageUrl} alt="" /> : <span>🍕</span>}
          </div>

          <div className="form-grid">
            <label className="form-field">
              <span>Nomi *</span>
              <input className="input" value={form.name} onChange={set('name')} placeholder="Masalan: Margarita" required />
            </label>
            <label className="form-field">
              <span>Kategoriya *</span>
              <input
                className="input"
                list="category-list"
                value={form.category}
                onChange={set('category')}
                placeholder="Masalan: Klassik"
                required
              />
              <datalist id="category-list">
                {categories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </label>
            <label className="form-field full">
              <span>Rasm manzili (URL) *</span>
              <input className="input" value={form.imageUrl} onChange={set('imageUrl')} placeholder="https://..." required />
            </label>
            <label className="form-field">
              <span>Eski narx (so'm)</span>
              <input className="input" type="number" min="0" value={form.oldPrice} onChange={set('oldPrice')} placeholder="75000" />
            </label>
            <label className="form-field">
              <span>Yangi narx (so'm) *</span>
              <input className="input" type="number" min="1" value={form.newPrice} onChange={set('newPrice')} placeholder="65000" required />
            </label>
            <label className="form-field full">
              <span>Ta'rifi</span>
              <textarea className="input" rows={2} value={form.description} onChange={set('description')} placeholder="Qisqacha ta'rif" />
            </label>
            <label className="form-field full">
              <span>Tarkibi (har bir qatorga bittadan)</span>
              <textarea
                className="input"
                rows={4}
                value={form.ingredients}
                onChange={set('ingredients')}
                placeholder={'Pomidor sousi\nMozzarella\nRayhon'}
              />
            </label>
          </div>

          {error && <div className="alert">{error}</div>}
        </div>

        <div className="modal-foot">
          <button type="button" className="btn btn-light" onClick={onClose}>
            Bekor qilish
          </button>
          <button className="btn btn-primary" disabled={saving}>
            {saving ? 'Saqlanmoqda...' : 'Saqlash'}
          </button>
        </div>
      </form>
    </div>
  );
}
