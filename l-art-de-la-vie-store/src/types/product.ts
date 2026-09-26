export type Category = string;

export interface Product {
  id: string;
  name: string;
  category: Category;
  price: number;
  originalPrice?: number;
  discountPercent: number;
  stock: number;
  image: string;
  description: string;
  specifications: Record<string, string>;
}

export interface CartItem {
  id: string;
  name: string;
  category: Category;
  price: number;
  originalPrice?: number;
  discountPercent: number;
  image: string;
  quantity: number;
  stock: number;
}
