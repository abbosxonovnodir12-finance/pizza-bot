import { useLayoutEffect, useRef, useState } from 'react';

const ROUTE = 'M58 196 C 96 196 104 150 140 146 S 190 150 206 112 S 236 64 276 62 S 318 56 322 34';

export default function CourierMap({ progress = 0, moving = false, delivered = false, label }) {
  const pathRef = useRef(null);
  const [point, setPoint] = useState({ x: 58, y: 196 });

  useLayoutEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const total = path.getTotalLength();
    const p = path.getPointAtLength(total * Math.min(1, Math.max(0, progress)));
    setPoint({ x: p.x, y: p.y });
  }, [progress]);

  return (
    <div className="map">
      <svg viewBox="0 0 360 230" preserveAspectRatio="xMidYMid slice" className="map-svg" aria-hidden="true">
        <rect width="360" height="230" fill="#f3efe9" />

        <path d="M0 150 C 60 130 90 175 160 168 S 260 200 360 176 V230 H0z" fill="#dcebf7" opacity="0.7" />
        <rect x="236" y="120" width="96" height="62" rx="14" fill="#dff0dc" />
        <rect x="18" y="20" width="70" height="56" rx="14" fill="#dff0dc" />

        {[
          [104, 14, 64, 44],
          [180, 14, 60, 36],
          [254, 92, 40, 18],
          [16, 92, 58, 40],
          [96, 70, 70, 46],
          [180, 64, 34, 34],
          [300, 96, 46, 16],
          [108, 180, 60, 36],
          [190, 186, 60, 30],
        ].map(([x, y, w, h], i) => (
          <rect key={i} x={x} y={y} width={w} height={h} rx="8" fill="#e9e2d8" />
        ))}

        <g stroke="#ffffff" strokeLinecap="round" fill="none">
          <path d="M0 86 H360" strokeWidth="9" />
          <path d="M0 140 C 80 136 160 140 360 130" strokeWidth="7" />
          <path d="M96 0 V230" strokeWidth="7" />
          <path d="M176 0 C 172 80 184 160 176 230" strokeWidth="9" />
          <path d="M246 0 V230" strokeWidth="6" />
          <path d="M300 0 C 296 60 310 120 300 230" strokeWidth="5" />
          <path d="M0 40 H96" strokeWidth="5" />
        </g>

        <path d={ROUTE} fill="none" stroke="#ffd7bd" strokeWidth="7" strokeLinecap="round" />
        <path
          ref={pathRef}
          d={ROUTE}
          fill="none"
          stroke="#ff6b00"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={moving || delivered ? undefined : '2 9'}
          pathLength="1"
          className="map-route"
          style={moving || delivered ? { strokeDasharray: `${progress} 1` } : undefined}
        />

        <g transform="translate(58 196)">
          <circle r="15" fill="#fff" stroke="#ff6b00" strokeWidth="2" />
          <text y="5" textAnchor="middle" fontSize="15">🍕</text>
        </g>

        <g transform="translate(322 34)">
          <path d="M-6 10 L0 20 L6 10z" fill="#1a1a1f" />
          <circle r="14" fill="#1a1a1f" />
          <text y="5" textAnchor="middle" fontSize="13">🏠</text>
        </g>

        {!delivered && (
          <g className="map-courier" style={{ transform: `translate(${point.x}px, ${point.y}px)` }}>
            <circle r="22" className={moving ? 'map-pulse' : 'map-pulse slow'} fill="#ff6b00" opacity="0.18" />
            <circle r="15" fill="#ff6b00" stroke="#fff" strokeWidth="3" />
            <text y="5" textAnchor="middle" fontSize="14">🛵</text>
          </g>
        )}
      </svg>

      {label && <div className="map-pill">{label}</div>}
    </div>
  );
}
