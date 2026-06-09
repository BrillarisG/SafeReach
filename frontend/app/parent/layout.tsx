'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import ParentSidebar from '@/components/ParentSidebar';

type ActiveItem = 'dashboard' | 'students' | 'attendance' | 'messages' | 'reports';

const itemMap: Record<string, ActiveItem> = {
  '/parent/dashboard': 'dashboard',
  '/parent/students': 'students',
  '/parent/attendance': 'attendance',
  '/parent/messages': 'messages',
  '/parent/reports': 'reports',
};

const titleMap: Record<string, { title: string; sub: string }> = {
  '/parent/dashboard': { title: 'Parent Dashboard', sub: 'Real-time safety overview for your children' },
  '/parent/students': { title: 'My Children', sub: 'Live tracking and activity' },
  '/parent/attendance': { title: 'Attendance', sub: 'Monthly attendance records' },
  '/parent/messages': { title: 'Messages', sub: 'School communications' },
  '/parent/reports': { title: 'Reports', sub: 'Academic and safety reports' },
  '/parent/settings': { title: 'Settings', sub: 'Parent profile and notification preferences' },
  '/parent/support': { title: 'Support', sub: 'Help requests and school support contacts' },
  '/parent/children/records': { title: 'Child Records', sub: 'Detailed records from quick access' },
  '/parent/profile': { title: 'Profile', sub: 'Parent profile settings' },
};

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const activeItem: ActiveItem = itemMap[pathname] ?? 'dashboard';
  const { title, sub } = titleMap[pathname] ?? { title: 'Parent Portal', sub: '' };

  return (
    <div className="bg-background text-on-surface min-h-screen overflow-x-hidden pt-16">
      <ParentSidebar activeItem={activeItem} />
      {menuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button type="button" aria-label="Close navigation menu" onClick={() => setMenuOpen(false)} className="absolute inset-0 bg-black/40"></button>
          <ParentSidebar activeItem={activeItem} className="flex" onNavigate={() => setMenuOpen(false)} />
        </div>
      )}
      <div className="md:ml-64 flex flex-col min-h-[calc(100vh-64px)] min-w-0">
        <header className="fixed top-0 left-0 right-0 md:left-64 z-30 flex justify-between items-center h-16 px-container-padding-mobile md:px-container-padding-desktop bg-surface border-b border-outline-variant/30 shadow-sm shrink-0">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setMenuOpen(open => !open)} className="md:hidden text-on-surface-variant p-2 -ml-2 rounded-lg hover:bg-surface-container" aria-label="Toggle navigation menu">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div>
              <h2 className="font-headline-md text-headline-md text-primary leading-tight">{title}</h2>
              <p className="text-label-sm text-on-surface-variant hidden md:block">{sub}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <div className="hidden md:flex items-center gap-2 bg-surface-container rounded-full px-3 py-1.5 border border-outline-variant">
              <span className="material-symbols-outlined text-outline text-[18px]">search</span>
              <input className="bg-transparent focus:ring-0 border-none text-body-md w-40 outline-none" placeholder="Search updates..." />
            </div>
            <button className="relative h-9 w-9 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full"></span>
            </button>
            <Link href="/parent/support" className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors" title="Support">
              <span className="material-symbols-outlined text-on-surface-variant">help</span>
            </Link>
            <Link href="/parent/profile" className="w-9 h-9 rounded-full overflow-hidden border-2 border-primary shrink-0" title="Parent profile">
              <img alt="Parent" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA2ppRkv8ioDNnC1LAQ3CMXViVbD7L_xdUSj5P1JrfKTBa2QUri_iFVaVxsHOLQ06J787USHm3r9uiWHpstHfc16stUolCM_yLpS6FGIOtCS3_Hl01R13M_jfvcq4s2fHqGt0mL3txlucv-b-PeTYwNsYpLN9QWceIGqxYs05HEXdmM-2h5Pm-Duh_B2aMQuNGjyyxH36Uiw5cBX1J7V5jX6gOynV_TaHBl7yvDzkguksOBRpFdg0SRNJGsmzRH0xlrK91Ae6Au8ngz" />
            </Link>
          </div>
        </header>
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
