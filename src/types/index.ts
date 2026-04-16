export interface Category {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  categoryId: string;
  description: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Sale {
  id: string;
  items: SaleItem[];
  total: number;
  tax: number;
  discount: number;
  grandTotal: number;
  paymentMethod: 'cash' | 'card' | 'gcash';
  amountPaid: number;
  change: number;
  createdAt: string;
}
