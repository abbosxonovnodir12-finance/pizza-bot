import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { makeLine, storage } from './utils.js';

const CartContext = createContext(null);
const KEY = 'tez_cart_v2';

function loadCart() {
  try {
    const parsed = JSON.parse(storage.get(KEY));
    return Array.isArray(parsed) ? parsed.filter((i) => i && i.key) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart);

  useEffect(() => {
    storage.set(KEY, JSON.stringify(items));
  }, [items]);

  const add = useCallback((line) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.key === line.key);
      if (existing) {
        return prev.map((i) =>
          i.key === line.key ? { ...i, quantity: Math.min(i.quantity + line.quantity, 50) } : i
        );
      }
      return [...prev, line];
    });
  }, []);

  const inc = useCallback((key) => {
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, quantity: Math.min(i.quantity + 1, 50) } : i)));
  }, []);

  const dec = useCallback((key) => {
    setItems((prev) =>
      prev.map((i) => (i.key === key ? { ...i, quantity: i.quantity - 1 } : i)).filter((i) => i.quantity > 0)
    );
  }, []);

  const remove = useCallback((key) => setItems((prev) => prev.filter((i) => i.key !== key)), []);

  const clear = useCallback(() => setItems([]), []);

  const replaceWith = useCallback((lines) => setItems(lines), []);

  const syncWithProducts = useCallback((products, options) => {
    const map = new Map(products.map((p) => [p.id, p]));
    setItems((prev) =>
      prev
        .filter((i) => map.has(i.productId))
        .map((i) =>
          makeLine(map.get(i.productId), { size: i.size, crust: i.crust, toppings: i.toppings || [] }, options, i.quantity)
        )
    );
  }, []);

  const value = useMemo(() => {
    const count = items.reduce((s, i) => s + i.quantity, 0);
    const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const qtyOfProduct = (id) => items.filter((i) => i.productId === id).reduce((s, i) => s + i.quantity, 0);
    return { items, count, total, qtyOfProduct, add, inc, dec, remove, clear, replaceWith, syncWithProducts };
  }, [items, add, inc, dec, remove, clear, replaceWith, syncWithProducts]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
