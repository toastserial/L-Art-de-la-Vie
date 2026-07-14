import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import type { CartItem, CashClose, CashOpening, Expense, InventoryMovement, PaymentMethod, Product, Sale, StoreData } from "../types";

interface StoreValue extends StoreData {
  cart: CartItem[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  cartCount: number;
  cartSubtotal: number;
  refresh(silent?: boolean): Promise<void>;
  addToCart(product: Product): void;
  removeFromCart(productId: string): void;
  updateCartQuantity(productId: string, quantity: number): void;
  clearCart(): void;
  completeSale(method: PaymentMethod, discount: number, cashReceived?: number): Promise<Sale>;
  addProduct(product: Omit<Product, "id" | "code">): Promise<void>;
  updateProduct(product: Product): Promise<void>;
  deleteProduct(id: string): Promise<void>;
  addMovement(productId: string, type: "entrada" | "salida", quantity: number, note?: string): Promise<void>;
  openCash(openingCash: number, note?: string): Promise<void>;
  closeCash(actualCash: number): Promise<void>;
  addExpense(description: string, amount: number): Promise<void>;
  deleteExpense(id: string): Promise<void>;
}

const empty: StoreData = { products: [], sales: [], movements: [], cashCloses: [], todayExpenses: [], cashOpening: null };
const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: PropsWithChildren) {
  const [store, setStore] = useState<StoreData>(empty);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true); else setLoading(true);
    try {
      setError(null);
      setStore(await api<StoreData>("/store"));
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : "No se pudo cargar la tienda";
      setError(message);
      throw reason;
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { refresh().catch(() => undefined); }, [refresh]);

  const addToCart = (product: Product) => setCart(current => {
    const existing = current.find(item => item.product.id === product.id);
    if (existing) {
      if (existing.quantity >= product.stock) return current;
      return current.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
    }
    return product.stock > 0 ? [...current, { product, quantity: 1 }] : current;
  });
  const removeFromCart = (id: string) => setCart(current => current.filter(item => item.product.id !== id));
  const updateCartQuantity = (id: string, quantity: number) => setCart(current => quantity <= 0
    ? current.filter(item => item.product.id !== id)
    : current.map(item => item.product.id === id ? { ...item, quantity: Math.min(quantity, item.product.stock) } : item));
  const clearCart = () => setCart([]);

  const completeSale = async (paymentMethod: PaymentMethod, discount: number, cashReceived?: number) => {
    const sale = await api<Sale>("/sales", { method: "POST", body: JSON.stringify({
      items: cart.map(item => ({ productId: item.product.id, quantity: item.quantity })), paymentMethod, discount, cashReceived,
    }) });
    clearCart();
    await refresh(true);
    return sale;
  };

  const addProduct = async (product: Omit<Product, "id" | "code">) => {
    await api<Product>("/products", { method: "POST", body: JSON.stringify(product) });
    await refresh(true);
  };
  const updateProduct = async (product: Product) => {
    await api<Product>(`/products/${product.id}`, { method: "PUT", body: JSON.stringify(product) });
    await refresh(true);
  };
  const deleteProduct = async (id: string) => {
    await api<void>(`/products/${id}`, { method: "DELETE" });
    removeFromCart(id);
    await refresh(true);
  };
  const addMovement = async (productId: string, type: "entrada" | "salida", quantity: number, note?: string) => {
    await api<InventoryMovement>("/movements", { method: "POST", body: JSON.stringify({ productId, type, quantity, note }) });
    await refresh(true);
  };
  const openCash = async (openingCash: number, note?: string) => {
    const created = await api<CashOpening>("/cash-openings", { method: "POST", body: JSON.stringify({ openingCash, note }) });
    setStore(current => ({ ...current, cashOpening: created }));
  };
  const closeCash = async (actualCash: number) => {
    await api<CashClose>("/cash-closes", { method: "POST", body: JSON.stringify({ actualCash }) });
    await refresh(true);
  };
  const addExpense = async (description: string, amount: number) => {
    const created = await api<Expense>("/expenses", { method: "POST", body: JSON.stringify({ description, amount }) });
    setStore(current => ({ ...current, todayExpenses: [...current.todayExpenses, created] }));
  };
  const deleteExpense = async (id: string) => {
    await api<void>(`/expenses/${id}`, { method: "DELETE" });
    setStore(current => ({ ...current, todayExpenses: current.todayExpenses.filter(item => item.id !== id) }));
  };

  const value = useMemo<StoreValue>(() => ({
    ...store, cart, loading, refreshing, error, refresh, addToCart, removeFromCart, updateCartQuantity, clearCart,
    completeSale, addProduct, updateProduct, deleteProduct, addMovement, openCash, closeCash, addExpense, deleteExpense,
    cartCount: cart.reduce((sum, item) => sum + item.quantity, 0),
    cartSubtotal: cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
  }), [store, cart, loading, refreshing, error, refresh]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const value = useContext(StoreContext);
  if (!value) throw new Error("useStore debe usarse dentro de StoreProvider");
  return value;
}
