import { useCart } from '../CartContext.jsx';
import { haptic } from '../telegram.js';
import { BagIcon, GridIcon, HomeIcon, RouteIcon, UserIcon } from './Icons.jsx';

const TABS = [
  { id: 'home', Icon: HomeIcon, label: 'Asosiy' },
  { id: 'catalog', Icon: GridIcon, label: 'Menyu' },
  { id: 'track', Icon: RouteIcon, label: 'Kuzatuv' },
  { id: 'cart', Icon: BagIcon, label: 'Savatcha' },
  { id: 'profile', Icon: UserIcon, label: 'Profil' },
];

export default function BottomNav({ active, onChange, hasActiveOrder }) {
  const { count } = useCart();

  return (
    <nav className="bottom-nav">
      {TABS.map(({ id, Icon, label }) => (
        <button
          key={id}
          className={`nav-item ${active === id ? 'active' : ''}`}
          aria-label={label}
          onClick={() => {
            haptic();
            onChange(id);
          }}
        >
          <span className="nav-icon">
            <Icon size={23} />
            {id === 'cart' && count > 0 && <span className="nav-badge">{count}</span>}
            {id === 'track' && hasActiveOrder && <span className="nav-live" />}
          </span>
          <span className="nav-label">{label}</span>
        </button>
      ))}
    </nav>
  );
}
