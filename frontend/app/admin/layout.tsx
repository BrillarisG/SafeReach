'use client';

import { usePathname } from '@/src/next-navigation';
import { useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';

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
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="bg-background text-on-surface min-h-screen overflow-x-hidden">
      <div className="flex min-h-screen">
        <AdminSidebar activeItem={getSidebar(pathname)} />
        {menuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <button type="button" aria-label="Close navigation menu" onClick={() => setMenuOpen(false)} className="absolute inset-0 bg-black/40"></button>
            <AdminSidebar activeItem={getSidebar(pathname)} className="flex fixed left-0 top-0 h-screen" onNavigate={() => setMenuOpen(false)} />
          </div>
        )}
        <div className="flex-1 min-w-0 lg:ml-64">
          {children}
        </div>
      </div>
    </div>
  );
}
