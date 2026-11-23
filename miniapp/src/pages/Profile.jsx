import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useCart } from '../CartContext.jsx';
import { haptic, showAlert, tgUser } from '../telegram.js';
import { STATUS_BADGE, formatDate, formatPrice, makeLine, statusLabel } from '../utils.js';
import { PhoneIcon, RepeatIcon, RouteIcon } from '../components/Icons.jsx';

export default function Profile({ profile, products, options, orders: initialOrders, onNavigate }) {
  const [orders, setOrders] = useState(initialOrders);
  const [error, setError] = useState('');
  const { replaceWith } = useCart();
  const name = [profile?.firstName, profile?.lastName].filter(Boolean).join(' ') || tgUser?.first_name || 'Mehmon';

  useEffect(() => {
    api
      .myOrders()
      .then((d) => setOrders(d.orders))
      .catch((e) => setError(e.message));
  }, []);

  const reorder = (order) => {
    const map = new Map(products.map((p) => [p.id, p]));
    const lines = order.items
      .filter((i) => i.productId && map.has(i.productId))
      .map((i) =>
        makeLine(
          map.get(i.productId),
          { size: i.size, crust: i.crust, toppings: i.toppings || [] },
          options,
          i.quantity
        )
      );
    if (lines.length === 0) {
      showAlert('Afsuski, bu buyurtmadagi mahsulotlar endi mavjud emas.');
      return;
    }
    replaceWith(lines);
    haptic('medium');
    onNavigate('cart');
  };

  const active = orders.filter((o) => o.status !== 'DELIVERED').length;
  const spent = orders.reduce((s, o) => s + o.total, 0);

  return (
    <div className="page">
      <h1 className="page-title">Profil</h1>

      <div className="card profile-card">
        <div className="avatar big">{name.charAt(0).toUpperCase()}</div>
        <div className="profile-info">
          <h2>{name}</h2>
          {profile?.username && <p className="muted">@{profile.username}</p>}
          <p className="profile-phone">
            <PhoneIcon size={15} /> {profile?.phone || "Telefon raqam ko'rsatilmagan"}
          </p>
        </div>
      </div>

      <div className="stats-row">
        <div className="card stat">
          <b>{orders.length}</b>
          <span>Buyurtmalar</span>
        </div>
        <div className="card stat">
          <b>{active}</b>
          <span>Faol</span>
        </div>
        <div className="card stat">
          <b>{formatPrice(spent).replace(" so'm", '')}</b>
          <span>So'm sarflangan</span>
        </div>
      </div>

      <h3 className="section-title">📜 Mening buyurtmalarim</h3>

      {error && <div className="error-box">{error}</div>}

      {orders.length === 0 && !error && (
        <div className="empty">
          <div className="empty-circle">🧾</div>
          <p className="muted">Hali buyurtmalar yo'q</p>
          <button className="btn btn-primary" onClick={() => onNavigate('catalog')}>
            Birinchi buyurtmani berish
          </button>
        </div>
      )}

      {orders.map((o) => (
        <div key={o.id} className="card order-card">
          <div className="order-head">
            <div>
              <h4>Buyurtma №{o.id}</h4>
              <span className="muted small-text">{formatDate(o.createdAt)}</span>
            </div>
            <span className={`badge ${STATUS_BADGE[o.status] || ''}`}>{statusLabel(o.status)}</span>
          </div>
          <ul className="order-items">
            {o.items.map((i, idx) => (
              <li key={idx}>
                <span>
                  {i.name} <span className="muted">× {i.quantity}</span>
                  {i.options && <small>{i.options}</small>}
                </span>
                <span>{formatPrice(i.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="order-foot">
            <div className="order-total">
              <span className="muted small-text">Jami</span>
              <b className="price">{formatPrice(o.total)}</b>
            </div>
            <div className="order-actions">
              {o.status !== 'DELIVERED' && (
                <button className="btn btn-soft btn-sm" onClick={() => onNavigate('track', { orderId: o.id })}>
                  <RouteIcon size={16} /> Kuzatish
                </button>
              )}
              <button className="btn btn-primary btn-sm" onClick={() => reorder(o)}>
                <RepeatIcon size={16} /> Yana shundan buyurtma qilish
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
