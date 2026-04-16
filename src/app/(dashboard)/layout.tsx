import Sidebar from '@/components/Sidebar';
import MainContent from '@/components/MainContent';
import GlobalAIAssistant from '@/components/GlobalAIAssistant';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-white/20 dark:bg-slate-950/40 backdrop-blur-[60px] transition-colors duration-300">
      <Sidebar />
      <MainContent>{children}</MainContent>
      <GlobalAIAssistant />
    </div>
  );
}
