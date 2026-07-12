import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "@/lib/api";
import { Product, Sale, InventoryMovement, CartItem, CashClose, Expense, PaymentMethod } from "@/types";

interface StoreData {
  products: Product[];
  sales: Sale[];
  movements: InventoryMovement[];
  cashCloses: CashClose[];
  todayExpenses: Expense[];
}

interface StoreContextType extends StoreData {
  cart: CartItem[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addProduct: (product: Omit<Product, "id" | "code">) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  completeSale: (paymentMethod: PaymentMethod, discount: number, cashReceived?: number) => Promise<Sale>;
  addMovement: (movement: Omit<InventoryMovement, "id" | "date">) => Promise<void>;
  closeCash: (actualCash: number) => Promise<void>;
  addExpense: (expense: Omit<Expense, "id" | "date">) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
}

const emptyStore: StoreData = { products: [], sales: [], movements: [], cashCloses: [], todayExpenses: [] };
const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [store, setStore] = useState<StoreData>(emptyStore);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      setStore(await api<StoreData>("/store"));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudo cargar la tienda");
      throw reason;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh().catch(() => undefined); }, [refresh]);

  const addProduct = async (product: Omit<Product, "id" | "code">) => {
    const created = await api<Product>("/products", { method: "POST", body: JSON.stringify(product) });
    setStore((current) => ({ ...current, products: [...current.products, created] }));
  };

  const updateProduct = async (product: Product) => {
    const updated = await api<Product>(`/products/${product.id}`, { method: "PUT", body: JSON.stringify(product) });
    setStore((current) => ({ ...current, products: current.products.map((item) => item.id === updated.id ? updated : item) }));
    setCart((current) => current.map((item) => item.product.id === updated.id ? { ...item, product: updated } : item));
  };

  const deleteProduct = async (id: string) => {
    await api<void>(`/products/${id}`, { method: "DELETE" });
    setStore((current) => ({ ...current, products: current.products.filter((item) => item.id !== id) }));
    setCart((current) => current.filter((item) => item.product.id !== id));
  };

  const addToCart = (product: Product) => setCart((current) => {
    const existing = current.find((item) => item.product.id === product.id);
    if (existing) return existing.quantity >= product.stock ? current : current.map((item) => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
    return product.stock > 0 ? [...current, { product, quantity: 1 }] : current;
  });

  const removeFromCart = (productId: string) => setCart((current) => current.filter((item) => item.product.id !== productId));
  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) return removeFromCart(productId);
    setCart((current) => current.map((item) => item.product.id === productId ? { ...item, quantity: Math.min(quantity, item.product.stock) } : item));
  };
  const clearCart = () => setCart([]);

  const completeSale = async (paymentMethod: PaymentMethod, discount: number, cashReceived?: number) => {
    const sale = await api<Sale>("/sales", {
      method: "POST",
      body: JSON.stringify({ items: cart.map((item) => ({ productId: item.product.id, quantity: item.quantity })), paymentMethod, discount, cashReceived })
    });
    clearCart();
    await refresh();
    return sale;
  };

  const addMovement = async (movement: Omit<InventoryMovement, "id" | "date">) => {
    await api<InventoryMovement>("/movements", { method: "POST", body: JSON.stringify(movement) });
    await refresh();
  };

  const addExpense = async (expense: Omit<Expense, "id" | "date">) => {
    const created = await api<Expense>("/expenses", { method: "POST", body: JSON.stringify(expense) });
    setStore((current) => ({ ...current, todayExpenses: [...current.todayExpenses, created] }));
  };

  const deleteExpense = async (id: string) => {
    await api<void>(`/expenses/${id}`, { method: "DELETE" });
    setStore((current) => ({ ...current, todayExpenses: current.todayExpenses.filter((expense) => expense.id !== id) }));
  };

  const closeCash = async (actualCash: number) => {
    await api<CashClose>("/cash-closes", { method: "POST", body: JSON.stringify({ actualCash }) });
    await refresh();
  };

  return <StoreContext.Provider value={{ ...store, cart, loading, error, refresh, addProduct, updateProduct, deleteProduct, addToCart, removeFromCart, updateCartQuantity, clearCart, completeSale, addMovement, closeCash, addExpense, deleteExpense }}>{children}</StoreContext.Provider>;
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore debe usarse dentro de StoreProvider");
  return context;
};
