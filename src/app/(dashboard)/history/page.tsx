'use client';
import { useState, useEffect } from 'react';
import { usePOSStore } from '@/lib/store';
import { formatCurrency } from '@/lib/config';
import ErrorBanner from '@/components/ui/ErrorBanner';
import {
  History, Search, ChevronDown, Banknote, CreditCard, Smartphone, TrendingUp, Download, Package,
} from 'lucide-react';

const paymentIcons = { cash: Banknote, card: CreditCard, gcash: Smartphone };

export default function HistoryPage() {
  const { sales, fetchSales } = usePOSStore();
  const [search, setSearch] = useState('');
  const [filterMethod, setFilterMethod] = useState('');
  const [sortAsc, setSortAsc] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  const filtered = sales
    .filter((s) => {
      const q = search.toLowerCase();
      const matchSearch = s.id.toLowerCase().includes(q) || s.items?.some(i => i.productName?.toLowerCase().includes(q));
      const matchMethod = !filterMethod || s.paymentMethod === filterMethod;
      return matchSearch && matchMethod;
    })
    .sort((a, b) => {
      const cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return sortAsc ? cmp : -cmp;
    });

  const totalRevenue = filtered.reduce((sum, s) => sum + s.grandTotal, 0);

  const exportToCSV = () => {
    const esc = (s: string) => `"${String(s).replace(/"/g, '""')}"`;
    const header = ['Sale ID', 'Date', 'Items', 'Total', 'Tax', 'Grand Total', 'Payment', 'Paid', 'Change'];
    const rows = filtered.map(s => [
      esc(s.id), esc(new Date(s.createdAt).toLocaleString('en-PH')),
      s.items?.length || 0, s.total.toFixed(2), s.tax.toFixed(2), s.grandTotal.toFixed(2),
      esc(s.paymentMethod), s.amountPaid.toFixed(2), s.change.toFixed(2)
    ].join(','));
    const csv = [header.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = `sales-${new Date().toISOString().split('T')[0]}.csv`;
    link.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 space-y-4 bg-transparent pb-20 transition-colors duration-300">
      {usePOSStore.getState().error && (
        <ErrorBanner message={usePOSStore.getState().error!} onRetry={() => fetchSales()} />
      )}

      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Sales History</h2>
            <p className="text-slate-600 dark:text-slate-400 text-xs mt-0.5 font-medium">Review and export past transactions</p>
          </div>
          <button onClick={exportToCSV} disabled={filtered.length === 0}
            className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest disabled:opacity-40 hover:shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98] transition-all shadow-md">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Revenue', value: formatCurrency(totalRevenue), icon: Banknote, color: 'text-emerald-500', bg: 'bg-emerald-500/10', gradient: 'from-emerald-500 to-teal-500', shadow: 'hover:shadow-emerald-500/20', trend: '+12.5%' },
            { label: 'Transactions', value: filtered.length, icon: History, color: 'text-indigo-500', bg: 'bg-indigo-500/10', gradient: 'from-indigo-500 to-blue-500', shadow: 'hover:shadow-indigo-500/20', trend: '+8%' },
            { label: 'Avg Sale', value: formatCurrency(filtered.length ? totalRevenue / filtered.length : 0), icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-500/10', gradient: 'from-purple-500 to-pink-500', shadow: 'hover:shadow-purple-500/20', trend: '+5.2%' },
            { label: 'Items Sold', value: filtered.reduce((acc, sale) => acc + (sale.items?.length || 0), 0), icon: Package, color: 'text-blue-500', bg: 'bg-blue-500/10', gradient: 'from-blue-500 to-cyan-500', shadow: 'hover:shadow-blue-500/20', trend: '+18%' }
          ].map(({ label, value, icon: Icon, color, bg, gradient, shadow, trend }) => (
            <div key={label} className={`bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/40 rounded-2xl p-5 relative overflow-hidden flex flex-col items-start gap-4 shadow-sm group hover:border-transparent ${shadow} hover:shadow-xl transition-all duration-500 active:scale-[0.98]`}>
              {/* Interactive background accent */}
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
              
              <div className="flex justify-between items-start w-full relative z-10">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} p-[1px] shadow-lg shadow-indigo-500/5 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                  <div className="w-full h-full rounded-[15px] bg-white dark:bg-slate-900 flex items-center justify-center">
                    <Icon className={`w-6 h-6 ${color}`} />
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${bg} ${color} border border-white/10`}>
                    {trend}
                  </span>
                </div>
              </div>
              
              <div className="relative z-10">
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-[0.1em] mb-1">{label}</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{value}</p>
              </div>
              
              {/* Large Ghost Icon Decoration */}
              <div className="absolute -right-4 -bottom-4 opacity-[0.03] dark:opacity-[0.07] group-hover:opacity-[0.1] group-hover:scale-110 group-hover:-rotate-12 transition-all duration-700 pointer-events-none">
                <Icon className="w-24 h-24" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/40 rounded-xl px-4 py-2.5 flex-1 min-w-[200px] focus-within:ring-1 focus-within:ring-indigo-500/40 shadow-sm transition-all">
          <Search className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
          <input className="flex-1 text-xs bg-transparent outline-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-medium" placeholder="Search by ID or product..."
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="appearance-none bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/40 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/40 shadow-sm transition-all"
          value={filterMethod} onChange={(e) => setFilterMethod(e.target.value)}>
          <option value="" className="bg-white dark:bg-slate-900">All Methods</option>
          <option value="cash" className="bg-white dark:bg-slate-900">Cash</option>
          <option value="card" className="bg-white dark:bg-slate-900">Card</option>
          <option value="gcash" className="bg-white dark:bg-slate-900">GCash</option>
        </select>
        <button onClick={() => setSortAsc(!sortAsc)}
          className="flex items-center gap-2 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/40 rounded-xl px-4 py-2.5 text-xs text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm">
          <TrendingUp className={`w-4 h-4 text-indigo-500 transition-transform ${sortAsc ? 'rotate-0' : 'rotate-180'}`} />
          {sortAsc ? 'Oldest First' : 'Newest First'}
        </button>
      </div>

      {/* Sales List */}
      <div className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/40 rounded-2xl overflow-hidden shadow-sm transition-all">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-white/5">
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest w-12 text-center"></th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Sale ID</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Date & Time</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Method</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Items</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-right">Total Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-24 text-slate-400">
                    <History className="w-12 h-12 opacity-20 mx-auto mb-4" />
                    <p className="font-black text-slate-900 dark:text-slate-300 text-base uppercase tracking-tight">No sales records found</p>
                    <p className="text-xs mt-1 font-medium">Try adjusting your filters or search terms</p>
                  </td>
                </tr>
              ) : (
                filtered.map((sale) => {
                  const PayIcon = paymentIcons[sale.paymentMethod as keyof typeof paymentIcons] || Banknote;
                  const expanded = expandedId === sale.id;
                  return (
                    <tr key={sale.id} className="group transition-colors overflow-hidden">
                      <td colSpan={6} className="p-0">
                        {/* Main Row */}
                        <button
                          onClick={() => setExpandedId(expanded ? null : sale.id)}
                          className={`w-full flex items-center px-6 py-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-left ${expanded ? 'bg-slate-50/50 dark:bg-white/5 shadow-inner' : ''}`}
                        >
                          <div className="w-12 flex items-center justify-center">
                            <div className={`p-1 rounded-full transition-all ${expanded ? 'bg-indigo-500/10 text-indigo-600 rotate-0' : 'text-slate-400 rotate-[-90deg]'}`}>
                              <ChevronDown className="w-4 h-4" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-[120px]">
                            <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 tracking-wider">#{sale.id.slice(-8).toUpperCase()}</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-bold text-slate-900 dark:text-slate-200">{new Date(sale.createdAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                            <p className="text-[10px] text-slate-600 dark:text-slate-500 font-bold uppercase">{new Date(sale.createdAt).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                          <div className="flex-1">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                              sale.paymentMethod === 'cash' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                              sale.paymentMethod === 'card' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                            }`}>
                              <PayIcon className="w-3.5 h-3.5" /> {sale.paymentMethod}
                            </span>
                          </div>
                          <div className="flex-1 text-xs font-bold text-slate-600 dark:text-slate-400">{sale.items?.length || 0} items</div>
                          <div className="text-right min-w-[100px]">
                            <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(sale.grandTotal)}</span>
                          </div>
                        </button>

                        {/* Expanded Details */}
                        {expanded && (
                          <div className="bg-slate-50/30 dark:bg-slate-900/40 border-t border-slate-100 dark:border-white/5 py-4 animate-in slide-in-from-top-2 duration-300">
                            <div className="px-12 grid grid-cols-2 md:grid-cols-4 gap-6">
                              <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Base Amount</p>
                                <p className="text-sm font-black text-slate-900 dark:text-white">{formatCurrency(sale.total)}</p>
                              </div>
                              {sale.tax > 0 && (
                                <div className="space-y-1">
                                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Tax Component</p>
                                  <p className="text-sm font-black text-slate-900 dark:text-white">{formatCurrency(sale.tax)}</p>
                                </div>
                              )}
                              <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Cash Received</p>
                                <p className="text-sm font-black text-slate-900 dark:text-white">{formatCurrency(sale.amountPaid)}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Change Given</p>
                                <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(sale.change)}</p>
                              </div>
                            </div>
                            
                            {sale.items && sale.items.length > 0 && (
                              <div className="mt-6 px-12 space-y-3">
                                <div className="flex items-center gap-3">
                                  <div className="h-px flex-1 bg-slate-100 dark:bg-white/5"></div>
                                  <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Transaction Items</p>
                                  <div className="h-px flex-1 bg-slate-100 dark:bg-white/5"></div>
                                </div>
                                <div className="space-y-2 max-w-2xl">
                                  {sale.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-xs group/item p-2 hover:bg-white dark:hover:bg-slate-800/60 rounded-lg transition-colors border border-transparent hover:border-slate-100 dark:hover:border-white/5">
                                      <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-500">
                                          {item.quantity}
                                        </div>
                                        <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight">{item.productName}</span>
                                      </div>
                                      <span className="font-black text-slate-900 dark:text-slate-200">{formatCurrency(item.subtotal)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
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
