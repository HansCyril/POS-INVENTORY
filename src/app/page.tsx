'use client';
import { usePOSStore } from '@/lib/store';
import { Package, ShoppingCart, TrendingUp, AlertTriangle, DollarSign, BarChart3 } from 'lucide-react';

export default function Dashboard() {
  const { products, sales, categories } = usePOSStore();

  const totalProducts = products.length;
  const lowStockProducts = products.filter((p) => p.stock <= p.minStock);
  const todaySales = sales.filter((s) => {
    const saleDate = new Date(s.createdAt).toDateString();
    return saleDate === new Date().toDateString();
  });
  const todayRevenue = todaySales.reduce((sum, s) => sum + s.grandTotal, 0);
  const totalInventoryValue = products.reduce((sum, p) => sum + p.cost * p.stock, 0);
  const totalRevenue = sales.reduce((sum, s) => sum + s.grandTotal, 0);

  const recentSales = sales.slice(0, 5);

  const statCards = [
    {
      label: 'Total Products',
      value: totalProducts,
      icon: Package,
      color: 'bg-blue-500',
      light: 'bg-blue-50',
      text: 'text-blue-600',
    },
    {
      label: "Today's Revenue",
      value: `₱${todayRevenue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'bg-green-500',
      light: 'bg-green-50',
      text: 'text-green-600',
    },
    {
      label: 'Total Sales',
      value: sales.length,
      icon: ShoppingCart,
      color: 'bg-purple-500',
      light: 'bg-purple-50',
      text: 'text-purple-600',
    },
    {
      label: 'Low Stock Alerts',
      value: lowStockProducts.length,
      icon: AlertTriangle,
      color: 'bg-amber-500',
      light: 'bg-amber-50',
      text: 'text-amber-600',
    },
    {
      label: 'Inventory Value',
      value: `₱${totalInventoryValue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`,
      icon: BarChart3,
      color: 'bg-indigo-500',
      light: 'bg-indigo-50',
      text: 'text-indigo-600',
    },
    {
      label: 'Total Revenue',
      value: `₱${totalRevenue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`,
      icon: TrendingUp,
      color: 'bg-rose-500',
      light: 'bg-rose-50',
      text: 'text-rose-600',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Dashboard</h2>
        <p className="text-slate-500 text-sm mt-1">Overview of your store</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, light, text }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${light} flex items-center justify-center`}>
              <Icon className={`w-6 h-6 ${text}`} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">{label}</p>
              <p className="text-xl font-bold text-slate-800">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Low Stock Products
          </h3>
          {lowStockProducts.length === 0 ? (
            <p className="text-slate-400 text-sm py-6 text-center">All products have sufficient stock</p>
          ) : (
            <div className="space-y-2">
              {lowStockProducts.map((p) => {
                const cat = categories.find((c) => c.id === p.categoryId);
                return (
                  <div key={p.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                    <div>
                      <p className="font-medium text-slate-700 text-sm">{p.name}</p>
                      <p className="text-xs text-slate-400">{cat?.name || 'Uncategorized'} · {p.sku}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${p.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                      {p.stock} left
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Sales */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-blue-500" />
            Recent Sales
          </h3>
          {recentSales.length === 0 ? (
            <p className="text-slate-400 text-sm py-6 text-center">No sales recorded yet</p>
          ) : (
            <div className="space-y-2">
              {recentSales.map((sale) => (
                <div key={sale.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <div>
                    <p className="font-medium text-slate-700 text-sm">Sale #{sale.id.slice(-6).toUpperCase()}</p>
                    <p className="text-xs text-slate-400">
                      {new Date(sale.createdAt).toLocaleString('en-PH')} · {sale.items.length} items
                    </p>
                  </div>
                  <span className="text-green-600 font-semibold text-sm">
                    ₱{sale.grandTotal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
