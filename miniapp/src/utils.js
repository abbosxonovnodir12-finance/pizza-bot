export const BRAND = 'TEZ';

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

/* ---------- Pizza options ---------- */

export function defaultSelection(options) {
  return { size: options?.defaults?.size || 'M', crust: options?.defaults?.crust || 'classic', toppings: [] };
}

export function unitPrice(product, sel, options) {
  if (!options) return product.newPrice;
  const size = options.sizes.find((s) => s.id === sel.size);
  const crust = options.crusts.find((c) => c.id === sel.crust);
  const tops = options.toppings.filter((t) => sel.toppings.includes(t.id));
  const price =
    product.newPrice + (size?.delta || 0) + (crust?.delta || 0) + tops.reduce((s, t) => s + t.price, 0);
  return Math.max(price, options.minUnitPrice || 0);
}

export function describeSelection(sel, options) {
  if (!options) return '';
  const size = options.sizes.find((s) => s.id === sel.size);
  const crust = options.crusts.find((c) => c.id === sel.crust);
  const tops = options.toppings.filter((t) => sel.toppings.includes(t.id));
  const parts = [];
  if (size) parts.push(`${size.name} ${size.cm} sm`);
  if (crust) parts.push(`${crust.name} xamir`);
  if (tops.length) parts.push(`+ ${tops.map((t) => t.name).join(', ')}`);
  return parts.join(' · ');
}

export function lineKey(productId, sel) {
  return [productId, sel.size, sel.crust, [...sel.toppings].sort().join('+')].join('|');
}

export function makeLine(product, sel, options, quantity = 1) {
  return {
    key: lineKey(product.id, sel),
    productId: product.id,
    name: product.name,
    imageUrl: product.imageUrl,
    size: sel.size,
    crust: sel.crust,
    toppings: [...sel.toppings],
    price: unitPrice(product, sel, options),
    options: describeSelection(sel, options),
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
