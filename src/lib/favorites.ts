import { useSyncExternalStore } from "react";

export const FAVORITES_KEY = "uc:favorites:v1";

let cache: string[] = [];
let loaded = false;
const listeners = new Set<() => void>();

function read(): string[] {
  try {
    const v = JSON.parse(window.localStorage.getItem(FAVORITES_KEY) ?? "[]");
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function ensure() {
  if (!loaded && typeof window !== "undefined") {
    cache = read();
    loaded = true;
    window.addEventListener("storage", (e) => {
      if (e.key === FAVORITES_KEY) {
        cache = read();
        listeners.forEach((l) => l());
      }
    });
  }
}

function write(next: string[]) {
  cache = next;
  try {
    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable (private mode): keep in-memory only */
  }
  listeners.forEach((l) => l());
}

const EMPTY: string[] = [];

export function useFavorites() {
  const list = useSyncExternalStore(
    (cb) => {
      ensure();
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => {
      ensure();
      return cache;
    },
    () => EMPTY,
  );
  return {
    list,
    has: (sku: string) => list.includes(sku),
    toggle: (sku: string) => {
      ensure();
      const on = cache.includes(sku);
      write(on ? cache.filter((s) => s !== sku) : [...cache, sku]);
      return !on;
    },
    clear: () => write([]),
  };
}
