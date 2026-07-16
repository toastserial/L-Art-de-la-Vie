export interface Product { id: string; name: string; category: string; price: number; stock: number; image?: string }
export interface CartItem extends Product { quantity: number }
export interface Customer { id: string; email: string; fullName: string; phone: string; customerSince?: string | null }
