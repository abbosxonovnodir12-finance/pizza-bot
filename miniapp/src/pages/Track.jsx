import { useEffect, useRef, useState } from 'react';
import { api } from '../api.js';
import { callPhone, messagePhone } from '../telegram.js';
import {
  STATUS_BADGE,
  STATUS_STEPS,
  etaMinutes,
  formatDate,
  formatPrice,
  formatTime,
  routeProgress,
  statusIndex,
  statusLabel,
} from '../utils.js';
import CourierMap from '../components/CourierMap.jsx';
import { ChatIcon, CheckIcon, ChevronDownIcon, ChevronRightIcon, PhoneIcon, PinIcon } from '../components/Icons.jsx';

const POLL_MS = 5000;

function mapLabel(order, eta) {
  if (order.status === 'DELIVERED') return 'Buyurtma yetkazildi ✓';
  if (order.status === 'ON_THE_WAY') return `Kuryer ${eta} daqiqada yetib keladi`;
  if (order.status === 'PREPARING') return 'Pizza pechda pishmoqda 🔥';
  return 'Buyurtma qabul qilindi';
}

export default function Track({ orderId, orders, onSelectOrder, onOrderUpdate, onNavigate }) {
  const effectiveId = orderId || orders.find((o) => o.status !== 'DELIVERED')?.id || null;
  const [order, setOrder] = useState(() => orders.find((o) => o.id === effectiveId) || null);
  const [error, setError] = useState('');
  const [now, setNow] = useState(Date.now());
  const [showDetails, setShowDetails] = useState(false);
  const updateRef = useRef(onOrderUpdate);
  updateRef.current = onOrderUpdate;

  useEffect(() => {
    if (!effectiveId) return undefined;
    let alive = true;
    setOrder((prev) => (prev?.id === effectiveId ? prev : orders.find((o) => o.id === effectiveId) || null));

    const load = async () => {
      try {
        const { order: fresh } = await api.order(effectiveId);
        if (!alive) return;
        setOrder(fresh);
        setError('');
        updateRef.current?.(fresh);
      } catch (e) {
        if (alive) setError(e.message);
      }
    };
    load();
    const timer = setInterval(load, POLL_MS);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [effectiveId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!effectiveId) {
    return (
      <div className="page">
        <h1 className="page-title">Kuzatuv</h1>
        <div className="empty">
          <div className="empty-circle">🛵</div>
          <h3>Faol buyurtma yo'q</h3>
          <p className="muted">Buyurtma bersangiz, kuryerni shu yerda jonli kuzatasiz</p>
          <button className="btn btn-primary" onClick={() => onNavigate('catalog')}>
            Buyurtma berish
          </button>
        </div>
        {orders.length > 0 && (
          <>
            <h3 className="section-title">Oldingi buyurtmalar</h3>
            <div className="card list-card">
              {orders.slice(0, 6).map((o) => (
                <button key={o.id} className="list-row" onClick={() => onSelectOrder(o.id)}>
                  <span className="list-row-main">
                    <b>Buyurtma №{o.id}</b>
                    <span className="muted small-text">{formatDate(o.createdAt)}</span>
                  </span>
                  <span className={`badge ${STATUS_BADGE[o.status]}`}>{statusLabel(o.status)}</span>
                  <ChevronRightIcon size={18} />
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  if (!order) {
    return (
      <div className="page">
        <h1 className="page-title">Kuzatuv</h1>
        {error ? <div className="error-box">{error}</div> : <div className="center-block"><div className="spinner" /></div>}
      </div>
    );
  }

  const idx = statusIndex(order.status);
  const delivered = order.status === 'DELIVERED';
  const eta = etaMinutes(order, now);
  const progress = routeProgress(order, now);

  return (
    <div className="page">
      <div className="page-title-row">
        <h1 className="page-title">Kuzatuv</h1>
        <span className="order-chip">№{order.id}</span>
      </div>

      <div className="map-card">
        <CourierMap
          progress={progress}
          moving={order.status === 'ON_THE_WAY'}
          delivered={delivered}
          label={mapLabel(order, eta)}
        />
      </div>

      <div className="card eta-card">
        <span className="eta-icon">{STATUS_STEPS[idx]?.emoji}</span>
        <div className="eta-text">
          <span>{delivered ? 'Yetkazilgan vaqt' : 'Taxminiy yetkazish'}</span>
          <b>{delivered ? formatTime(order.deliveredAt) : `${eta} daqiqa`}</b>
          <small>{STATUS_STEPS[idx]?.title}</small>
        </div>
        <div className="eta-bars">
          {STATUS_STEPS.map((s, i) => (
            <i key={s.id} className={i <= idx ? 'on' : ''} />
          ))}
        </div>
      </div>

      {order.courierName ? (
        <div className="card courier-card">
          <div className="courier-avatar">{order.courierName.charAt(0).toUpperCase()}</div>
          <div className="courier-info">
            <b>{order.courierName}</b>
            <span>TEZ kuryeri · {order.courierPhone}</span>
          </div>
          {!delivered && order.courierPhone && (
            <div className="courier-actions">
              <button className="round-btn" onClick={() => callPhone(order.courierPhone)} aria-label="Qo'ng'iroq">
                <PhoneIcon size={19} />
              </button>
              <button className="round-btn soft" onClick={() => messagePhone(order.courierPhone)} aria-label="Xabar">
                <ChatIcon size={19} />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="card courier-card waiting">
          <div className="courier-avatar ghost">🛵</div>
          <div className="courier-info">
            <b>Kuryer biriktirilmoqda</b>
            <span>Pizza tayyor bo'lishi bilan kuryer yo'lga chiqadi</span>
          </div>
        </div>
      )}

      <div className="card timeline-card">
        <h3>Buyurtma holati</h3>
        <ol className="timeline">
          {STATUS_STEPS.map((s, i) => {
            const state = i < idx || (delivered && i === idx) ? 'done' : i === idx ? 'current' : '';
            return (
              <li key={s.id} className={state}>
                <span className="tl-dot">{state === 'done' && <CheckIcon size={13} strokeWidth={3.2} />}</span>
                <span className="tl-text">
                  <b>{s.title}</b>
                  <small>{order[s.at] ? formatTime(order[s.at]) : i === idx + 1 ? 'Keyingi bosqich' : '—'}</small>
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="card details-card">
        <button className="details-toggle" onClick={() => setShowDetails((v) => !v)}>
          <span>Buyurtma tafsilotlari</span>
          <ChevronDownIcon size={18} className={showDetails ? 'rot' : ''} />
        </button>
        {showDetails && (
          <div className="details-body">
            <p className="details-addr">
              <PinIcon size={16} /> {order.location}
            </p>
            <ul className="order-items">
              {order.items.map((i, k) => (
                <li key={k}>
                  <span>
                    {i.name} <span className="muted">× {i.quantity}</span>
                    {i.options && <small>{i.options}</small>}
                  </span>
                  <span>{formatPrice(i.price * i.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="details-total">
              <span>Jami</span>
              <b className="price">{formatPrice(order.total)}</b>
            </div>
          </div>
        )}
      </div>

      {error && <div className="error-box">{error}</div>}
    </div>
  );
}
