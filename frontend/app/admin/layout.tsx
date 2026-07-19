'use client';

import { usePathname } from '@/src/next-navigation';
import Link from '@/src/next-link';
import AdminSidebar from '@/components/AdminSidebar';
import LogoMark from '@/components/LogoMark';

type SidebarItem = 'analytics' | 'students' | 'teachers' | 'messages' | 'incident' | 'reports' | 'audit' | 'timetable';

function getSidebar(p: string): SidebarItem {
  if (p.includes('/incidents')) return 'incident';
  if (p.includes('/reports')) return 'reports';
  if (p.includes('/timetable')) return 'timetable';
  if (p.includes('/account')) return 'audit';
  if (p.includes('/messages')) return 'messages';
  if (p.includes('/teachers')) return 'teachers';
  if (p.includes('/students')) return 'students';
  return 'analytics';
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? '';
  return (
    <div className="bg-background text-on-surface min-h-screen overflow-x-hidden pt-16">
      <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-outline-variant/50 bg-surface px-4 md:px-6">
        <div className="flex items-center gap-2"><LogoMark className="h-8 w-8 rounded-md" /><span className="font-headline-md font-extrabold text-on-surface">SafeReach</span></div>
        <Link href="/admin/profile" title="Profile" className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-on-primary"><span className="material-symbols-outlined text-[20px]">person</span></Link>
      </header>
      <div className="flex min-h-[calc(100vh-64px)]">
        <AdminSidebar activeItem={getSidebar(pathname)} />
        <div className="flex-1 min-w-0 lg:ml-64">
          {children}
        </div>
      </div>
    </div>
  );
}
