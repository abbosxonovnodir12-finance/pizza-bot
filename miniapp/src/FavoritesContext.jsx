import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { storage } from './utils.js';

const FavoritesContext = createContext(null);
const KEY = 'tez_favorites_v1';

function load() {
  try {
    const parsed = JSON.parse(storage.get(KEY));
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

export function FavoritesProvider({ children }) {
  const [ids, setIds] = useState(load);

  useEffect(() => {
    storage.set(KEY, JSON.stringify([...ids]));
  }, [ids]);

  const toggle = useCallback((id) => {
    setIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const value = useMemo(() => ({ ids, has: (id) => ids.has(id), toggle }), [ids, toggle]);
  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export const useFavorites = () => useContext(FavoritesContext);
