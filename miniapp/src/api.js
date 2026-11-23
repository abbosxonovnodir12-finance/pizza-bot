import { tg } from './telegram.js';

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`/api/client${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-Telegram-Init-Data': tg?.initData || '',
        ...options.headers,
      },
    });
  } catch {
    throw new Error("Internet bilan bog'lanib bo'lmadi");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Server bilan bog'lanib bo'lmadi");
  return data;
}

export const api = {
  me: () => request('/me'),
  products: () => request('/products'),
  myOrders: () => request('/orders'),
  order: (id) => request(`/orders/${id}`),
  createOrder: (body) => request('/orders', { method: 'POST', body: JSON.stringify(body) }),
};
