export const BRAND = 'TEZ';

export const CATEGORY_ICONS = { Pizza: '🍕', Burger: '🍔', Lavash: '🌯', Ichimlik: '🥤' };

export const RIDE_MINUTES = 15;
export const PREP_MINUTES = 20;

export function formatPrice(n) {
  return `${String(Math.round(n || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} so'm`;
}

const pad = (x) => String(x).padStart(2, '0');

export function formatTime(value) {
  if (!value) return '';
  const d = new Date(value);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function formatDate(value) {
  const d = new Date(value);
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}, ${formatTime(d)}`;
}

export function discountPercent(oldPrice, newPrice) {
  if (!oldPrice || oldPrice <= newPrice) return 0;
  return Math.round(((oldPrice - newPrice) / oldPrice) * 100);
}

export const storage = {
  get(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* ignore */
    }
  },
};

/* ---------- Mahsulot sozlamalari (kategoriya bo'yicha) ---------- */

const MIN_UNIT_PRICE = 5000;
const EMPTY_SET = { sizes: [], crusts: [], extras: [], defaults: {} };

export function optionSet(options, product) {
  return (options && product && options[product.category]) || EMPTY_SET;
}

export function defaultSelection(options, product) {
  const set = optionSet(options, product);
  return {
    size: set.defaults?.size || set.sizes[0]?.id || null,
    crust: set.defaults?.crust || set.crusts[0]?.id || null,
    toppings: [],
  };
}

// Tanlovni shu kategoriyada mavjud variantlarga moslaydi
function resolve(product, sel, options) {
  const set = optionSet(options, product);
  const def = defaultSelection(options, product);
  const size = set.sizes.find((s) => s.id === sel?.size) || set.sizes.find((s) => s.id === def.size) || null;
  const crust = set.crusts.find((c) => c.id === sel?.crust) || set.crusts.find((c) => c.id === def.crust) || null;
  const extras = set.extras.filter((e) => (sel?.toppings || []).includes(e.id));
  return { size, crust, extras };
}

export function unitPrice(product, sel, options) {
  const { size, crust, extras } = resolve(product, sel, options);
  const price = product.newPrice + (size?.delta || 0) + (crust?.delta || 0) + extras.reduce((s, e) => s + e.price, 0);
  return Math.max(price, MIN_UNIT_PRICE);
}

export function describeSelection(product, sel, options) {
  const { size, crust, extras } = resolve(product, sel, options);
  const parts = [];
  if (size) parts.push(size.sub ? `${size.name} ${size.sub}` : size.name);
  if (crust) parts.push(`${crust.name} xamir`);
  if (extras.length) parts.push(`+ ${extras.map((e) => e.name).join(', ')}`);
  return parts.join(' · ');
}

export function lineKey(productId, sel) {
  return [productId, sel.size || '-', sel.crust || '-', [...sel.toppings].sort().join('+')].join('|');
}

export function makeLine(product, sel, options, quantity = 1) {
  const { size, crust, extras } = resolve(product, sel, options);
  const clean = { size: size?.id || null, crust: crust?.id || null, toppings: extras.map((e) => e.id) };
  return {
    key: lineKey(product.id, clean),
    productId: product.id,
    name: product.name,
    imageUrl: product.imageUrl,
    category: product.category,
    ...clean,
    price: unitPrice(product, clean, options),
    options: describeSelection(product, clean, options),
    quantity,
  };
}

/* ---------- Order tracking ---------- */

export const STATUS_STEPS = [
  { id: 'PENDING', title: 'Buyurtma qabul qilindi', short: 'Qabul qilindi', at: 'createdAt', emoji: '🧾' },
  { id: 'PREPARING', title: 'Tayyorlanmoqda', short: 'Tayyorlanmoqda', at: 'preparingAt', emoji: '👨‍🍳' },
  { id: 'ON_THE_WAY', title: "Kuryer yo'lda", short: "Yo'lda", at: 'onTheWayAt', emoji: '🛵' },
  { id: 'DELIVERED', title: 'Yetkazildi', short: 'Yetkazildi', at: 'deliveredAt', emoji: '✅' },
];

export const STATUS_BADGE = {
  PENDING: 'badge-info',
  PREPARING: 'badge-warn',
  ON_THE_WAY: 'badge-orange',
  DELIVERED: 'badge-ok',
};

export const statusIndex = (status) => STATUS_STEPS.findIndex((s) => s.id === status);
export const statusLabel = (status) => STATUS_STEPS[statusIndex(status)]?.short || status;

const minutesSince = (value, now) => (now - new Date(value).getTime()) / 60000;

export function etaMinutes(order, now = Date.now()) {
  if (!order || order.status === 'DELIVERED') return 0;
  if (order.status === 'ON_THE_WAY') {
    return Math.max(1, Math.ceil(RIDE_MINUTES - minutesSince(order.onTheWayAt, now)));
  }
  if (order.status === 'PREPARING') {
    return Math.max(RIDE_MINUTES + 1, Math.ceil(PREP_MINUTES + RIDE_MINUTES - minutesSince(order.preparingAt, now)));
  }
  return Math.max(RIDE_MINUTES + 5, Math.ceil(PREP_MINUTES + RIDE_MINUTES + 5 - minutesSince(order.createdAt, now)));
}

export function routeProgress(order, now = Date.now()) {
  if (!order) return 0;
  if (order.status === 'DELIVERED') return 1;
  if (order.status !== 'ON_THE_WAY') return 0;
  const p = minutesSince(order.onTheWayAt, now) / RIDE_MINUTES;
  return Math.min(0.94, Math.max(0.04, p));
}
