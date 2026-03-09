'use client';
import './globals.css';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Tag,
  History,
  Store,
} from 'lucide-react';

const navLinks = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/pos', label: 'POS', icon: ShoppingCart },
  { href: '/inventory', label: 'Inventory', icon: Package },
  { href: '/categories', label: 'Categories', icon: Tag },
  { href: '/history', label: 'Sales History', icon: History },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50">
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar */}
          <aside className="w-64 bg-slate-900 text-white flex flex-col shrink-0">
            <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-700">
              <Store className="w-7 h-7 text-blue-400" />
              <div>
                <h1 className="font-bold text-lg leading-tight">POS System</h1>
                <p className="text-xs text-slate-400">Inventory Manager</p>
              </div>
            </div>
            <nav className="flex-1 py-4 px-3 space-y-1">
              {navLinks.map(({ href, label, icon: Icon }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {label}
                  </Link>
                );
              })}
            </nav>
            <div className="px-6 py-4 border-t border-slate-700">
              <p className="text-xs text-slate-500">v1.0.0 · User Mode</p>
            </div>
          </aside>
          {/* Main Content */}
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </body>
    </html>
  );
}
