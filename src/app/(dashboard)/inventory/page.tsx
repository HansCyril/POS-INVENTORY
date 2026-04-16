'use client';
import { useState, useEffect } from 'react';
import { usePOSStore } from '@/lib/store';
import { Product } from '@/types';
import { formatCurrency } from '@/lib/config';
import ErrorBanner from '@/components/ui/ErrorBanner';
import Image from 'next/image';
import {
  Plus, Edit2, Trash2, Search, Package, X, Check, ArrowUpDown,
} from 'lucide-react';

type SortKey = 'name' | 'stock' | 'price';

const emptyForm = { name: '', sku: '', price: '', cost: '', stock: '', minStock: '', categoryId: '', description: '', image: '' };

export default function InventoryPage() {
  const { products, categories, fetchProducts, fetchCategories, addProduct, updateProduct, deleteProduct, adjustStock } = usePOSStore();
  
  useEffect(() => { 
    fetchProducts(); 
    fetchCategories(); 
  }, [fetchProducts, fetchCategories]);

  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortAsc, setSortAsc] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [adjustId, setAdjustId] = useState<string | null>(null);
  const [adjustAmount, setAdjustAmount] = useState('');

  const reset = () => { setForm(emptyForm); setEditing(null); setShowForm(false); };

  const handleEdit = (p: Product) => {
    setForm({ name: p.name, sku: p.sku, price: String(p.price), cost: String(p.cost), stock: String(p.stock), minStock: String(p.minStock), categoryId: p.categoryId, description: p.description, image: p.image || '' });
    setEditing(p.id); setShowForm(true);
  };

  const handleSubmit = () => {
    if (!form.name.trim() || !form.sku.trim()) return;
    const data = { name: form.name.trim(), sku: form.sku.trim(), price: parseFloat(form.price) || 0, cost: parseFloat(form.cost) || 0, stock: parseInt(form.stock) || 0, minStock: parseInt(form.minStock) || 0, categoryId: form.categoryId, description: form.description, image: form.image.trim() || undefined };
    if (editing) { updateProduct(editing, data); } else { addProduct(data); }
    reset();
  };

  const handleAdjust = (id: string) => {
    const amt = parseInt(adjustAmount);
    if (!isNaN(amt) && amt !== 0) adjustStock(id, amt);
    setAdjustId(null); setAdjustAmount('');
  };

  const filtered = products
    .filter((p) => {
      const q = search.toLowerCase();
      return (p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)) && (!filterCat || p.categoryId === filterCat);
    })
    .sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'name') cmp = a.name.localeCompare(b.name);
      if (sortKey === 'stock') cmp = a.stock - b.stock;
      if (sortKey === 'price') cmp = a.price - b.price;
      return sortAsc ? cmp : -cmp;
    });

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  return (
    <div className="p-4 space-y-4 pb-20 transition-colors duration-300">
      {usePOSStore.getState().error && (
        <ErrorBanner message={usePOSStore.getState().error!} onRetry={() => { fetchProducts(); fetchCategories(); }} />
      )}

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Inventory</h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">Manage your product catalog</p>
          </div>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-md hover:shadow-indigo-500/15 transition-all text-xs font-bold shadow-sm">
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: 'Products', value: products.length, icon: Package, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10 dark:bg-blue-500/20' },
            { label: 'Categories', value: categories.length, icon: Package, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-500/10 dark:bg-purple-500/20' },
            { label: 'Total Value', value: formatCurrency(products.reduce((acc, p) => acc + (p.price * p.stock), 0)), icon: Package, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10 dark:bg-emerald-500/20' },
            { label: 'Out of Stock', value: products.filter(p => p.stock === 0).length, icon: Package, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-500/10 dark:bg-rose-500/20' },
            { label: 'Low Stock', value: products.filter(p => p.stock > 0 && p.stock <= p.minStock).length, icon: Package, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-500/10 dark:bg-orange-500/20' }
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/40 rounded-xl p-3 relative overflow-hidden flex flex-col items-start gap-2 shadow-sm">
              <div className={`w-8 h-8 rounded-lg ${bg} border border-slate-200 dark:border-white/5 flex items-center justify-center transition-transform hover:scale-105`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider mb-0.5">{label}</p>
                <p className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/40 rounded-xl p-4 animate-fade-in-up shadow-lg">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-4 pb-3 border-b border-slate-100 dark:border-white/5">{editing ? 'Edit Product' : 'New Product'}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {[
              { key: 'name', label: 'Name', type: 'text', placeholder: 'e.g. Coffee' },
              { key: 'sku', label: 'SKU', type: 'text', placeholder: 'e.g. BEV-001' },
              { key: 'price', label: 'Price (₱)', type: 'number', placeholder: '0.00' },
              { key: 'cost', label: 'Cost (₱)', type: 'number', placeholder: '0.00' },
              { key: 'stock', label: 'Stock', type: 'number', placeholder: '0' },
              { key: 'minStock', label: 'Min Stock', type: 'number', placeholder: '5' },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">{label}</label>
                <input type={type} className="w-full mt-1 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/40 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/40 placeholder-slate-400 dark:placeholder-slate-600 transition-all"
                  placeholder={placeholder} value={form[key as keyof typeof form]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
              </div>
            ))}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Image URL</label>
              <input type="url" className="w-full mt-1 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/40 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/40 placeholder-slate-400 dark:placeholder-slate-600 transition-all"
                placeholder="https://..." value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Category</label>
              <select className="w-full mt-1 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/40 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/40 transition-all"
                value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Select</option>
                {categories.map((c) => <option key={c.id} value={c.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{c.name}</option>)}
              </select>
            </div>
          </div>
          <div className="mt-3">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Description</label>
            <input type="text" className="w-full mt-1 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/40 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/40 placeholder-slate-400 dark:placeholder-slate-600 transition-all"
              placeholder="Optional description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-white/5">
            <button onClick={handleSubmit} className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all hover:opacity-90 shadow-sm">
              <Check className="w-3.5 h-3.5" /> {editing ? 'Update' : 'Create'}
            </button>
            <button onClick={reset} className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700/40 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all">
              <X className="w-3.5 h-3.5" /> Cancel
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3">
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/40 rounded-lg px-3 py-2 flex-1 min-w-[200px] focus-within:ring-1 focus-within:ring-indigo-500/40 transition-all shadow-sm">
          <Search className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
          <input className="flex-1 text-xs bg-transparent outline-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500" placeholder="Search by name or SKU..."
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="appearance-none bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/40 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/40 transition-all shadow-sm"
          value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
          <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">All Categories</option>
          {categories.map((c) => <option key={c.id} value={c.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{c.name}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/40 rounded-xl overflow-hidden shadow-sm transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-900/50">
                <th className="text-left px-4 py-2.5 text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  <button className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-white transition-colors" onClick={() => toggleSort('name')}>Name <ArrowUpDown className="w-3 h-3" /></button>
                </th>
                <th className="text-left px-4 py-2.5 text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">SKU</th>
                <th className="text-left px-4 py-2.5 text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Category</th>
                <th className="text-right px-4 py-2.5 text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  <button className="flex items-center gap-1 ml-auto hover:text-indigo-600 dark:hover:text-white transition-colors" onClick={() => toggleSort('price')}>Price <ArrowUpDown className="w-3 h-3" /></button>
                </th>
                <th className="text-right px-4 py-2.5 text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  <button className="flex items-center gap-1 ml-auto hover:text-indigo-600 dark:hover:text-white transition-colors" onClick={() => toggleSort('stock')}>Stock <ArrowUpDown className="w-3 h-3" /></button>
                </th>
                <th className="text-center px-4 py-2.5 text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-900 dark:text-white">
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-16 text-slate-400 dark:text-slate-500">
                <Package className="w-8 h-8 text-slate-300 dark:text-slate-500 mx-auto mb-2" />
                <p className="font-semibold">No products found</p>
                <p className="text-[10px] mt-0.5">Adjust your search or filters</p>
              </td></tr>
            ) : (
              filtered.map((p) => {
                const cat = categories.find((c) => c.id === p.categoryId);
                const isLow = p.stock <= p.minStock;
                return (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-white/5 flex items-center justify-center relative shadow-inner">
                          {p.image ? (
                            <Image 
                              src={p.image} 
                              alt={p.name} 
                              fill 
                              className="object-cover" 
                              unoptimized={p.image.startsWith('http')}
                            />
                          ) : <Package className="w-4 h-4 text-slate-400 dark:text-slate-500" />}
                        </div>
                        <div>
                          <p className="font-semibold text-xs group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{p.name}</p>
                          {p.description && <p className="text-[10px] text-slate-500 dark:text-slate-500 truncate max-w-[150px]">{p.description}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-[10px] text-indigo-500 dark:text-indigo-300">{p.sku}</td>
                    <td className="px-4 py-2.5">
                      {cat ? <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border" style={{ backgroundColor: cat.color + '15', color: cat.color, borderColor: cat.color + '30' }}>{cat.name}</span> : <span className="text-slate-400 dark:text-slate-500 text-[10px]">—</span>}
                    </td>
                    <td className="px-4 py-2.5 text-right font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(p.price)}</td>
                    <td className="px-4 py-2.5 text-right">
                      {adjustId === p.id ? (
                        <div className="flex items-center gap-1 justify-end">
                          <input type="number" className="w-16 px-2 py-1 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-md text-xs text-center text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                            placeholder="+/-" value={adjustAmount} onChange={(e) => setAdjustAmount(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAdjust(p.id)} autoFocus />
                          <button onClick={() => handleAdjust(p.id)} className="p-1 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded hover:bg-emerald-500/25 transition-colors shadow-sm"><Check className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setAdjustId(null)} className="p-1 bg-slate-100 dark:bg-slate-700/50 text-slate-500 dark:text-slate-300 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-sm"><X className="w-3.5 h-3.5" /></button>
                        </div>
                      ) : (
                        <button onClick={() => setAdjustId(p.id)} className={`font-black text-xs transition-colors ${isLow ? 'text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300' : 'text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400'}`}>
                          {p.stock}
                          {isLow && <span className="ml-1 text-[8px] text-white bg-red-500 px-1 py-0.5 rounded uppercase tracking-widest font-bold shadow-sm">Low</span>}
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => handleEdit(p)} className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 hover:bg-indigo-500/15 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors shadow-sm"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => deleteProduct(p.id)} className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 hover:bg-red-500/15 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors shadow-sm"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
