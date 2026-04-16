'use client';
import { usePathname } from 'next/navigation';
import Header from './Header';
import { APP_CONFIG } from '@/lib/config';

interface MainContentProps {
  children: React.ReactNode;
}

const titles: Record<string, string> = {
  '/': 'Dashboard Overview',
  '/pos': 'Point of Sale',
  '/inventory': 'Inventory Management',
  '/categories': 'Product Categories',
  '/history': 'Sales History',
};

export default function MainContent({ children }: MainContentProps) {
  const pathname = usePathname();
  const title = titles[pathname] || APP_CONFIG.appName;

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full">
      <Header title={title} />
      <main className="flex-1 overflow-auto relative z-10 bg-white/70 dark:bg-slate-900/40 rounded-tl-2xl border-t border-l border-slate-200 dark:border-white/5 shadow-2xl mt-1 ml-0 mb-1 mr-1 transition-colors duration-300">
        {children}
      </main>
    </div>
  );
}
