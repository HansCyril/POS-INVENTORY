'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingCart, Package, Tag, History, Store, LogOut } from 'lucide-react';
import { APP_CONFIG } from '@/lib/config';
import { useRouter } from 'next/navigation';

const navLinks = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
  { href: '/pos', label: 'Point of Sale', icon: ShoppingCart },
  { href: '/inventory', label: 'Inventory', icon: Package },
  { href: '/categories', label: 'Categories', icon: Tag },
  { href: '/history', label: 'Sales History', icon: History },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    document.cookie = 'pos_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    router.push('/login');
    router.refresh();
  };
  
  return (
    <aside className="w-[220px] bg-transparent text-slate-600 dark:text-slate-300 flex flex-col shrink-0 relative z-20 transition-colors duration-300">
      
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-6 py-6 pt-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group cursor-pointer transition-transform hover:scale-110 active:scale-95">
          <Store className="w-5 h-5 text-white" />
        </div>
        <div className="flex flex-col">
          <h1 className="font-black text-lg text-slate-900 dark:text-white leading-tight tracking-tight">{APP_CONFIG.appName}</h1>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Global POS</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-2 px-3 space-y-0.5 overflow-y-auto scrollbar-thin">
        <p className="px-3 text-[9px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest mb-3">Menu</p>
        
        {navLinks.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-black transition-all duration-300 group relative ${
                active
                  ? 'bg-white/40 dark:bg-white/5 backdrop-blur-md text-indigo-600 dark:text-white border border-white/50 dark:border-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.03)] dark:shadow-none'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-white/30 dark:hover:bg-white/5 hover:text-indigo-600 dark:hover:text-white border border-transparent'
              }`}
            >
              <div className={`p-1 rounded-md transition-colors ${active ? 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-300' : 'bg-slate-100 dark:bg-slate-800/80 text-slate-400 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700/80 group-hover:text-indigo-600 dark:group-hover:text-slate-300'}`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="truncate">{label}</span>
              
              {active && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.6)] animate-pulse"></div>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-200 dark:border-white/5">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-black text-red-500 hover:bg-red-500/10 transition-all duration-300 group"
        >
          <div className="p-1 rounded-md bg-red-500/10 text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors">
            <LogOut className="w-4 h-4" />
          </div>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
