import Logo from './Logo.jsx';

export default function Splash({ leaving }) {
  return (
    <div className={`splash ${leaving ? 'leaving' : ''}`} aria-label="TEZ">
      <div className="splash-streaks" aria-hidden="true">
        {Array.from({ length: 7 }).map((_, i) => (
          <span key={i} style={{ '--i': i }} />
        ))}
      </div>
      <div className="splash-glide">
        <Logo size="xl" light />
      </div>
      <div className="splash-road" aria-hidden="true">
        <span className="splash-slice">🍕</span>
      </div>
    </div>
  );
}
