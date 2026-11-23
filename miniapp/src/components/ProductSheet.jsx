import { useEffect, useState } from 'react';
import { useCart } from '../CartContext.jsx';
import { haptic } from '../telegram.js';
import { defaultSelection, discountPercent, formatPrice, makeLine, unitPrice } from '../utils.js';
import PizzaImage from './PizzaImage.jsx';
import { CheckIcon, CloseIcon, MinusIcon, PlusIcon } from './Icons.jsx';

const signed = (n) => (n > 0 ? `+${formatPrice(n)}` : n < 0 ? `−${formatPrice(-n)}` : '');

export default function ProductSheet({ product, options, onClose }) {
  const { add } = useCart();
  const [sel, setSel] = useState(() => defaultSelection(options));
  const [qty, setQty] = useState(1);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    setSel(defaultSelection(options));
    setQty(1);
    setClosing(false);
  }, [product?.id, options]);

  useEffect(() => {
    document.body.style.overflow = product ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [product]);

  if (!product) return null;

  const close = () => {
    setClosing(true);
    setTimeout(onClose, 200);
  };

  const pick = (patch) => {
    haptic();
    setSel((s) => ({ ...s, ...patch }));
  };

  const toggleTopping = (id) => {
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

  const unit = unitPrice(product, sel, options);
  const discount = discountPercent(product.oldPrice, product.newPrice);

  return (
    <div className={`sheet-overlay ${closing ? 'closing' : ''}`} onClick={close}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-scroll">
          <div className="pd-hero">
            <PizzaImage src={product.imageUrl} alt={product.name} />
            <div className="sheet-handle" />
            <button className="sheet-close" onClick={close} aria-label="Yopish">
              <CloseIcon size={18} />
            </button>
            {discount > 0 && <span className="pd-discount">-{discount}%</span>}
          </div>

          <div className="pd-body">
            <div className="pd-title">
              <div>
                <span className="tag">{product.category}</span>
                <h2>{product.name}</h2>
              </div>
              <div className="pd-base-price">
                <b>{formatPrice(product.newPrice)}</b>
                {product.oldPrice > product.newPrice && <s>{formatPrice(product.oldPrice)}</s>}
              </div>
            </div>
            {product.description && <p className="pd-desc">{product.description}</p>}

            {options && (
              <>
                <section className="opt">
                  <h4>O'lchami</h4>
                  <div className="seg">
                    {options.sizes.map((s) => (
                      <button
                        key={s.id}
                        className={`seg-item ${sel.size === s.id ? 'active' : ''}`}
                        onClick={() => pick({ size: s.id })}
                      >
                        <span className="seg-pizza" style={{ '--s': s.cm / 35 }}>
                          🍕
                        </span>
                        <b>{s.name}</b>
                        <small>{s.cm} sm</small>
                        {s.delta !== 0 && <em>{signed(s.delta)}</em>}
                      </button>
                    ))}
                  </div>
                </section>

                <section className="opt">
                  <h4>Xamiri</h4>
                  <div className="pills">
                    {options.crusts.map((c) => (
                      <button
                        key={c.id}
                        className={`pill ${sel.crust === c.id ? 'active' : ''}`}
                        onClick={() => pick({ crust: c.id })}
                      >
                        {c.name}
                        {c.delta > 0 && <small> {signed(c.delta)}</small>}
                      </button>
                    ))}
                  </div>
                </section>

                <section className="opt">
                  <h4>
                    Qo'shimchalar <span className="muted">(ixtiyoriy)</span>
                  </h4>
                  <div className="toppings">
                    {options.toppings.map((t) => {
                      const on = sel.toppings.includes(t.id);
                      return (
                        <button key={t.id} className={`topping ${on ? 'on' : ''}`} onClick={() => toggleTopping(t.id)}>
                          <span className="topping-emoji">{t.emoji}</span>
                          <span className="topping-name">{t.name}</span>
                          <span className="topping-price">+{formatPrice(t.price)}</span>
                          <span className="topping-check">{on && <CheckIcon size={14} strokeWidth={3} />}</span>
                        </button>
                      );
                    })}
                  </div>
                </section>
              </>
            )}

            {product.ingredients?.length > 0 && (
              <section className="opt">
                <h4>Tarkibi</h4>
                <ul className="ingredients">
                  {product.ingredients.map((ing) => (
                    <li key={ing}>{ing}</li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>

        <div className="pd-footer">
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
            <span>Qo'shish</span>
            <span className="pd-add-price">{formatPrice(unit * qty)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
