'use client';
import { useState, useEffect } from 'react';
import { usePOSStore } from '@/lib/store';
import { APP_CONFIG, formatCurrency } from '@/lib/config';
import ErrorBanner from '@/components/ui/ErrorBanner';
import Image from 'next/image';
import { ShoppingCart, Plus, Minus, Search, CreditCard, Banknote, Smartphone, Receipt, X, CheckCircle, TrendingUp } from 'lucide-react';

type PaymentMethod = 'cash' | 'card' | 'gcash';

export default function POSPage() {
  const { products, categories, cart, addToCart, removeFromCart, updateCartQuantity, clearCart, completeSale, fetchProducts, fetchCategories } = usePOSStore();
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [payMethod, setPayMethod] = useState<PaymentMethod>('cash');
  const [amountPaid, setAmountPaid] = useState('');
  const [discount, setDiscount] = useState('');
  const [showReceipt, setShowReceipt] = useState<null | { items: { productId: string; productName: string; quantity: number; price: number; subtotal: number; }[]; total: number; tax: number; discount: number; grandTotal: number; paymentMethod: PaymentMethod; amountPaid: number; change: number; }>(null);
  const [selectedProduct, setSelectedProduct] = useState<null | (typeof products)[0]>(null);

  const [visibleCount, setVisibleCount] = useState(20);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  useEffect(() => {
    setVisibleCount(20);
  }, [search, filterCat]);

  useEffect(() => {
    const handleFocus = () => { fetchCategories(); fetchProducts(); };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchCategories, fetchProducts]);

  const TAX_RATE = APP_CONFIG.taxRate;
  const subtotal = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const discountAmt = parseFloat(discount) || 0;
  const taxableAmount = Math.max(0, subtotal - discountAmt);
  const tax = taxableAmount * TAX_RATE;
  const grandTotal = taxableAmount + tax;
  const paid = parseFloat(amountPaid) || 0;
  const change = Math.max(0, paid - grandTotal);

  const filteredProducts = products.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch = p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
    const matchCat = !filterCat || p.categoryId === filterCat;
    return matchSearch && matchCat && p.stock > 0;
  });

  const displayProducts = filteredProducts.slice(0, visibleCount);

  type SaleItem = { productId: string; productName: string; quantity: number; price: number; subtotal: number; };
  type ReceiptData = { items: SaleItem[]; total: number; tax: number; discount: number; grandTotal: number; paymentMethod: PaymentMethod; amountPaid: number; change: number; };

  const handleCompleteSale = () => {
    if (cart.length === 0) return;
    if (payMethod === 'cash' && paid < grandTotal) { alert('Insufficient payment amount'); return; }
    const saleData: ReceiptData = {
      items: cart.map((i) => ({ productId: i.product.id, productName: i.product.name, quantity: i.quantity, price: i.product.price, subtotal: i.product.price * i.quantity })),
      total: subtotal, tax, discount: discountAmt, grandTotal,
      paymentMethod: payMethod,
      amountPaid: payMethod === 'cash' ? paid : grandTotal,
      change: payMethod === 'cash' ? change : 0,
    };
    completeSale(saleData);
    setShowReceipt(saleData);
    setAmountPaid('');
    setDiscount('');
  };

  return (
    <div className="flex h-full transition-colors duration-300">
      {/* Products Grid */}
      <div className="flex-1 flex flex-col overflow-hidden p-3 gap-3">
        {usePOSStore.getState().error && (
          <ErrorBanner message={usePOSStore.getState().error!} onRetry={() => { fetchProducts(); fetchCategories(); }} />
        )}

        {/* Search + Filter */}
        <div className="flex gap-3 items-center">
          <div className="flex items-center gap-3 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700/40 rounded-xl px-4 py-2.5 flex-1 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500/50 transition-all duration-300 group shadow-sm">
            <Search className="w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              className="flex-1 text-xs bg-transparent outline-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-bold uppercase tracking-tight"
              placeholder="Search by name or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="relative w-36">
            <select
              className="w-full appearance-none bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700/40 rounded-xl px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 shadow-sm transition-all cursor-pointer pr-8"
              value={filterCat}
              onChange={(e) => setFilterCat(e.target.value)}
            >
              <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Quick Filter</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{c.name}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <Plus className="w-3 h-3 rotate-45" />
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center justify-between pb-0.5">
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide flex-1">
            <button
              onClick={() => setFilterCat('')}
              className={`px-3 py-1 rounded-lg text-[9px] font-black whitespace-nowrap tracking-wider uppercase transition-all duration-300 ${!filterCat ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/40 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'}`}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setFilterCat(filterCat === c.id ? '' : c.id)}
                className={`px-3 py-1 rounded-lg text-[9px] font-black whitespace-nowrap tracking-wider uppercase border transition-all duration-300 ${filterCat === c.id ? 'text-white border-transparent shadow-lg' : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/40 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'}`}
                style={filterCat === c.id ? { backgroundColor: c.color, boxShadow: `0 4px 10px -2px ${c.color}40` } : {}}
              >
                {c.name}
              </button>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-slate-700/40 ml-3">
            <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Total
            </span>
            <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[9px] font-black text-indigo-600 dark:text-indigo-400 min-w-[20px] text-center">
              {filteredProducts.length}
            </span>
          </div>
        </div>

        {/* Product Grid - Consistent Format */}
        <div className="flex-1 overflow-y-auto pb-10 scrollbar-thin px-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {displayProducts.map((p) => {
              const cartItem = cart.find((i) => i.product.id === p.id);
              const isOutOfStock = cartItem && cartItem.quantity >= p.stock;
              
              return (
                <button
                  key={p.id}
                  onClick={() => addToCart(p)}
                  disabled={isOutOfStock}
                  className={`bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/40 rounded-xl p-3 text-left group relative flex flex-col items-center justify-center text-center overflow-hidden transition-all shadow-sm hover:border-indigo-500/30 ${
                    isOutOfStock ? 'opacity-60 grayscale-[0.5] cursor-not-allowed' : 'active:scale-95'
                  }`}
                >
                  {p.image ? (
                    <Image 
                      alt={p.name} 
                      src={p.image} 
                      fill
                      className="object-cover opacity-20 dark:opacity-30 group-hover:opacity-40 dark:group-hover:opacity-50 transition-opacity duration-500" 
                      unoptimized={p.image.startsWith('http')}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-5xl opacity-5">🛒</div>
                  )}
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 dark:from-slate-900 dark:via-slate-900/80 to-transparent"></div>
                  
                  {/* Action Overlay */}
                  <div className="absolute top-2 right-2 flex gap-1 z-20">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSelectedProduct(p); }}
                      className="w-6 h-6 rounded-md bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm flex items-center justify-center text-slate-400 hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Search className="w-3 h-3" />
                    </button>
                    {cartItem && (
                      <div className="w-6 h-6 rounded-md bg-indigo-500 text-white flex items-center justify-center text-[9px] font-black shadow-lg">
                        {cartItem.quantity}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-center justify-center relative z-10 mt-auto pt-8">
                    <p className="font-semibold text-slate-900 dark:text-white text-xs leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors uppercase tracking-tight line-clamp-2 min-h-[24px]">
                      {p.name}
                    </p>
                    <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5 uppercase tracking-wider font-medium">
                      {p.sku}
                    </p>
                    <p className="mt-1.5 font-black text-emerald-600 dark:text-emerald-400 text-sm">
                      {formatCurrency(p.price)}
                    </p>
                    <div className={`text-[9px] mt-1 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      p.stock <= p.minStock ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    }`}>
                      {p.stock - (cartItem?.quantity || 0)} available
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* View More Products */}
          {visibleCount < filteredProducts.length && (
            <div className="mt-8 flex justify-center">
              <button 
                onClick={() => setVisibleCount(prev => prev + 20)}
                className="px-8 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-indigo-500 hover:border-indigo-500/30 transition-all shadow-sm active:scale-95"
              >
                View More Products
              </button>
            </div>
          )}

          {filteredProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 bg-slate-900/10 dark:bg-slate-900/40 rounded-[32px] border border-dashed border-slate-700/20">
              <ShoppingCart className="w-10 h-10 text-slate-300 dark:text-slate-700 mb-4" />
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No products match your criteria</p>
            </div>
          )}
        </div>
      </div>

      {/* Cart Sidebar */}
      <div className="w-[300px] bg-white/80 dark:bg-slate-900/60 backdrop-blur-2xl border-l border-slate-200 dark:border-white/5 flex flex-col shrink-0 shadow-[-5px_0_15px_rgba(0,0,0,0.05)] dark:shadow-[-5px_0_15px_rgba(0,0,0,0.3)] z-10 transition-colors duration-300">
        <div className="px-4 py-3 border-b border-slate-200 dark:border-white/5 flex items-center justify-between bg-slate-50 dark:bg-slate-800/30">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm uppercase tracking-tight">
            <ShoppingCart className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
            Order
            {cart.length > 0 && <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-[10px] px-1.5 py-0.5 rounded-full shadow-sm">{cart.length}</span>}
          </h3>
          {cart.length > 0 && (
            <button onClick={clearCart} className="text-[10px] font-bold text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors uppercase tracking-wider px-1.5 py-0.5 rounded hover:bg-red-500/10">Clear</button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2 scrollbar-thin">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500 py-8">
              <ShoppingCart className="w-8 h-8 opacity-20 mb-2" />
              <p className="text-xs font-semibold">Cart is empty</p>
              <p className="text-[10px] mt-0.5">Tap products to add</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.product.id} className="flex flex-col gap-2 py-2 px-3 bg-white dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/40 rounded-lg shadow-sm">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0 pr-2 flex items-center gap-2">
                    {item.product.image ? (
                      <div className="w-8 h-8 rounded-md overflow-hidden flex-shrink-0 bg-slate-50 dark:bg-slate-900 relative border border-slate-100 dark:border-white/5">
                        <Image 
                          src={item.product.image} 
                          alt={item.product.name} 
                          fill 
                          className="object-cover" 
                          unoptimized={item.product.image.startsWith('http')}
                        />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-md flex-shrink-0 bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center text-[10px] border border-slate-100 dark:border-white/5">🛒</div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white truncate uppercase tracking-tight">{item.product.name}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{formatCurrency(item.product.price)} each</p>
                    </div>
                  </div>
                  <button onClick={() => removeFromCart(item.product.id)} className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 rounded p-0.5 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <p className="font-black text-indigo-600 dark:text-indigo-400 text-xs">{formatCurrency(item.product.price * item.quantity)}</p>
                  <div className="flex items-center gap-0.5 bg-slate-50 dark:bg-slate-900/80 rounded-md p-0.5 border border-slate-200 dark:border-slate-700/40 shadow-inner">
                    <button onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)} className="w-6 h-6 rounded bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 transition-all active:scale-95 shadow-sm">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-5 text-center text-xs font-black text-slate-900 dark:text-slate-200">{item.quantity}</span>
                    <button onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)} disabled={item.quantity >= item.product.stock}
                      className="w-6 h-6 rounded bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 transition-all active:scale-95 shadow-sm disabled:opacity-40">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Totals */}
        <div className="px-4 py-3 border-t border-slate-200 dark:border-white/5 space-y-3 bg-slate-50 dark:bg-slate-800/30">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 font-bold uppercase tracking-tight">
              <span>Subtotal</span>
              <span className="text-slate-900 dark:text-slate-200 font-bold">{formatCurrency(subtotal)}</span>
            </div>
            {TAX_RATE > 0 && (
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 font-bold uppercase tracking-tight">
                <span>Tax ({(TAX_RATE * 100).toFixed(0)}%)</span>
                <span className="text-slate-900 dark:text-slate-200 font-bold">{formatCurrency(tax)}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 dark:text-slate-400 flex-1 font-medium">Discount</span>
              <input type="number" className="w-20 text-right px-2 py-1 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/40 rounded-md text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500/30 focus:outline-none placeholder-slate-400 dark:placeholder-slate-600 shadow-inner font-bold"
                placeholder="0.00" value={discount} onChange={(e) => setDiscount(e.target.value)} />
            </div>
          </div>
          
          <div className="flex justify-between items-end pt-2 border-t border-slate-200 dark:border-slate-700/40">
            <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest leading-none">Total</span>
            <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 leading-none">
              {formatCurrency(grandTotal)}
            </span>
          </div>

          {/* Payment */}
          <div className="grid grid-cols-3 gap-1.5">
            {([
              { method: 'cash' as PaymentMethod, label: 'Cash', icon: Banknote },
              { method: 'card' as PaymentMethod, label: 'Card', icon: CreditCard },
              { method: 'gcash' as PaymentMethod, label: 'GCash', icon: Smartphone },
            ]).map(({ method, label, icon: Icon }) => (
              <button key={method} onClick={() => setPayMethod(method)}
                className={`flex flex-col items-center gap-1 py-2 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition-all shadow-sm ${
                  payMethod === method ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-700 dark:text-indigo-300' : 'bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/40 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}>
                <Icon className={`w-3.5 h-3.5 ${payMethod === method ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`} />
                {label}
              </button>
            ))}
          </div>

          {payMethod === 'cash' && (
            <div className="bg-slate-100 dark:bg-slate-900/50 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700/40 shadow-inner">
              <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 block">Amount Received</label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-black">₱</span>
                <input type="number" className="w-full pl-6 pr-2 py-2 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-600/40 rounded-md font-black text-sm text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500/30 outline-none placeholder-slate-400 dark:placeholder-slate-600 shadow-sm transition-all"
                  placeholder="0.00" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} />
              </div>
              {paid > 0 && (
                <div className="flex justify-between items-center mt-2 px-0.5">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Change</span>
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(change)}</span>
                </div>
              )}
            </div>
          )}

          <button onClick={handleCompleteSale} disabled={cart.length === 0}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 rounded-lg font-black uppercase tracking-widest text-xs shadow-lg shadow-indigo-500/15 hover:shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2">
            <Receipt className="w-4 h-4" />
            Complete Sale
          </button>
        </div>
      </div>

      {/* Product Details Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200 dark:border-white/10 scale-in-center animate-in zoom-in-95 duration-300">
            <div className="relative aspect-video w-full bg-slate-50 dark:bg-slate-950/50">
              {selectedProduct.image ? (
                <Image src={selectedProduct.image} alt={selectedProduct.name} fill className="object-cover" unoptimized={selectedProduct.image.startsWith('http')} />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-20">🛒</div>
              )}
              <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 w-8 h-8 bg-slate-900/50 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-slate-900 transition-colors">
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white dark:from-slate-900 to-transparent">
                <div className="flex items-center gap-2 mb-1">
                  {categories.find(c => c.id === selectedProduct.categoryId) && (
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest text-white shadow-sm" style={{ backgroundColor: categories.find(c => c.id === selectedProduct.categoryId)?.color }}>
                      {categories.find(c => c.id === selectedProduct.categoryId)?.name}
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/5">
                    {selectedProduct.sku}
                  </span>
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{selectedProduct.name}</h3>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-100 dark:border-white/5">
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Selling Price</p>
                  <p className="text-xl font-black text-indigo-600 dark:text-indigo-400">{formatCurrency(selectedProduct.price)}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-100 dark:border-white/5">
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Unit Cost</p>
                  <p className="text-xl font-black text-slate-600 dark:text-slate-300">{formatCurrency(selectedProduct.cost)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-500/5 dark:bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/20">
                  <p className="text-[10px] font-black text-emerald-600/60 dark:text-emerald-400/60 uppercase tracking-widest mb-1">Profit Margin</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                      {selectedProduct.price > 0 
                        ? (((selectedProduct.price - selectedProduct.cost) / selectedProduct.price) * 100).toFixed(1)
                        : '0.0'}%
                    </p>
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-100 dark:border-white/5">
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Stock Health</p>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full animate-pulse ${
                      selectedProduct.stock === 0 ? 'bg-rose-600' : 
                      selectedProduct.stock <= selectedProduct.minStock ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}></div>
                    <p className={`text-sm font-black uppercase tracking-tight ${
                      selectedProduct.stock === 0 ? 'text-rose-600' : 
                      selectedProduct.stock <= selectedProduct.minStock ? 'text-amber-500' : 'text-emerald-500'
                    }`}>
                      {selectedProduct.stock === 0 ? 'Out of Stock' : 
                       selectedProduct.stock <= selectedProduct.minStock ? 'Low Stock' : 'Healthy'}
                    </p>
                  </div>
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1">{selectedProduct.stock} / {selectedProduct.minStock} (Min)</p>
                </div>
              </div>

              {selectedProduct.description && (
                <div>
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Internal Description</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium bg-slate-50 dark:bg-slate-800/20 p-4 rounded-2xl border border-slate-100 dark:border-white/5 italic">
                    &quot;{selectedProduct.description}&quot;
                  </p>
                </div>
              )}

              <div className="pt-2">
                <button 
                  onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add to Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceipt && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-xs shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 scale-in-center animate-in zoom-in-95 duration-300">
            <div className="p-5 text-center border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-800/30">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">Sale Complete!</h3>
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-widest">{new Date().toLocaleString('en-PH')}</p>
            </div>
            <div className="p-5 space-y-2 text-xs">
              <div className="max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                {showReceipt.items?.map((item: { productId: string; productName: string; quantity: number; price: number; subtotal: number; }) => (
                  <div key={item.productId} className="flex justify-between items-center py-1 text-slate-700 dark:text-slate-300 border-b border-slate-50 dark:border-white/5 last:border-0">
                    <div className="flex-1 min-w-0 pr-2">
                      <p className="font-bold truncate uppercase tracking-tight">{item.productName}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-500">₱{item.price.toFixed(2)} x {item.quantity}</p>
                    </div>
                    <span className="font-black text-slate-900 dark:text-white">₱{item.subtotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="pt-3 mt-1 space-y-1.5">
                {TAX_RATE > 0 && (
                  <div className="flex justify-between text-slate-500 dark:text-slate-400 font-medium"><span>Tax</span><span className="font-bold">₱{showReceipt.tax?.toFixed(2)}</span></div>
                )}
                {showReceipt.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium"><span>Discount</span><span className="font-bold">-₱{showReceipt.discount?.toFixed(2)}</span></div>
                )}
                <div className="flex justify-between font-black text-sm pt-2 border-t border-slate-100 dark:border-white/10 text-slate-900 dark:text-white uppercase tracking-tight">
                  <span>Grand Total</span>
                  <span className="text-indigo-600 dark:text-indigo-400">₱{showReceipt.grandTotal?.toFixed(2)}</span>
                </div>
                {showReceipt.paymentMethod === 'cash' && (
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg mt-2 space-y-1 border border-slate-100 dark:border-white/5">
                    <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold"><span>Paid</span><span className="text-slate-900 dark:text-white">₱{showReceipt.amountPaid?.toFixed(2)}</span></div>
                    <div className="flex justify-between text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-tight"><span>Change</span><span>₱{showReceipt.change?.toFixed(2)}</span></div>
                  </div>
                )}
              </div>
            </div>
            <div className="p-5 border-t border-slate-100 dark:border-white/5 space-y-2 bg-slate-50 dark:bg-slate-800/30">
              <button onClick={() => window.print()} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-center gap-2 transition-all shadow-sm">
                <Receipt className="w-4 h-4 text-indigo-500" /> Print Receipt
              </button>
              <button onClick={() => setShowReceipt(null)} className="w-full bg-slate-900 dark:bg-indigo-600 text-white py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-indigo-500/10">Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
