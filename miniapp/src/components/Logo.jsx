export default function Logo({ size = 'md', light = false }) {
  return (
    <span className={`logo logo-${size} ${light ? 'logo-light' : ''}`}>
      <span className="logo-lines" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <span className="logo-word">TEZ</span>
    </span>
  );
}
