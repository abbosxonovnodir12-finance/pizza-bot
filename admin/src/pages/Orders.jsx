import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../api.js';
import { beep, formatDate, formatPrice } from '../utils.js';
import CourierModal from '../components/CourierModal.jsx';

const STATUS = {
  PENDING: { label: 'Qabul qilindi', cls: 'badge-info', next: 'PREPARING', action: '👨‍🍳 Tayyorlashni boshlash' },
  PREPARING: { label: 'Tayyorlanmoqda', cls: 'badge-warn', next: 'ON_THE_WAY', action: '🛵 Kuryerga berish' },
  ON_THE_WAY: { label: "Yo'lda", cls: 'badge-orange', next: 'DELIVERED', action: '✅ Yetkazildi' },
  DELIVERED: { label: 'Yetkazildi', cls: 'badge-ok', next: null, action: null },
};

const FILTERS = [
  { id: '', label: 'Barchasi' },
  { id: 'ACTIVE', label: 'Faol' },
  { id: 'PENDING', label: 'Yangi' },
  { id: 'PREPARING', label: 'Tayyorlanmoqda' },
  { id: 'ON_THE_WAY', label: "Yo'lda" },
  { id: 'DELIVERED', label: 'Yetkazildi' },
];

const POLL_MS = 5000;

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState('ACTIVE');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatedAt, setUpdatedAt] = useState(null);
  const [freshIds, setFreshIds] = useState(new Set());
  const [toast, setToast] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [courierFor, setCourierFor] = useState(null);
  const knownIds = useRef(null);

  const load = useCallback(async () => {
    try {
      const [o, s] = await Promise.all([api.orders(filter), api.stats()]);
      if (knownIds.current) {
        const fresh = o.orders.filter((x) => !knownIds.current.has(x.id) && x.status === 'PENDING');
        if (fresh.length) {
          setFreshIds(new Set(fresh.map((x) => x.id)));
          setToast(`🔔 ${fresh.length} ta yangi buyurtma keldi!`);
          beep();
        }
      }
      knownIds.current = new Set([...(knownIds.current || []), ...o.orders.map((x) => x.id)]);
      setOrders(o.orders);
      setStats(s);
      setError('');
      setUpdatedAt(new Date());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    knownIds.current = null;
    setLoading(true);
    load();
    const timer = setInterval(load, POLL_MS);
    return () => clearInterval(timer);
  }, [load]);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(''), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const setStatus = async (order, status, courier) => {
    setBusyId(order.id);
    try {
      await api.setOrderStatus(order.id, status, courier);
      await load();
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setBusyId(null);
    }
  };

  const advance = (order) => {
    const next = STATUS[order.status]?.next;
    if (!next) return;
    if (next === 'ON_THE_WAY') return setCourierFor(order);
    setStatus(order, next).catch(() => {});
  };

  const customerName = (u) => [u?.firstName, u?.lastName].filter(Boolean).join(' ') || 'Mijoz';

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Buyurtmalar</h1>
          <p className="muted">
            <span className="live-dot" /> Har {POLL_MS / 1000} soniyada avtomatik yangilanadi
            {updatedAt && ` · Oxirgi: ${updatedAt.toLocaleTimeString()}`}
          </p>
        </div>
        <button className="btn btn-light" onClick={load}>
          🔄 Yangilash
        </button>
      </div>

      <div className="stats">
        <div className="stat">
          <span className="stat-label">Bugungi buyurtmalar</span>
          <span className="stat-value">{stats?.todayOrders ?? '—'}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Faol buyurtmalar</span>
          <span className="stat-value warn">{stats?.activeOrders ?? '—'}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Bugungi tushum</span>
          <span className="stat-value">{stats ? formatPrice(stats.todayRevenue) : '—'}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Jami buyurtmalar</span>
          <span className="stat-value">{stats?.totalOrders ?? '—'}</span>
        </div>
      </div>

      <div className="tabs">
        {FILTERS.map((f) => (
          <button key={f.id} className={`tab ${filter === f.id ? 'active' : ''}`} onClick={() => setFilter(f.id)}>
            {f.label}
          </button>
        ))}
      </div>

      {error && <div className="alert">{error}</div>}

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>№</th>
              <th>Mijoz</th>
              <th>Telefon</th>
              <th>Buyurtma</th>
              <th>Manzil</th>
              <th>Jami</th>
              <th>Sana</th>
              <th>Holat</th>
            </tr>
          </thead>
          <tbody>
            {loading && orders.length === 0 && (
              <tr>
                <td colSpan={8} className="table-empty">
                  Yuklanmoqda...
                </td>
              </tr>
            )}
            {!loading && orders.length === 0 && (
              <tr>
                <td colSpan={8} className="table-empty">
                  Bu bo'limda buyurtmalar yo'q 🍕
                </td>
              </tr>
            )}
            {orders.map((o) => {
              const st = STATUS[o.status] || STATUS.PENDING;
              return (
                <tr key={o.id} className={freshIds.has(o.id) ? 'row-fresh' : ''}>
                  <td className="nowrap">
                    <b>#{o.id}</b>
                  </td>
                  <td>
                    <div className="cell-main">{customerName(o.user)}</div>
                    {o.user?.username && <div className="cell-sub">@{o.user.username}</div>}
                  </td>
                  <td className="nowrap">
                    <a href={`tel:${o.phone}`}>{o.phone}</a>
                  </td>
                  <td>
                    <ul className="items-list">
                      {o.items.map((i, idx) => (
                        <li key={idx}>
                          {i.name} <b>× {i.quantity}</b>
                          {i.options && <div className="item-opts">{i.options}</div>}
                        </li>
                      ))}
                    </ul>
                    {o.comment && <div className="cell-sub">💬 {o.comment}</div>}
                  </td>
                  <td className="address-cell">
                    <div>{o.location}</div>
                    {o.latitude != null && o.longitude != null && (
                      <a
                        className="map-link"
                        href={`https://maps.google.com/?q=${o.latitude},${o.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        📍 Xaritada ko'rish
                      </a>
                    )}
                  </td>
                  <td className="nowrap">
                    <b>{formatPrice(o.total)}</b>
                  </td>
                  <td className="nowrap muted">{formatDate(o.createdAt)}</td>
                  <td className="status-cell">
                    <span className={`badge ${st.cls}`}>{st.label}</span>
                    {o.courierName && (
                      <div className="cell-sub nowrap">
                        🛵 {o.courierName} · {o.courierPhone}
                      </div>
                    )}
                    {st.next && (
                      <button className="btn btn-step" onClick={() => advance(o)} disabled={busyId === o.id}>
                        {busyId === o.id ? '...' : st.action}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {courierFor && (
        <CourierModal
          order={courierFor}
          onClose={() => setCourierFor(null)}
          onSubmit={async (courier) => {
            await setStatus(courierFor, 'ON_THE_WAY', courier);
            setCourierFor(null);
          }}
        />
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
