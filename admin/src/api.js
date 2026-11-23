const TOKEN_KEY = 'pizza_admin_token';

export const auth = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

let onUnauthorized = () => {};
export const setUnauthorizedHandler = (fn) => {
  onUnauthorized = fn;
};

async function request(path, { method = 'GET', body } = {}) {
  const token = auth.get();
  let res;
  try {
    res = await fetch(`/api/admin${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Backend bilan bog'lanib bo'lmadi. Backend ishga tushganini tekshiring.");
  }
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && path !== '/login') {
    auth.clear();
    onUnauthorized();
  }
  if (!res.ok) {
    throw new Error(data.error || (res.status >= 500 ? 'Backend ishlamayapti' : 'Xatolik yuz berdi'));
  }
  return data;
}

export const api = {
  login: (password) => request('/login', { method: 'POST', body: { password } }),
  stats: () => request('/stats'),
  orders: (status) => request(`/orders${status ? `?status=${status}` : ''}`),
  setOrderStatus: (id, status, extra = {}) =>
    request(`/orders/${id}/status`, { method: 'PATCH', body: { status, ...extra } }),
  products: () => request('/products'),
  createProduct: (data) => request('/products', { method: 'POST', body: data }),
  updateProduct: (id, data) => request(`/products/${id}`, { method: 'PUT', body: data }),
  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE' }),
};
