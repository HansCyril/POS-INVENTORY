'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Search, User, AlertTriangle, Package, TrendingUp } from 'lucide-react';
import { usePOSStore } from '@/lib/store';
import { APP_CONFIG, formatCurrency } from '@/lib/config';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

interface HeaderProps {
  title: string;
}

interface Notification {
  id: string;
  type: 'low_stock' | 'sale' | 'info';
  title: string;
  message: string;
  time: string;
  read: boolean;
  action?: string;
}

export default function Header({ title }: HeaderProps) {
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const { products, sales, fetchProducts, fetchSales, demoMode } = usePOSStore();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchProducts();
    fetchSales();
  }, [fetchProducts, fetchSales]);

  // Generate notifications based on data
  const notifications: Notification[] = [];

  const lowStockProducts = products.filter(p => p.stock <= p.minStock && p.stock > 0);
  const outOfStock = products.filter(p => p.stock === 0);

  if (lowStockProducts.length > 0) {
    notifications.push({
      id: 'low_stock',
      type: 'low_stock',
      title: 'Low Stock Alert',
      message: `${lowStockProducts.length} product${lowStockProducts.length > 1 ? 's' : ''} running low`,
      time: 'Now',
      read: false,
      action: 'low_stock',
    });
  }

  if (outOfStock.length > 0) {
    notifications.push({
      id: 'out_of_stock',
      type: 'low_stock',
      title: 'Out of Stock',
      message: `${outOfStock.length} product${outOfStock.length > 1 ? 's' : ''} out of stock`,
      time: 'Now',
      read: false,
      action: 'out_of_stock',
    });
  }

  const today = new Date().toDateString();
  const todaySales = sales.filter(s => new Date(s.createdAt).toDateString() === today);
  if (todaySales.length > 0) {
    const todayRevenue = todaySales.reduce((sum, s) => sum + s.grandTotal, 0);
    notifications.push({
      id: 'today_sales',
      type: 'sale',
      title: 'Today\'s Sales',
      message: `${todaySales.length} sale${todaySales.length > 1 ? 's' : ''} - ${formatCurrency(todayRevenue)}`,
      time: 'Today',
      read: false,
      action: 'sales',
    });
  }

  if (products.length > 0) {
    notifications.push({
      id: 'inventory',
      type: 'info',
      title: 'Inventory Status',
      message: `${products.length} products in catalog`,
      time: 'Always',
      read: true,
      action: 'inventory',
    });
  }

  // Search functionality
  const searchResults = searchQuery.trim()
    ? products.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5)
    : [];

  const handleNotificationClick = (notification: Notification) => {
    setShowNotifications(false);
    if (notification.action === 'low_stock' || notification.action === 'out_of_stock' || notification.action === 'inventory') {
      router.push('/inventory');
    } else if (notification.action === 'sales') {
      router.push('/history');
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="relative z-50 h-14 glass-header px-6 flex items-center justify-between shrink-0 transition-all duration-300">
      <div className="flex items-center gap-3">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">{title}</h2>
        {demoMode && (
          <span className="flex items-center gap-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[9px] px-2.5 py-1 rounded-full font-black uppercase tracking-widest border border-amber-500/20 shadow-sm animate-pulse">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
            Demo Mode
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Search Bar */}
        <div className="relative hidden md:block" ref={searchRef}>
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search products..."
            className="pl-8 pr-3 py-1.5 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 w-52 transition-all shadow-inner"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchResults(e.target.value.length > 0 || document.activeElement === e.target);
            }}
            onFocus={() => setShowSearchResults(true)}
          />

          {showSearchResults && (
            <div className="absolute top-full right-0 md:left-0 mt-2 w-72 bg-white dark:bg-slate-800 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.7)] border border-slate-200 dark:border-slate-700 overflow-hidden z-[100]">
              <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-900/40">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400">
                  {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
                </p>
              </div>
              <div className="max-h-52 overflow-y-auto scrollbar-thin">
                {searchResults.length === 0 ? (
                  <div className="p-4 text-center text-slate-400 bg-white dark:bg-slate-800">
                    <Search className="w-5 h-5 mx-auto mb-1.5 opacity-30" />
                    <p className="text-xs font-semibold">No products found</p>
                  </div>
                ) : (
                  searchResults.map((product) => (
                    <Link
                      key={product.id}
                      href="/inventory"
                      className="px-3 py-2.5 flex items-center gap-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700/50 last:border-0 transition-colors bg-white dark:bg-slate-800"
                      onClick={() => { setShowSearchResults(false); setSearchQuery(''); }}
                    >
                      <div className="w-7 h-7 bg-slate-100 dark:bg-slate-900 rounded-md flex items-center justify-center border border-slate-200 dark:border-white/5">
                        <Package className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{product.name}</p>
                        <p className="text-[10px] text-slate-600 dark:text-slate-400">SKU: {product.sku}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(product.price)}</p>
                        <p className={`text-[9px] font-bold uppercase tracking-widest mt-0.5 ${product.stock <= product.minStock ? 'text-rose-500 dark:text-rose-400' : 'text-slate-400'}`}>
                          {product.stock} in stock
                        </p>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative p-1.5 rounded-lg transition-colors ${showNotifications ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80'}`}
          >
            <Bell className="w-4 h-4" />
            {outOfStock.length > 0 && (
              <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-rose-500 rounded-full border border-white dark:border-slate-900"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-[100] transition-colors">
              <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-700/80 flex items-center justify-between bg-slate-50 dark:bg-slate-900/40">
                <h3 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">Notifications</h3>
                <span className="text-[9px] font-bold bg-rose-500/15 text-rose-500 dark:text-rose-400 px-1.5 py-0.5 rounded-full">{outOfStock.length} Alerts</span>
              </div>
              <div className="max-h-64 overflow-y-auto scrollbar-thin">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-slate-400 bg-white dark:bg-slate-800">
                    <Bell className="w-6 h-6 mx-auto mb-1.5 opacity-30" />
                    <p className="text-xs font-semibold">No notifications</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <button
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`w-full px-3 py-2.5 border-b border-slate-200 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left bg-white dark:bg-slate-800 ${!notification.read ? 'border-l-2 border-l-indigo-500 dark:border-l-indigo-400' : 'pl-[14px]'}`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          notification.type === 'low_stock' ? 'bg-orange-500/15' :
                          notification.type === 'sale' ? 'bg-emerald-500/15' : 'bg-indigo-500/15'
                        }`}>
                          {notification.type === 'low_stock' ? (
                            <AlertTriangle className="w-3 h-3 text-orange-500 dark:text-orange-400" />
                          ) : notification.type === 'sale' ? (
                            <TrendingUp className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
                          ) : (
                            <Package className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-slate-200">{notification.title}</p>
                          <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5 truncate">{notification.message}</p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
              <div className="px-3 py-2 border-t border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-900/40">
                <Link 
                  href="/inventory" 
                  className="text-[10px] font-bold tracking-widest uppercase text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 flex items-center justify-center transition-colors"
                  onClick={() => setShowNotifications(false)}
                >
                  View Inventory
                </Link>
              </div>
            </div>
          )}
        </div>
        
        {/* User Profile */}
        <div className="flex items-center gap-2 pl-3 ml-1 border-l border-slate-200 dark:border-white/10">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{APP_CONFIG.user.name}</p>
            <p className="text-[9px] font-bold tracking-wider uppercase text-slate-600 dark:text-slate-400">{APP_CONFIG.user.role}</p>
          </div>
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/20 relative">
            <User className="w-4 h-4 text-white" />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
          </div>
        </div>

        {/* Theme Toggle in the far right corner */}
        <div className="pl-2 ml-1 border-l border-slate-200 dark:border-white/10">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
