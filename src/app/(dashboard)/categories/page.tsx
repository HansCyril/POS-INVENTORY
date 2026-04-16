'use client';
import { useState, useEffect } from 'react';
import { usePOSStore } from '@/lib/store';
import { APP_CONFIG } from '@/lib/config';
import ErrorBanner from '@/components/ui/ErrorBanner';
import { Plus, Edit2, Trash2, Tag, X, Check } from 'lucide-react';

const COLORS = APP_CONFIG.categoryColors;

export default function CategoriesPage() {
  const { categories, products, fetchCategories, addCategory, updateCategory, deleteCategory, updateProduct } = usePOSStore();

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState<string>(COLORS[0]);

  const reset = () => { setName(''); setColor(COLORS[0]); setEditing(null); setShowForm(false); };

  const handleEdit = (cat: { id: string; name: string; color: string }) => {
    setName(cat.name); setColor(cat.color); setEditing(cat.id); setShowForm(true);
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    if (editing) { updateCategory(editing, { name: name.trim(), color }); }
    else { addCategory({ name: name.trim(), color }); }
    reset();
  };

  const handleDelete = (id: string) => {
    const catProducts = products.filter(p => p.categoryId === id);
    if (catProducts.length > 0) {
      const uncategorizedCat = categories.find(c => c.name.toLowerCase() === 'uncategorized');
      catProducts.forEach(p => {
        updateProduct(p.id, { categoryId: uncategorizedCat?.id || '' });
      });
    }
    deleteCategory(id);
  };

  return (
    <div className="p-4 space-y-4 pb-20 transition-colors duration-300">
      {usePOSStore.getState().error && (
        <ErrorBanner message={usePOSStore.getState().error!} onRetry={() => fetchCategories()} />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Categories</h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 font-medium">{categories.length} categories active</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2.5 rounded-xl hover:shadow-lg hover:shadow-indigo-500/20 transition-all text-xs font-black uppercase tracking-widest active:scale-[0.98] shadow-md">
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/40 rounded-2xl p-5 animate-in slide-in-from-top-4 duration-300 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: color }}></div>
          <h3 className="font-black text-xs text-slate-900 dark:text-white mb-4 uppercase tracking-widest">{editing ? 'Edit Category' : 'New Category'}</h3>
          <div className="flex flex-col sm:flex-row gap-5">
            <div className="flex-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Category Name</label>
              <input type="text" className="w-full mt-1.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/40 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/40 placeholder-slate-400 dark:placeholder-slate-600 font-bold transition-all shadow-inner"
                placeholder="Enter category name..." value={name} onChange={(e) => setName(e.target.value)} autoFocus />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-2">Theme Color</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {COLORS.map((c) => (
                  <button key={c} onClick={() => setColor(c)} className={`w-8 h-8 rounded-full transition-all flex items-center justify-center ${color === c ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-800 scale-110' : 'hover:scale-105 opacity-60 hover:opacity-100'}`}
                    style={{ backgroundColor: c }}>
                    {color === c && <Check className="w-4 h-4 text-white drop-shadow-sm" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-6 pt-4 border-t border-slate-100 dark:border-white/5">
            <button onClick={handleSubmit} className="flex items-center gap-1.5 bg-indigo-600 dark:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 dark:hover:bg-indigo-400 transition-all shadow-md active:scale-95">
              <Check className="w-4 h-4" /> {editing ? 'Update' : 'Create'}
            </button>
            <button onClick={reset} className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700/40 text-slate-600 dark:text-slate-300 text-xs font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95">
              <X className="w-4 h-4" /> Cancel
            </button>
          </div>
        </div>
      )}

      {/* Category Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const count = products.filter(p => p.categoryId === cat.id).length;
          return (
            <div key={cat.id} className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/40 rounded-2xl p-5 group hover:border-indigo-500/30 transition-all relative overflow-hidden shadow-sm">
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-[0.05] dark:opacity-10 group-hover:opacity-20 transition-opacity" style={{ backgroundColor: cat.color }}></div>
              
              <div className="flex items-start justify-between relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-slate-100 dark:border-white/5 transition-transform group-hover:scale-110 duration-300" style={{ backgroundColor: cat.color + '15' }}>
                    <Tag className="w-6 h-6" style={{ color: cat.color }} />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{cat.name}</h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-black uppercase tracking-widest">{count} product{count !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                  <button onClick={() => handleEdit(cat)} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-indigo-500/10 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors border border-transparent hover:border-indigo-500/20 shadow-sm">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(cat.id)} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-red-500/10 text-slate-400 hover:text-red-600 transition-colors border border-transparent hover:border-red-500/20 shadow-sm">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Mini progress bar */}
              <div className="mt-5">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Inventory Share</span>
                  <span className="text-[9px] font-black text-slate-600 dark:text-slate-300">{Math.round((count / Math.max(products.length, 1)) * 100)}%</span>
                </div>
                <div className="h-1.5 bg-slate-100 dark:bg-slate-900/50 rounded-full overflow-hidden relative z-10 border border-slate-50 dark:border-white/5 shadow-inner">
                  <div className="h-full rounded-full transition-all duration-1000 ease-out group-hover:brightness-110" style={{ backgroundColor: cat.color, width: `${Math.min((count / Math.max(products.length, 1)) * 100, 100)}%` }}></div>
                </div>
              </div>
            </div>
          );
        })}

        {categories.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-24 text-slate-400">
            <Tag className="w-16 h-16 mb-4 opacity-10" />
            <p className="text-base font-black text-slate-900 dark:text-slate-300 uppercase tracking-tight">No categories defined</p>
            <p className="text-xs mt-1 font-medium">Start organized by creating your first category</p>
          </div>
        )}
      </div>
    </div>
  );
}
