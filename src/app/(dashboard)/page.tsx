'use client';
import { useState, useEffect } from 'react';
import { usePOSStore } from '@/lib/store';
import { formatCurrency } from '@/lib/config';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import ErrorBanner from '@/components/ui/ErrorBanner';
import { ShoppingCart, TrendingUp, AlertTriangle, DollarSign, BarChart3, CheckCircle } from 'lucide-react';

export default function Dashboard() {
  const { products, sales, fetchProducts, fetchCategories, fetchSales, loading, error } = usePOSStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchSales();
    setMounted(true);
  }, [fetchProducts, fetchCategories, fetchSales]);

  const lowStockProducts = products.filter((p) => p.stock <= p.minStock);
  const outOfStock = products.filter((p) => p.stock === 0);

  // ─── Real trend calculations ──────────────────────────────────────────────
  const today = new Date();
  const todayStr = today.toDateString();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();

  const todaySales = sales.filter((s: { createdAt: string | number | Date }) => new Date(s.createdAt).toDateString() === todayStr);
  const yesterdaySales = sales.filter((s: { createdAt: string | number | Date }) => new Date(s.createdAt).toDateString() === yesterdayStr);

  const todayRevenue = todaySales.reduce((sum, s) => sum + s.grandTotal, 0);
  const yesterdayRevenue = yesterdaySales.reduce((sum, s) => sum + s.grandTotal, 0);

  const totalInventoryValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);

  const calcTrend = (current: number, previous: number): { label: string; up: boolean } => {
    if (previous === 0 && current === 0) return { label: 'No change', up: true };
    if (previous === 0) return { label: `+${current}`, up: true };
    const pct = ((current - previous) / previous) * 100;
    const sign = pct >= 0 ? '+' : '';
    return { label: `${sign}${pct.toFixed(0)}%`, up: pct >= 0 };
  };

  const thisWeekStart = new Date(today);
  thisWeekStart.setDate(today.getDate() - today.getDay());
  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  const thisWeekSales = sales.filter((s) => new Date(s.createdAt) >= thisWeekStart);
  const lastWeekSales = sales.filter((s) => {
    const d = new Date(s.createdAt);
    return d >= lastWeekStart && d < thisWeekStart;
  });
  const thisWeekRevenue = thisWeekSales.reduce((sum, s) => sum + s.grandTotal, 0);
  const lastWeekRevenue = lastWeekSales.reduce((sum, s) => sum + s.grandTotal, 0);

  const revenueTrend = calcTrend(todayRevenue, yesterdayRevenue);
  const weeklyRevenueTrend = calcTrend(thisWeekRevenue, lastWeekRevenue);

  const recentSales = sales.slice(0, 5);

  if (!mounted || loading) return <LoadingSkeleton />;
  if (error) return <ErrorBanner message={error} onRetry={() => { fetchProducts(); fetchCategories(); fetchSales(); }} />;

  return (
    <div className="space-y-4 p-4 animate-in fade-in duration-500 pb-20 transition-colors duration-300">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Dashboard Overview</h2>
        <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider">Real-time performance and inventory status</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Today's Revenue", value: formatCurrency(todayRevenue), trend: revenueTrend, icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-500/10", gradient: "from-emerald-500 to-teal-500", shadow: "hover:shadow-emerald-500/20" },
          { label: "Inventory Value", value: formatCurrency(totalInventoryValue), trend: { label: `${products.length} Products`, up: true }, icon: BarChart3, color: "text-indigo-500", bg: "bg-indigo-500/10", gradient: "from-indigo-500 to-blue-500", shadow: "hover:shadow-indigo-500/20" },
          { label: "Weekly Revenue", value: formatCurrency(thisWeekRevenue), trend: weeklyRevenueTrend, icon: TrendingUp, color: "text-purple-500", bg: "bg-purple-500/10", gradient: "from-purple-500 to-pink-500", shadow: "hover:shadow-purple-500/20" },
        ].map((stat, i) => (
          <div key={i} className={`bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/40 rounded-2xl p-5 relative overflow-hidden flex flex-col items-start gap-4 shadow-sm group hover:border-transparent ${stat.shadow} hover:shadow-xl transition-all duration-500 active:scale-[0.98]`}>
            {/* Interactive background accent */}
            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
            
            <div className="flex justify-between items-start w-full relative z-10">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.gradient} p-[1px] shadow-lg shadow-indigo-500/5 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                <div className="w-full h-full rounded-[15px] bg-white dark:bg-slate-900 flex items-center justify-center">
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              <div className={`flex items-center gap-0.5 px-2.5 py-1 rounded-full text-[10px] font-black ${stat.trend.up ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'} border border-white/10`}>
                {stat.trend.label}
              </div>
            </div>
            
            <div className="relative z-10 flex flex-col">
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-[0.1em] mb-1">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{stat.value}</p>
            </div>
            
            {/* Large Ghost Icon Decoration */}
            <div className="absolute -right-4 -bottom-4 opacity-[0.03] dark:opacity-[0.07] group-hover:opacity-[0.1] group-hover:scale-110 group-hover:-rotate-12 transition-all duration-700 pointer-events-none">
              <stat.icon className="w-24 h-24" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Recent Sales */}
        <div className="xl:col-span-2 bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/40 rounded-2xl overflow-hidden flex flex-col shadow-sm">
          <div className="px-5 py-4 border-b border-slate-200 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/40">
            <h3 className="font-black text-slate-900 dark:text-white text-[11px] uppercase tracking-widest flex items-center gap-2.5">
              <ShoppingCart className="w-4 h-4 text-indigo-500" /> Recent Sales
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-[10px] uppercase tracking-[0.1em] text-slate-600 dark:text-slate-400 font-black">
                <tr>
                  <th className="px-6 py-4">Sale ID</th>
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4">Total Items</th>
                  <th className="px-6 py-4 text-right">Revenue</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-900 dark:text-white">
                {recentSales.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4 font-black text-indigo-600 dark:text-indigo-400 text-xs tracking-wider">#{s.id.slice(-8).toUpperCase()}</td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{new Date(s.createdAt).toLocaleDateString()}</p>
                      <p className="text-[9px] text-slate-500 font-bold uppercase">{new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-600 dark:text-slate-400">{s.items?.length || 0} units</td>
                    <td className="px-6 py-4 text-right font-black text-emerald-600 dark:text-emerald-400 truncate">{formatCurrency(s.grandTotal)}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-500/20">Paid</span>
                    </td>
                  </tr>
                ))}
                {recentSales.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-slate-400 font-black uppercase tracking-tight text-sm">No recent transactions</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stock Alerts */}
        <div className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/40 rounded-2xl overflow-hidden flex flex-col shadow-sm">
          <div className="px-5 py-4 border-b border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/40">
            <h3 className="font-black text-slate-900 dark:text-white text-[11px] uppercase tracking-widest flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-500" /> Inventory Alerts
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 scrollbar-thin">
            {outOfStock.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-rose-500 dark:text-rose-400 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></div> Out of Stock 
                </p>
                {outOfStock.map(p => (
                  <div key={p.id} className="bg-rose-500/5 border border-rose-500/10 rounded-xl px-4 py-3 flex items-center justify-between group/alert hover:bg-rose-500/10 transition-colors">
                    <span className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight truncate pr-2">{p.name}</span>
                    <span className="bg-rose-500 text-white text-[9px] font-black px-2 py-1 rounded-md uppercase shadow-lg shadow-rose-500/20">Empty</span>
                  </div>
                ))}
              </div>
            )}
            
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-orange-500 dark:text-orange-400 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div> Critical Levels
              </p>
              {lowStockProducts.filter(p => p.stock > 0).map(p => (
                <div key={p.id} className="bg-orange-500/5 border border-orange-500/10 rounded-xl px-4 py-3 flex items-center justify-between group/alert hover:bg-orange-500/10 transition-colors">
                  <span className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight truncate pr-2">{p.name}</span>
                  <div className="flex flex-col items-end">
                    <span className="text-orange-600 dark:text-orange-400 text-[11px] font-black">{p.stock} units</span>
                    <div className="w-12 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mt-1 overflow-hidden">
                      <div className="h-full bg-orange-500 rounded-full" style={{ width: `${(p.stock / p.minStock) * 100}%` }}></div>
                    </div>
                  </div>
                </div>
              ))}
              {lowStockProducts.length === 0 && outOfStock.length === 0 && (
                <div className="h-32 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                  <CheckCircle className="w-8 h-8 opacity-20 mb-2" />
                  <p className="text-xs font-bold">All items in stock</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
