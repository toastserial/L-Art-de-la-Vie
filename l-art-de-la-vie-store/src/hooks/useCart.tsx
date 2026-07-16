import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from "react";
import type { CartItem, Product } from "@/types/product";
import { useHydrated } from "./useHydrated";

const STORAGE_KEY = "lartdelavie:cart:v1";

type State = { items: CartItem[] };

type Action =
  | { type: "add"; product: Product; quantity?: number }
  | { type: "setQty"; id: string; quantity: number }
  | { type: "remove"; id: string }
  | { type: "clear" }
  | { type: "hydrate"; items: CartItem[] }
  | { type: "reconcile"; products: Product[] };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "hydrate":
      return { items: action.items };
    case "add": {
      const q = action.quantity ?? 1;
      const existing = state.items.find((i) => i.id === action.product.id);
      if (existing) {
        const next = Math.min(existing.stock, existing.quantity + q);
        return {
          items: state.items.map((i) => (i.id === existing.id ? { ...i, quantity: next } : i)),
        };
      }
      const p = action.product;
      if (p.stock <= 0) return state;
      return {
        items: [
          ...state.items,
          {
            id: p.id,
            name: p.name,
            category: p.category,
            price: p.price,
            image: p.image,
            stock: p.stock,
            quantity: Math.min(p.stock, q),
          },
        ],
      };
    }
    case "setQty": {
      return {
        items: state.items
          .map((i) =>
            i.id === action.id
              ? { ...i, quantity: Math.max(0, Math.min(i.stock, action.quantity)) }
              : i,
          )
          .filter((i) => i.quantity > 0),
      };
    }
    case "remove":
      return { items: state.items.filter((i) => i.id !== action.id) };
    case "clear":
      return { items: [] };
    case "reconcile": {
      const map = new Map(action.products.map((p) => [p.id, p]));
      const next: CartItem[] = [];
      for (const it of state.items) {
        const fresh = map.get(it.id);
        if (!fresh || fresh.stock <= 0) continue;
        next.push({
          ...it,
          name: fresh.name,
          category: fresh.category,
          price: fresh.price,
          image: fresh.image,
          stock: fresh.stock,
          quantity: Math.min(it.quantity, fresh.stock),
        });
      }
      return { items: next };
    }
    default:
      return state;
  }
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  add: (product: Product, quantity?: number) => void;
  setQty: (id: string, quantity: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  reconcile: (products: Product[]) => void;
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [] });
  const hydrated = useHydrated();
  const loadedRef = useRef(false);
  const isOpenRef = useRef(false);
  const [, force] = useReducer((x: number) => x + 1, 0);

  // hydrate from localStorage
  useEffect(() => {
    if (!hydrated) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { items?: CartItem[] };
        if (parsed && Array.isArray(parsed.items)) {
          dispatch({ type: "hydrate", items: parsed.items });
        }
      }
    } catch {
      /* ignore */
    } finally {
      loadedRef.current = true;
    }
  }, [hydrated]);

  // persist
  useEffect(() => {
    if (!hydrated || !loadedRef.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ items: state.items }));
    } catch {
      /* ignore */
    }
  }, [hydrated, state.items]);

  const value = useMemo<CartContextValue>(() => {
    const count = state.items.reduce((s, i) => s + i.quantity, 0);
    const subtotal = state.items.reduce((s, i) => s + i.price * i.quantity, 0);
    return {
      items: state.items,
      count,
      subtotal,
      add: (product, q) => dispatch({ type: "add", product, quantity: q }),
      setQty: (id, q) => dispatch({ type: "setQty", id, quantity: q }),
      remove: (id) => dispatch({ type: "remove", id }),
      clear: () => dispatch({ type: "clear" }),
      reconcile: (products) => dispatch({ type: "reconcile", products }),
      isOpen: isOpenRef.current,
      open: () => {
        isOpenRef.current = true;
        force();
      },
      close: () => {
        isOpenRef.current = false;
        force();
      },
    };
  }, [state.items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
