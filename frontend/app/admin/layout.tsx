'use client';

import { usePathname } from 'next/navigation';
import { useState } from 'react';
import AdminTopNav from '@/components/AdminTopNav';
import AdminSidebar from '@/components/AdminSidebar';

type SidebarItem = 'analytics' | 'students' | 'teachers' | 'incident' | 'reports' | 'audit';
type NavPage = 'dashboard' | 'students' | 'teachers' | 'reports';

function getSidebar(p: string): SidebarItem {
  if (p.includes('/incidents')) return 'incident';
  if (p.includes('/reports')) return 'reports';
  if (p.includes('/account')) return 'audit';
  if (p.includes('/teachers')) return 'teachers';
  if (p.includes('/students')) return 'students';
  return 'analytics';
}

function getNav(p: string): NavPage {
  if (p.includes('/reports')) return 'reports';
  if (p.includes('/teachers')) return 'teachers';
  if (p.includes('/students')) return 'students';
  return 'dashboard';
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="bg-background text-on-surface min-h-screen overflow-x-hidden pt-16">
      <AdminTopNav activePage={getNav(pathname)} onMenuToggle={() => setMenuOpen(open => !open)} />
      <div className="flex min-h-[calc(100vh-64px)]">
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
