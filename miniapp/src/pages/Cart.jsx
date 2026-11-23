import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useCart } from '../CartContext.jsx';
import { closeApp, haptic, hapticSuccess, tgUser } from '../telegram.js';
import { etaMinutes, formatPrice, storage } from '../utils.js';
import PizzaImage from '../components/PizzaImage.jsx';
import { CheckIcon, MinusIcon, PinIcon, PlusIcon, RouteIcon, TrashIcon } from '../components/Icons.jsx';

export default function Cart({ profile, colaPrice, colaName, onNavigate, onOrderPlaced }) {
  const { items, inc, dec, remove, clear, total, count } = useCart();
  const [addCola, setAddCola] = useState(false);
  const [phone, setPhone] = useState(profile?.phone || '');
  const [address, setAddress] = useState(() => storage.get('last_address') || '');
  const [coords, setCoords] = useState(null);
  const [locating, setLocating] = useState(false);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [doneOrder, setDoneOrder] = useState(null);

  useEffect(() => {
    if (profile?.phone && !phone) setPhone(profile.phone);
  }, [profile]); // eslint-disable-line react-hooks/exhaustive-deps

  const grandTotal = total + (addCola ? colaPrice : 0);

  const locate = () => {
    if (!navigator.geolocation) {
      setError("Qurilmangiz lokatsiyani qo'llab-quvvatlamaydi. Manzilni yozing.");
      return;
    }
    setLocating(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
        haptic();
      },
      () => {
        setLocating(false);
        setError("Lokatsiyani aniqlab bo'lmadi. Iltimos, manzilni qo'lda yozing.");
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const submit = async () => {
    setError('');
    if (phone.replace(/\D/g, '').length < 9) return setError("Telefon raqamingizni to'g'ri kiriting");
    if (!address.trim() && !coords) return setError('Yetkazish manzilini kiriting yoki lokatsiyani yuboring');

    setSubmitting(true);
    try {
      const { order } = await api.createOrder({
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          size: i.size,
          crust: i.crust,
          toppings: i.toppings,
        })),
        addCola,
        phone: phone.trim(),
        address: address.trim(),
        latitude: coords?.lat ?? null,
        longitude: coords?.lng ?? null,
        comment: comment.trim(),
      });
      storage.set('last_address', address.trim());
      onOrderPlaced?.(order);
      clear();
      hapticSuccess();
      setDoneOrder(order);
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (doneOrder) {
    return (
      <div className="page success-page">
        <div className="success-orbit">
          <span className="orbit-dot d1" />
          <span className="orbit-dot d2" />
          <div className="success-circle">
            <CheckIcon size={44} />
          </div>
        </div>
        <h2>Tabriklaymiz!</h2>
        <p className="muted">Buyurtmangiz muvaffaqiyatli qabul qilindi. Kuryerimiz tez orada bog'lanadi 🍕</p>

        <div className="card info-table">
          <div>
            <span>Buyurtma</span>
            <b>№{doneOrder.id}</b>
          </div>
          <div>
            <span>Summa</span>
            <b>{formatPrice(doneOrder.total)}</b>
          </div>
          <div>
            <span>Manzil</span>
            <b>{doneOrder.location}</b>
          </div>
          <div>
            <span>Taxminiy vaqt</span>
            <b>~{etaMinutes(doneOrder)} daqiqa</b>
          </div>
        </div>

        <button className="btn btn-primary btn-block btn-lg" onClick={() => onNavigate('track', { orderId: doneOrder.id })}>
          <RouteIcon size={20} /> Buyurtmani kuzatish
        </button>
        <button className="btn btn-soft btn-block" onClick={closeApp}>
          Ilovani yopish
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="page">
        <h1 className="page-title">Savatcha</h1>
        <div className="empty">
          <div className="empty-circle">🛒</div>
          <h3>Savatchangiz bo'sh</h3>
          <p className="muted">Mazali pizzalarni menyudan tanlang</p>
          <button className="btn btn-primary" onClick={() => onNavigate('catalog')}>
            Menyuga o'tish
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-title-row">
        <h1 className="page-title">
          Savatcha <span className="title-count">{count}</span>
        </h1>
        <button className="link-muted" onClick={clear}>
          Tozalash
        </button>
      </div>

      <div className="cart-list">
        {items.map((i) => (
          <div key={i.key} className="card cart-item">
            <div className="cart-img">
              <PizzaImage src={i.imageUrl} alt={i.name} />
            </div>
            <div className="cart-info">
              <div className="cart-top">
                <h4>{i.name}</h4>
                <button className="icon-btn" onClick={() => remove(i.key)} aria-label="O'chirish">
                  <TrashIcon size={17} />
                </button>
              </div>
              {i.options && <p className="cart-opts">{i.options}</p>}
              <div className="cart-bottom">
                <b className="price">{formatPrice(i.price * i.quantity)}</b>
                <div className="stepper">
                  <button onClick={() => dec(i.key)} aria-label="Kamaytirish">
                    <MinusIcon size={15} />
                  </button>
                  <span>{i.quantity}</span>
                  <button onClick={() => inc(i.key)} aria-label="Ko'paytirish">
                    <PlusIcon size={15} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <label className={`upsell ${addCola ? 'on' : ''}`}>
        <span className="upsell-emoji">🥤</span>
        <span className="upsell-text">
          Bunga qo'shimcha ravishda <b>{colaName}</b> ni atigi <b className="price">{formatPrice(colaPrice)}</b>ga
          qo'shasizmi?
        </span>
        <input
          type="checkbox"
          className="switch"
          checked={addCola}
          onChange={(e) => {
            haptic();
            setAddCola(e.target.checked);
          }}
        />
      </label>

      <div className="card form-card">
        <h3>Yetkazib berish</h3>
        <div className="field">
          <span>Ism</span>
          <input value={profile?.firstName || tgUser?.first_name || ''} disabled />
        </div>
        <div className="field">
          <span>Telefon</span>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+998 90 123 45 67" />
        </div>
        <div className="field">
          <span>Manzil</span>
          <textarea
            rows={2}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Shahar, ko'cha, uy, xonadon, mo'ljal"
          />
        </div>
        <button className={`location-btn ${coords ? 'ok' : ''}`} onClick={locate} disabled={locating}>
          <span className="location-icon">
            <PinIcon size={18} />
          </span>
          <span>{locating ? 'Aniqlanmoqda...' : coords ? "Lokatsiya qo'shildi ✓" : 'Joriy lokatsiyani yuborish'}</span>
        </button>
        <div className="field">
          <span>Izoh (ixtiyoriy)</span>
          <input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Masalan: domofon ishlamaydi" />
        </div>
      </div>

      <div className="card summary">
        <div>
          <span className="muted">Pizzalar</span>
          <span>{formatPrice(total)}</span>
        </div>
        {addCola && (
          <div>
            <span className="muted">{colaName}</span>
            <span>{formatPrice(colaPrice)}</span>
          </div>
        )}
        <div>
          <span className="muted">Yetkazib berish</span>
          <span className="green">Bepul</span>
        </div>
      </div>

      {error && <div className="error-box">{error}</div>}

      <div className="checkout-bar">
        <div className="checkout-total">
          <span>Jami</span>
          <b>{formatPrice(grandTotal)}</b>
        </div>
        <button className="btn btn-primary btn-lg" onClick={submit} disabled={submitting}>
          {submitting ? 'Yuborilmoqda...' : 'Buyurtmani tasdiqlash'}
        </button>
      </div>
    </div>
  );
}
