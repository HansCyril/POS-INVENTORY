import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import RealtimeProvider from '@/components/providers/RealtimeProvider';
import { APP_CONFIG } from '@/lib/config';
import { ThemeProvider } from '@/components/providers/ThemeProvider';

// Theme-aware POS System Layout
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: APP_CONFIG.appName,
  description: 'A Next-Generation Point of Sale Experience',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen text-slate-900 dark:text-slate-100 bg-[#f8fafc] dark:bg-slate-950 selection:bg-indigo-500/30 transition-colors duration-300 overflow-hidden relative`}>
        {/* Subtle animated background shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none opacity-50 dark:opacity-100 transition-opacity">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 dark:bg-indigo-600/10 blur-[100px] mix-blend-multiply dark:mix-blend-screen animate-blob"></div>
          <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/10 dark:bg-purple-600/10 blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[60%] rounded-full bg-emerald-600/10 dark:bg-emerald-600/10 blur-[150px] mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-4000"></div>
        </div>
        
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <RealtimeProvider>
            {children}
          </RealtimeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
