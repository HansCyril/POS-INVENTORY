import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from './supabase';
import { Category, Product, CartItem, Sale } from '@/types';

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface POSStore {
  // Categories
  categories: Category[];
  loading: boolean;
  demoMode: boolean;
  error: string | null;
  fetchCategories: () => Promise<void>;
  addCategory: (cat: Omit<Category, 'id' | 'createdAt'>) => Promise<void>;
  updateCategory: (id: string, cat: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  // Products
  products: Product[];
  fetchProducts: () => Promise<void>;
  addProduct: (prod: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProduct: (id: string, prod: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  adjustStock: (id: string, amount: number) => Promise<void>;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;

  // Sales
  sales: Sale[];
  fetchSales: () => Promise<void>;
  completeSale: (sale: Omit<Sale, 'id' | 'createdAt'>) => Promise<void>;
}

export const usePOSStore = create<POSStore>()(
  persist(
    (set, get) => ({
      categories: [],
      products: [],
      cart: [],
      sales: [],
      loading: true,
      demoMode: false,
      error: null, // Initialize error state

      fetchCategories: async () => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('created_at', { ascending: true });

          if (error) throw error;

          console.log('Categories fetched:', data?.length || 0);

          const categories: Category[] = (data || []).map((cat: Record<string, unknown>) => ({
            id: String(cat.id),
            name: String(cat.name),
            color: String(cat.color),
            createdAt: String(cat.created_at),
          }));

          set({ categories, loading: false });
        } catch (err: any) {
          console.error('Fetch categories failed, using mock data:', err);
          const mockCategories: Category[] = [];
          set({ categories: mockCategories, loading: false, error: null, demoMode: true });
        }
      },

      addCategory: async (cat) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('categories')
            .insert([{ name: cat.name, color: cat.color }])
            .select()
            .single();

          if (error) throw error;

          const newCategory: Category = {
            id: data.id,
            name: data.name,
            color: data.color,
            createdAt: data.created_at,
          };

          set((state) => ({
            categories: [...state.categories, newCategory],
            loading: false
          }));
        } catch (err: any) {
          set({ error: err.message || String(err), loading: false });
        }
      },

      updateCategory: async (id, cat) => {
        set({ loading: true, error: null });
        try {
          const { error } = await supabase
            .from('categories')
            .update({ name: cat.name, color: cat.color })
            .eq('id', id);

          if (error) throw error;

          set((state) => ({
            categories: state.categories.map((c) =>
              c.id === id ? { ...c, ...cat } : c
            ),
            loading: false
          }));
        } catch (err: any) {
          set({ error: err.message || String(err), loading: false });
        }
      },

      deleteCategory: async (id) => {
        set({ loading: true, error: null });
        try {
          const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', id);

          if (error) throw error;

          set((state) => ({
            categories: state.categories.filter((c) => c.id !== id),
            loading: false
          }));
        } catch (err: any) {
          set({ error: err.message || String(err), loading: false });
        }
      },

      fetchProducts: async () => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: true });

          if (error) throw error;

          const products: Product[] = (data || []).map((prod: Record<string, unknown>) => ({
            id: String(prod.id),
            name: String(prod.name),
            sku: String(prod.sku),
            price: parseFloat(String(prod.price)),
            cost: parseFloat(String(prod.cost)),
            stock: Number(prod.stock),
            minStock: Number(prod.min_stock),
            categoryId: String(prod.category_id),
            description: prod.description ? String(prod.description) : '',
            image: prod.image ? String(prod.image) : undefined,
            createdAt: String(prod.created_at),
            updatedAt: String(prod.updated_at),
          }));

          set({ products, loading: false });
        } catch (err: any) {
          console.error('Fetch products failed, using mock data:', err);
          const mockProducts: Product[] = [];
          set({ products: mockProducts, loading: false, error: null, demoMode: true });
        }
      },

      addProduct: async (prod) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('products')
            .insert([{
              name: prod.name,
              sku: prod.sku,
              price: prod.price,
              cost: prod.cost,
              stock: prod.stock,
              min_stock: prod.minStock,
              category_id: prod.categoryId,
              description: prod.description,
              image: prod.image,
            }])
            .select()
            .single();

          if (error) throw error;

          const newProduct: Product = {
            id: data.id,
            name: data.name,
            sku: data.sku,
            price: parseFloat(data.price),
            cost: parseFloat(data.cost),
            stock: data.stock,
            minStock: data.min_stock,
            categoryId: data.category_id,
            description: data.description,
            image: data.image,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          };

          set((state) => ({
            products: [...state.products, newProduct],
            loading: false
          }));
        } catch (err: any) {
          set({ error: err.message || String(err), loading: false });
        }
      },

      updateProduct: async (id, prod) => {
        set({ loading: true, error: null });
        try {
          const updateData: Record<string, unknown> = {};
          if (prod.name !== undefined) updateData.name = prod.name;
          if (prod.sku !== undefined) updateData.sku = prod.sku;
          if (prod.price !== undefined) updateData.price = prod.price;
          if (prod.cost !== undefined) updateData.cost = prod.cost;
          if (prod.stock !== undefined) updateData.stock = prod.stock;
          if (prod.minStock !== undefined) updateData.min_stock = prod.minStock;
          if (prod.categoryId !== undefined) updateData.category_id = prod.categoryId;
          if (prod.description !== undefined) updateData.description = prod.description;
          if (prod.image !== undefined) updateData.image = prod.image;
          updateData.updated_at = new Date().toISOString();

          const { error } = await supabase
            .from('products')
            .update(updateData)
            .eq('id', id);

          if (error) throw error;

          set((state) => ({
            products: state.products.map((p) =>
              p.id === id ? { ...p, ...prod, updatedAt: new Date().toISOString() } : p
            ),
            loading: false
          }));
        } catch (err: any) {
          set({ error: err.message || String(err), loading: false });
        }
      },

      deleteProduct: async (id) => {
        set({ loading: true, error: null });
        try {
          const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

          if (error) throw error;

          set((state) => ({
            products: state.products.filter((p) => p.id !== id),
            loading: false
          }));
        } catch (err: any) {
          set({ error: err.message || String(err), loading: false });
        }
      },

      adjustStock: async (id, amount) => {
        const state = get();
        const product = state.products.find((p) => p.id === id);
        if (!product) return;

        const newStock = Math.max(0, product.stock + amount);

        const { error } = await supabase
          .from('products')
          .update({ stock: newStock, updated_at: new Date().toISOString() })
          .eq('id', id);

        if (error) {
          console.error('Error adjusting stock:', error);
          return;
        }

        set((state) => ({
          products: state.products.map((p) =>
            p.id === id
              ? { ...p, stock: newStock, updatedAt: new Date().toISOString() }
              : p
          ),
        }));
      },

      addToCart: (product) =>
        set((state) => {
          const existing = state.cart.find((i) => i.product.id === product.id);
          if (existing) {
            if (existing.quantity >= product.stock) {
              return { error: `Cannot add more ${product.name}. Stock limit reached.` };
            }
            return {
              cart: state.cart.map((i) =>
                i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
              ),
              error: null
            };
          }
          if (product.stock <= 0) {
            return { error: `${product.name} is out of stock.` };
          }
          return { cart: [...state.cart, { product, quantity: 1 }], error: null };
        }),

      removeFromCart: (productId) =>
        set((state) => ({
          cart: state.cart.filter((i) => i.product.id !== productId),
        })),

      updateCartQuantity: (productId, quantity) =>
        set((state) => {
          const item = state.cart.find((i) => i.product.id === productId);
          if (!item) return state;

          // Check if requested quantity exceeds stock
          if (quantity > item.product.stock) {
            return {
              cart: state.cart.map((i) =>
                i.product.id === productId ? { ...i, quantity: item.product.stock } : i
              ),
            };
          }

          return {
            cart:
              quantity <= 0
                ? state.cart.filter((i) => i.product.id !== productId)
                : state.cart.map((i) =>
                    i.product.id === productId ? { ...i, quantity } : i
                  ),
          };
        }),

      clearCart: () => set({ cart: [] }),

      fetchSales: async () => {
        set({ loading: true, error: null });
        try {
          // Fetch sales with their items in a single query using a join
          const { data, error } = await supabase
            .from('sales')
            .select('*, sale_items(*)')
            .order('created_at', { ascending: false });

          if (error) throw error;

          const formattedSales: Sale[] = (data || []).map((sale: any) => ({
            id: String(sale.id),
            items: (sale.sale_items || []).map((item: any) => ({
              productId: String(item.product_id),
              productName: String(item.product_name),
              quantity: Number(item.quantity),
              price: parseFloat(String(item.price)),
              subtotal: parseFloat(String(item.subtotal)),
            })),
            total: parseFloat(String(sale.total)),
            tax: parseFloat(String(sale.tax)),
            discount: parseFloat(String(sale.discount)),
            grandTotal: parseFloat(String(sale.grand_total)),
            paymentMethod: sale.payment_method as 'cash' | 'card' | 'gcash',
            amountPaid: parseFloat(String(sale.amount_paid)),
            change: parseFloat(String(sale.change_amount)),
            createdAt: String(sale.created_at)
          }));

          set({ sales: formattedSales, loading: false });
        } catch (err: any) {
          console.error('Fetch sales failed, using mock data:', err);
          const mockSales: Sale[] = [];
          set({ sales: mockSales, loading: false, error: null, demoMode: true });
        }
      },

      completeSale: async (sale) => {
        set({ loading: true, error: null });
        try {
          const state = get();

          // Validate stock availability
          for (const item of sale.items) {
            const product = state.products.find((p) => p.id === item.productId);
            if (!product || product.stock < item.quantity) {
              throw new Error(`Insufficient stock for ${item.productName}. Available: ${product?.stock || 0}`);
            }
          }

          // Create sale record
          const { data: saleData, error: saleError } = await supabase
            .from('sales')
            .insert([{
              total: sale.total,
              tax: sale.tax,
              discount: sale.discount,
              grand_total: sale.grandTotal,
              payment_method: sale.paymentMethod,
              amount_paid: sale.amountPaid,
              change_amount: sale.change,
            }])
            .select()
            .single();

          if (saleError) throw saleError;

          // Create sale items
          const saleItems = sale.items.map((item) => ({
            sale_id: saleData.id,
            product_id: item.productId,
            product_name: item.productName,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.subtotal,
          }));

          const { error: itemsError } = await supabase
            .from('sale_items')
            .insert(saleItems);

          if (itemsError) throw itemsError;

          // Update stock in database
          for (const item of sale.items) {
            const product = state.products.find((p) => p.id === item.productId);
            if (product) {
              const { error: stockError } = await supabase
                .from('products')
                .update({
                  stock: Math.max(0, product.stock - item.quantity),
                  updated_at: new Date().toISOString()
                })
                .eq('id', item.productId);
              
              if (stockError) throw stockError;
            }
          }

          const newSale: Sale = {
            ...sale,
            id: saleData.id,
            createdAt: saleData.created_at,
          };

          set((state) => ({
            sales: [newSale, ...state.sales],
            products: state.products.map((p) => {
              const saleItem = sale.items.find((i) => i.productId === p.id);
              return saleItem ? { ...p, stock: Math.max(0, p.stock - saleItem.quantity), updatedAt: new Date().toISOString() } : p;
            }),
            cart: [],
            loading: false
          }));
        } catch (err: any) {
          set({ error: err.message || String(err), loading: false });
        }
      },
    }),
    {
      name: 'pos-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
      partialize: (state) => ({ cart: state.cart }), // Only persist the cart state
    }
  )
);
