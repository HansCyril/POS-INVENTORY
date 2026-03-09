import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Category, Product, CartItem, Sale } from './types';

interface POSStore {
  // Categories
  categories: Category[];
  addCategory: (cat: Omit<Category, 'id' | 'createdAt'>) => void;
  updateCategory: (id: string, cat: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  // Products
  products: Product[];
  addProduct: (prod: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (id: string, prod: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  adjustStock: (id: string, amount: number) => void;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;

  // Sales
  sales: Sale[];
  completeSale: (sale: Omit<Sale, 'id' | 'createdAt'>) => void;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

const defaultCategories: Category[] = [
  { id: 'cat-1', name: 'Food & Beverage', color: '#3B82F6', createdAt: new Date().toISOString() },
  { id: 'cat-2', name: 'Electronics', color: '#10B981', createdAt: new Date().toISOString() },
  { id: 'cat-3', name: 'Clothing', color: '#F59E0B', createdAt: new Date().toISOString() },
];

const defaultProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'Coffee',
    sku: 'BEV-001',
    price: 120,
    cost: 40,
    stock: 50,
    minStock: 10,
    categoryId: 'cat-1',
    description: 'Brewed coffee',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-2',
    name: 'Bottled Water',
    sku: 'BEV-002',
    price: 35,
    cost: 15,
    stock: 100,
    minStock: 20,
    categoryId: 'cat-1',
    description: '500ml bottled water',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-3',
    name: 'USB Cable',
    sku: 'ELEC-001',
    price: 199,
    cost: 80,
    stock: 30,
    minStock: 5,
    categoryId: 'cat-2',
    description: 'Type-C USB cable 1m',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const usePOSStore = create<POSStore>()(
  persist(
    (set) => ({
      categories: defaultCategories,
      products: defaultProducts,
      cart: [],
      sales: [],

      addCategory: (cat) =>
        set((state) => ({
          categories: [
            ...state.categories,
            { ...cat, id: generateId(), createdAt: new Date().toISOString() },
          ],
        })),
      updateCategory: (id, cat) =>
        set((state) => ({
          categories: state.categories.map((c) => (c.id === id ? { ...c, ...cat } : c)),
        })),
      deleteCategory: (id) =>
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
        })),

      addProduct: (prod) =>
        set((state) => ({
          products: [
            ...state.products,
            {
              ...prod,
              id: generateId(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        })),
      updateProduct: (id, prod) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? { ...p, ...prod, updatedAt: new Date().toISOString() } : p
          ),
        })),
      deleteProduct: (id) =>
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        })),
      adjustStock: (id, amount) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id
              ? { ...p, stock: Math.max(0, p.stock + amount), updatedAt: new Date().toISOString() }
              : p
          ),
        })),

      addToCart: (product) =>
        set((state) => {
          const existing = state.cart.find((i) => i.product.id === product.id);
          if (existing) {
            return {
              cart: state.cart.map((i) =>
                i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
              ),
            };
          }
          return { cart: [...state.cart, { product, quantity: 1 }] };
        }),
      removeFromCart: (productId) =>
        set((state) => ({
          cart: state.cart.filter((i) => i.product.id !== productId),
        })),
      updateCartQuantity: (productId, quantity) =>
        set((state) => ({
          cart:
            quantity <= 0
              ? state.cart.filter((i) => i.product.id !== productId)
              : state.cart.map((i) =>
                  i.product.id === productId ? { ...i, quantity } : i
                ),
        })),
      clearCart: () => set({ cart: [] }),

      completeSale: (sale) =>
        set((state) => {
          const newSale: Sale = {
            ...sale,
            id: generateId(),
            createdAt: new Date().toISOString(),
          };
          // Deduct stock
          const updatedProducts = state.products.map((p) => {
            const saleItem = sale.items.find((i) => i.productId === p.id);
            if (saleItem) {
              return {
                ...p,
                stock: Math.max(0, p.stock - saleItem.quantity),
                updatedAt: new Date().toISOString(),
              };
            }
            return p;
          });
          return {
            sales: [newSale, ...state.sales],
            products: updatedProducts,
            cart: [],
          };
        }),
    }),
    {
      name: 'pos-storage',
    }
  )
);
