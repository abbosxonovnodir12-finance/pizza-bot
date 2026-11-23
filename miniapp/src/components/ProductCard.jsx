import { useCart } from '../CartContext.jsx';
import { useFavorites } from '../FavoritesContext.jsx';
import { haptic } from '../telegram.js';
import { defaultSelection, discountPercent, formatPrice, makeLine } from '../utils.js';
import PizzaImage from './PizzaImage.jsx';
import { HeartIcon, PlusIcon } from './Icons.jsx';

export default function ProductCard({ product, options, onOpen, compact = false }) {
  const { add, qtyOfProduct } = useCart();
  const fav = useFavorites();
  const qty = qtyOfProduct(product.id);
  const liked = fav.has(product.id);
  const discount = discountPercent(product.oldPrice, product.newPrice);

  const quickAdd = (e) => {
    e.stopPropagation();
    add(makeLine(product, defaultSelection(options, product), options, 1));
    haptic('medium');
  };

  const toggleFav = (e) => {
    e.stopPropagation();
    fav.toggle(product.id);
    haptic();
  };

  return (
    <div className={`pcard ${compact ? 'compact' : ''}`} onClick={() => onOpen(product)}>
      <div className="pcard-img">
        <PizzaImage src={product.imageUrl} alt={product.name} />
        {discount > 0 && <span className="pcard-badge">-{discount}%</span>}
        <button className={`fav-btn ${liked ? 'on' : ''}`} onClick={toggleFav} aria-label="Sevimlilarga qo'shish">
          <HeartIcon size={16} filled={liked} />
        </button>
      </div>
      <div className="pcard-body">
        <h4>{product.name}</h4>
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
