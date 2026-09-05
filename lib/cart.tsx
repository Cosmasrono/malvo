"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export type CartLine = {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  image?: string;
};

const STORAGE_KEY = "maggy-cart-v1";
const MAX_QUANTITY = 99;

// ---------------------------------------------------------------------------
// Store
//
// The cart lives outside React in a small observable store backed by
// localStorage. useSyncExternalStore then gives us the server/client split for
// free: the server and the hydrating render both see an empty cart, and React
// swaps in the stored one immediately afterwards — no effect writing state,
// and no hydration mismatch.
// ---------------------------------------------------------------------------

/** Stable identity so the server snapshot never looks "changed". */
const EMPTY: CartLine[] = [];

let lines: CartLine[] = EMPTY;
let hydrated = false;
const listeners = new Set<() => void>();

function isValidLine(line: unknown): line is CartLine {
  if (!line || typeof line !== "object") return false;
  const candidate = line as Record<string, unknown>;
  return (
    typeof candidate.productId === "string" &&
    typeof candidate.name === "string" &&
    typeof candidate.unitPrice === "number" &&
    Number.isFinite(candidate.unitPrice) &&
    typeof candidate.quantity === "number" &&
    Number.isFinite(candidate.quantity) &&
    candidate.quantity > 0
  );
}

/** Reads the saved cart once, dropping anything malformed. */
function hydrate() {
  if (hydrated) return;
  hydrated = true;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) lines = parsed.filter(isValidLine);
  } catch {
    // Unreadable or blocked storage just means an empty cart.
  }
}

function persist() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch {
    // A full or blocked quota must never break checkout.
  }
}

function setLines(next: CartLine[]) {
  lines = next;
  persist();
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  hydrate();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getSnapshot = () => lines;
const getServerSnapshot = () => EMPTY;

// ---------------------------------------------------------------------------
// React binding
// ---------------------------------------------------------------------------

type CartContextValue = {
  lines: CartLine[];
  count: number;
  total: number;
  /** False until the stored cart has been read, so the UI can hold off. */
  ready: boolean;
  add: (line: Omit<CartLine, "quantity">, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const current = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const ready = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  const add = useCallback((line: Omit<CartLine, "quantity">, quantity = 1) => {
    const existing = lines.find((item) => item.productId === line.productId);

    setLines(
      existing
        ? lines.map((item) =>
            item.productId === line.productId
              ? { ...item, quantity: Math.min(item.quantity + quantity, MAX_QUANTITY) }
              : item,
          )
        : [...lines, { ...line, quantity }],
    );
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    setLines(
      quantity <= 0
        ? lines.filter((item) => item.productId !== productId)
        : lines.map((item) =>
            item.productId === productId
              ? { ...item, quantity: Math.min(quantity, MAX_QUANTITY) }
              : item,
          ),
    );
  }, []);

  const remove = useCallback((productId: string) => {
    setLines(lines.filter((item) => item.productId !== productId));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartContextValue>(() => {
    const count = current.reduce((sum, line) => sum + line.quantity, 0);
    const total = current.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
    return { lines: current, count, total, ready, add, setQuantity, remove, clear };
  }, [current, ready, add, setQuantity, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside <CartProvider>");
  return context;
}
