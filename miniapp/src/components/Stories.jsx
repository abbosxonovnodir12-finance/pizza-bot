import { useState } from 'react';
import { storage } from '../utils.js';

const STORIES = [
  { id: 'new', title: 'Yangilik', emoji: '✨', color: '#ff7043', heading: 'Qazi pizza qaytdi!', text: "Milliy ta'm va italyan an'anasi bitta pizzada. Albatta tatib ko'ring!" },
  { id: 'sale', title: 'Aksiya', emoji: '🔥', color: '#e53935', heading: 'Chegirmalar haftasi', text: "Barcha pizzalarga 15% gacha chegirma. Yangi narxlar katalogda." },
  { id: 'combo', title: 'Kombo', emoji: '🥤', color: '#8e24aa', heading: 'Pizza + Kola', text: "Har qanday buyurtmaga Kolani atigi 5 000 so'mga qo'shing." },
  { id: 'fast', title: 'Tezkor', emoji: '🛵', color: '#1e88e5', heading: '30 daqiqada yetkazamiz', text: "Kuryerlarimiz pizzani issiq holda eshigingizgacha olib boradi." },
  { id: 'cheese', title: 'Pishloq', emoji: '🧀', color: '#f9a825', heading: "4 xil pishloq", text: "Pishloqli pizza — haqiqiy pishloq ixlosmandlari uchun." },
];

function loadSeen() {
  try {
    return new Set(JSON.parse(storage.get('seen_stories')) || []);
  } catch {
    return new Set();
  }
}

export default function Stories() {
  const [seen, setSeen] = useState(loadSeen);
  const [openIndex, setOpenIndex] = useState(null);

  const open = (i) => {
    setOpenIndex(i);
    markSeen(STORIES[i].id);
  };

  const markSeen = (id) => {
    setSeen((prev) => {
      const next = new Set(prev).add(id);
      storage.set('seen_stories', JSON.stringify([...next]));
      return next;
    });
  };

  const go = (delta) => {
    const next = openIndex + delta;
    if (next < 0) return;
    if (next >= STORIES.length) return setOpenIndex(null);
    setOpenIndex(next);
    markSeen(STORIES[next].id);
  };

  const story = openIndex !== null ? STORIES[openIndex] : null;

  return (
    <>
      <div className="stories">
        {STORIES.map((s, i) => (
          <button key={s.id} className="story" onClick={() => open(i)}>
            <span className={`story-ring ${seen.has(s.id) ? 'seen' : ''}`}>
              <span className="story-circle" style={{ background: s.color }}>
                {s.emoji}
              </span>
            </span>
            <span className="story-title">{s.title}</span>
          </button>
        ))}
      </div>

      {story && (
        <div className="story-viewer" style={{ background: story.color }}>
          <div className="story-progress">
            {STORIES.map((s, i) => (
              <span key={s.id} className="story-bar">
                <span
                  key={`${s.id}-${openIndex}`}
                  className={`story-fill ${i < openIndex ? 'done' : i === openIndex ? 'running' : ''}`}
                  onAnimationEnd={i === openIndex ? () => go(1) : undefined}
                />
              </span>
            ))}
          </div>
          <button className="story-close" onClick={() => setOpenIndex(null)}>
            ✕
          </button>
          <div className="story-body">
            <div className="story-big-emoji">{story.emoji}</div>
            <h2>{story.heading}</h2>
            <p>{story.text}</p>
          </div>
          <button className="story-tap story-tap-left" onClick={() => go(-1)} aria-label="Oldingi" />
          <button className="story-tap story-tap-right" onClick={() => go(1)} aria-label="Keyingi" />
        </div>
      )}
    </>
  );
}
