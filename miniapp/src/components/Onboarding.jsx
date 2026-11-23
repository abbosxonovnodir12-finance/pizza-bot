import { useRef, useState } from 'react';
import { haptic } from '../telegram.js';

const SLIDES = [
  {
    emoji: '🍕',
    side: ['🔥', '🧀'],
    bg: '#fff0e5',
    title: 'Sizni ochlik qiynayaptimi?',
    text: 'Biz issiqqina pizzalarni tezkor yetkazamiz.',
  },
  {
    emoji: '📱',
    side: ['👆', '🛵'],
    bg: '#ffe6d3',
    title: 'Bu qanday ishlaydi?',
    text: 'Tanlang, buyurtma bering va rohatlaning.',
  },
  {
    emoji: '🤝',
    side: ['⭐', '❤️'],
    bg: '#fff4ec',
    title: '10,000+ odam',
    text: 'allaqachon biz bilan.',
  },
];

export default function Onboarding({ onFinish }) {
  const [index, setIndex] = useState(0);
  const touchX = useRef(null);
  const isLast = index === SLIDES.length - 1;

  const goTo = (i) => {
    const next = Math.max(0, Math.min(SLIDES.length - 1, i));
    if (next !== index) haptic();
    setIndex(next);
  };

  const next = () => {
    if (isLast) {
      haptic('medium');
      return onFinish();
    }
    goTo(index + 1);
  };

  const onTouchStart = (e) => {
    touchX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e) => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) > 50) goTo(index + (dx < 0 ? 1 : -1));
  };

  return (
    <div className="onboarding">
      <div className="onb-top">
        {!isLast && (
          <button className="onb-skip" onClick={onFinish}>
            O'tkazib yuborish
          </button>
        )}
      </div>

      <div className="onb-viewport" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <div className="onb-track" style={{ transform: `translateX(-${index * 100}%)` }}>
          {SLIDES.map((s) => (
            <div className="onb-slide" key={s.title}>
              <div className="onb-visual" style={{ background: s.bg }}>
                <span className="onb-emoji">{s.emoji}</span>
                <span className="onb-side onb-side-1">{s.side[0]}</span>
                <span className="onb-side onb-side-2">{s.side[1]}</span>
              </div>
              <h1>{s.title}</h1>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="onb-bottom">
        <div className="dots">
          {SLIDES.map((s, i) => (
            <button key={s.title} className={`dot ${i === index ? 'active' : ''}`} onClick={() => goTo(i)} />
          ))}
        </div>
        <button className="btn btn-primary btn-block btn-lg" onClick={next}>
          {isLast ? 'Boshla 🚀' : 'Keyingi'}
        </button>
      </div>
    </div>
  );
}
