import { useState } from 'react';

export default function PizzaImage({ src, alt, className = '' }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className={`img-fallback ${className}`} aria-label={alt}>
        🍕
      </div>
    );
  }

  return <img className={className} src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} />;
}
