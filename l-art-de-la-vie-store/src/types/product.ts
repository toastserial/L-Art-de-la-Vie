export type Category = "Decoración" | "Perfumes" | "Carteras" | "Varios";

export const CATEGORIES: Category[] = ["Decoración", "Perfumes", "Carteras", "Varios"];

export interface Product {
  id: string;
  name: string;
  category: Category;
  price: number;
  stock: number;
  image: string;
}

export interface CartItem {
  id: string;
  name: string;
  category: Category;
  price: number;
  image: string;
  quantity: number;
  stock: number;
}
