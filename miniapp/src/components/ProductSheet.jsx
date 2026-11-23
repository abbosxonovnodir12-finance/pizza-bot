import { useEffect, useState } from 'react';
import { useCart } from '../CartContext.jsx';
import { useFavorites } from '../FavoritesContext.jsx';
import { haptic } from '../telegram.js';
import { defaultSelection, discountPercent, formatPrice, makeLine, optionSet, unitPrice } from '../utils.js';
import PizzaImage from './PizzaImage.jsx';
import { BackIcon, HeartIcon, MinusIcon, PlusIcon } from './Icons.jsx';

const signed = (n) => (n > 0 ? `+${formatPrice(n)}` : n < 0 ? `−${formatPrice(-n)}` : '');

export default function ProductSheet({ product, options, onClose }) {
  const { add } = useCart();
  const fav = useFavorites();
  const [sel, setSel] = useState(() => defaultSelection(options, product));
  const [qty, setQty] = useState(1);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    setSel(defaultSelection(options, product));
    setQty(1);
    setClosing(false);
  }, [product?.id, options]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    document.body.style.overflow = product ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [product]);

  if (!product) return null;

  const set = optionSet(options, product);
  const liked = fav.has(product.id);
  const unit = unitPrice(product, sel, options);
  const discount = discountPercent(product.oldPrice, product.newPrice);
  const hasCustomize = set.sizes.length > 0 || set.crusts.length > 0 || set.extras.length > 0;

  const close = () => {
    setClosing(true);
    setTimeout(onClose, 220);
  };

  const pick = (patch) => {
    haptic();
    setSel((s) => ({ ...s, ...patch }));
  };

  const toggleExtra = (id) => {
    haptic();
    setSel((s) => ({
      ...s,
      toppings: s.toppings.includes(id) ? s.toppings.filter((t) => t !== id) : [...s.toppings, id],
    }));
  };

  const handleAdd = () => {
    add(makeLine(product, sel, options, qty));
    haptic('medium');
    close();
  };

  return (
    <div className={`sheet-overlay ${closing ? 'closing' : ''}`} onClick={close}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-scroll">
          <div className="pd-hero">
            <PizzaImage src={product.imageUrl} alt={product.name} />
            <div className="pd-hero-fade" />
            <button className="glass-round pd-back" onClick={close} aria-label="Orqaga">
              <BackIcon size={20} />
            </button>
            <button
              className={`glass-round pd-like ${liked ? 'on' : ''}`}
              onClick={() => {
                fav.toggle(product.id);
                haptic();
              }}
              aria-label="Sevimli"
            >
              <HeartIcon size={20} filled={liked} />
            </button>
          </div>

          <div className="pd-card glass">
            <div className="pd-tags">
              <span className="tag-hot">{product.category}</span>
              {discount > 0 && <span className="tag-sale">-{discount}%</span>}
            </div>
            <div className="pd-title">
              <h2>{product.name}</h2>
              <div className="pd-base-price">
                <b>{formatPrice(product.newPrice)}</b>
                {product.oldPrice > product.newPrice && <s>{formatPrice(product.oldPrice)}</s>}
              </div>
            </div>
            {product.description && <p className="pd-desc">{product.description}</p>}

            {hasCustomize && (
              <div className="pd-section">
                <h3>Sozlash</h3>

                {set.sizes.length > 0 && (
                  <div className="opt-row">
                    <span className="opt-label">{set.sizeLabel || "O'lchami"}</span>
                    <div className="seg">
                      {set.sizes.map((s) => (
                        <button
                          key={s.id}
                          className={`seg-item ${sel.size === s.id ? 'active' : ''}`}
                          onClick={() => pick({ size: s.id })}
                        >
                          <b>{s.name}</b>
                          {(s.sub || s.delta !== 0) && (
                            <small>{[s.sub, signed(s.delta)].filter(Boolean).join(' · ')}</small>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {set.crusts.length > 0 && (
                  <div className="opt-row">
                    <span className="opt-label">Xamiri</span>
                    <div className="seg">
                      {set.crusts.map((c) => (
                        <button
                          key={c.id}
                          className={`seg-item ${sel.crust === c.id ? 'active' : ''}`}
                          onClick={() => pick({ crust: c.id })}
                        >
                          <b>{c.name}</b>
                          {c.delta > 0 && <small>{signed(c.delta)}</small>}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {set.extras.map((e) => {
                  const on = sel.toppings.includes(e.id);
                  return (
                    <label key={e.id} className="toggle-row">
                      <span className="toggle-emoji">{e.emoji}</span>
                      <span className="toggle-name">
                        {e.name}
                        <small>+{formatPrice(e.price)}</small>
                      </span>
                      <input type="checkbox" className="switch" checked={on} onChange={() => toggleExtra(e.id)} />
                    </label>
                  );
                })}
              </div>
            )}

            {product.ingredients?.length > 0 && (
              <div className="pd-section">
                <h3>Tarkibi</h3>
                <ul className="ingredients">
                  {product.ingredients.map((ing) => (
                    <li key={ing}>{ing}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="pd-footer glass">
          <div className="stepper big">
            <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Kamaytirish">
              <MinusIcon size={18} />
            </button>
            <span>{qty}</span>
            <button onClick={() => setQty((q) => Math.min(50, q + 1))} aria-label="Ko'paytirish">
              <PlusIcon size={18} />
            </button>
          </div>
          <button className="btn btn-primary btn-lg pd-add" onClick={handleAdd}>
            <span>Savatchaga</span>
            <span className="pd-add-sep" />
            <span className="pd-add-price">{formatPrice(unit * qty)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
