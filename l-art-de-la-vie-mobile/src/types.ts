export type Category = "Decoración" | "Perfumes" | "Carteras" | "Varios";
export type PaymentMethod = "efectivo" | "tarjeta" | "transferencia";
export type StoreRole = "owner" | "admin" | "cashier";

export interface AppUser { id: string; email: string; fullName: string; role: StoreRole }
export interface Product { id: string; code: string; name: string; category: Category; price: number; stock: number; minStock: number; image?: string }
export interface CartItem { product: Product; quantity: number }
export interface SaleItem { productId: string; productName: string; quantity: number; unitPrice: number; subtotal: number }
export interface Sale { id: string; date: string; items: SaleItem[]; subtotal: number; discount: number; total: number; paymentMethod: PaymentMethod; cashReceived?: number; change?: number }
export interface InventoryMovement { id: string; productId: string; productName: string; type: "entrada" | "salida" | "venta"; quantity: number; date: string; note?: string }
export interface Expense { id: string; description: string; amount: number; date: string }
export interface CashOpening { id: string; date: string; openingCash: number; openedAt: string; note?: string }
export interface CashClose { id: string; date: string; totalSales: number; salesByMethod: Record<PaymentMethod, number>; expectedCash: number; actualCash: number; difference: number; expenses: Expense[]; totalExpenses: number; openingCash: number }
export interface StoreData { products: Product[]; sales: Sale[]; movements: InventoryMovement[]; cashCloses: CashClose[]; todayExpenses: Expense[]; cashOpening: CashOpening | null }
