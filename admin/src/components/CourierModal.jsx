import { useEffect, useState } from 'react';

const KEY = 'tez_last_courier';

function loadLast() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || { name: '', phone: '' };
  } catch {
    return { name: '', phone: '' };
  }
}

export default function CourierModal({ order, onClose, onSubmit }) {
  const [form, setForm] = useState(loadLast);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) return setError('Kuryer ismini kiriting');
    if (form.phone.replace(/\D/g, '').length < 9) return setError("Telefon raqamini to'g'ri kiriting");
    setSaving(true);
    try {
      await onSubmit({ courierName: form.name.trim(), courierPhone: form.phone.trim() });
      localStorage.setItem(KEY, JSON.stringify({ name: form.name.trim(), phone: form.phone.trim() }));
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <form className="modal modal-sm" onMouseDown={(e) => e.stopPropagation()} onSubmit={submit}>
        <div className="modal-head">
          <h2>🛵 Buyurtma #{order.id} — kuryerga berish</h2>
          <button type="button" className="icon-btn" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="modal-body">
          <p className="muted modal-hint">
            Mijoz Mini App'da kuryer ismini ko'radi va unga qo'ng'iroq qila oladi. Botdan ham xabar boradi.
          </p>
          <div className="form-grid">
            <label className="form-field full">
              <span>Kuryer ismi *</span>
              <input
                className="input"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Masalan: Jasur"
                autoFocus
              />
            </label>
            <label className="form-field full">
              <span>Kuryer telefoni *</span>
              <input
                className="input"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="+998 90 123 45 67"
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
            {saving ? 'Saqlanmoqda...' : "Yo'lga chiqarish"}
          </button>
        </div>
      </form>
    </div>
  );
}
