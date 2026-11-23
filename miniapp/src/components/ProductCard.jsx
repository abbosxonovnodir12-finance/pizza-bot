import { useCart } from '../CartContext.jsx';
import { haptic } from '../telegram.js';
import { defaultSelection, discountPercent, formatPrice, makeLine } from '../utils.js';
import PizzaImage from './PizzaImage.jsx';
import { PlusIcon } from './Icons.jsx';

export default function ProductCard({ product, options, onOpen }) {
  const { add, qtyOfProduct } = useCart();
  const qty = qtyOfProduct(product.id);
  const discount = discountPercent(product.oldPrice, product.newPrice);

  const quickAdd = (e) => {
    e.stopPropagation();
    add(makeLine(product, defaultSelection(options), options, 1));
    haptic('medium');
  };

  return (
    <div className="pcard" onClick={() => onOpen(product)}>
      <div className="pcard-img">
        <PizzaImage src={product.imageUrl} alt={product.name} />
        {discount > 0 && <span className="pcard-discount">-{discount}%</span>}
      </div>
      <div className="pcard-body">
        <h4>{product.name}</h4>
        <p>{product.description}</p>
        <div className="pcard-foot">
          <div className="pcard-price">
            {product.oldPrice > product.newPrice && <s>{formatPrice(product.oldPrice)}</s>}
            <b>{formatPrice(product.newPrice)}</b>
          </div>
          <button className={`add-btn ${qty ? 'has' : ''}`} aria-label="Savatchaga qo'shish" onClick={quickAdd}>
            {qty || <PlusIcon size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}
