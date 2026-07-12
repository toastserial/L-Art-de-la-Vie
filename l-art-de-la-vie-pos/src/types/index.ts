export type Category = "Decoración" | "Perfumes" | "Carteras" | "Varios";

export interface Product {
  id: string;
  code: string;
  name: string;
  category: Category;
  price: number;
  stock: number;
  minStock: number;
  image?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type PaymentMethod = "efectivo" | "tarjeta" | "transferencia";

export interface Sale {
  id: string;
  date: string;
  items: { productId: string; productName: string; quantity: number; unitPrice: number; subtotal: number }[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  cashReceived?: number;
  change?: number;
}

export interface InventoryMovement {
  id: string;
  productId: string;
  productName: string;
  type: "entrada" | "salida" | "venta";
  quantity: number;
  date: string;
  note?: string;
}

export interface CashClose {
  id: string;
  date: string;
  totalSales: number;
  salesByMethod: { efectivo: number; tarjeta: number; transferencia: number };
  expectedCash: number;
  actualCash: number;
  difference: number;
  expenses: Expense[];
  totalExpenses: number;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
}
