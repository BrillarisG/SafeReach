'use client';

import Link from 'next/link';

type ActivePage = 'dashboard' | 'students' | 'teachers' | 'messages' | 'reports' | 'timetable';

interface AdminTopNavProps {
  activePage: ActivePage;
  onMenuToggle?: () => void;
}

export default function AdminTopNav({ activePage, onMenuToggle }: AdminTopNavProps) {
  const activeLink = 'font-body-md text-body-md text-primary border-b-2 border-primary pb-1 cursor-pointer';
  const inactiveLink = 'font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors cursor-pointer';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-container-padding-mobile md:px-container-padding-desktop w-full h-16 bg-surface shadow-sm border-b border-outline-variant/30">
      <div className="flex items-center gap-3">
        <button type="button" onClick={onMenuToggle} className="lg:hidden text-on-surface-variant hover:text-primary p-2 -ml-2 rounded-lg hover:bg-surface-container" aria-label="Toggle navigation menu">
          <span className="material-symbols-outlined">menu</span>
        </button>
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <span className="material-symbols-outlined text-white text-[18px]">shield</span>
        </div>
        <span className="text-headline-md font-bold text-primary">SafeReach</span>
      </div>
      <nav className="hidden md:flex items-center gap-6">
        <Link href="/admin/dashboard" className={activePage === 'dashboard' ? activeLink : inactiveLink}>Dashboard</Link>
        <Link href="/admin/students" className={activePage === 'students' ? activeLink : inactiveLink}>Class Records</Link>
        <Link href="/admin/teachers" className={activePage === 'teachers' ? activeLink : inactiveLink}>Teachers</Link>
        <Link href="/admin/messages" className={activePage === 'messages' ? activeLink : inactiveLink}>Messages</Link>
        <Link href="/admin/timetable" className={activePage === 'timetable' ? activeLink : inactiveLink}>Timetable</Link>
        <Link href="/admin/reports" className={activePage === 'reports' ? activeLink : inactiveLink}>Safety Reports</Link>
      </nav>
      <div className="flex items-center gap-3">
        <Link href="/admin/notifications" className="relative text-on-surface-variant hover:text-primary hover:bg-surface-container p-2 rounded-full transition-colors" title="Notifications">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full"></span>
        </Link>
        <Link href="/admin/support" className="text-on-surface-variant hover:text-primary hover:bg-surface-container p-2 rounded-full transition-colors" title="Support">
          <span className="material-symbols-outlined">help</span>
        </Link>
        <Link href="/admin/profile" className="w-9 h-9 rounded-full overflow-hidden border-2 border-primary-container cursor-pointer" title="Admin profile">
          <img alt="Admin profile" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAYBdwqv0pO5c3pRxo-UH9ZO9PacQRzbzk_AtBxwaznbApk9P1IiTfYxU7YJcDY2hqN1ryLYriIs7Ql-pO459BjqIw-zri_11tPW3gJE4saOaSSp5wGouDsROn4_Hw7q0r-ONfGdCL1bz6DtaQBbm8fLO3874I15cRXZAo2RS6TWXHDZkk7J5qR_wNYfsRNvDSAnCKTyOOpA7jALzjFFOFgFW7WWISo4yGvCD_094Nf36lB9H-HpxIVABwhXcZ7vV5fQHNrqA_0ZtlP" />
        </Link>
      </div>
    </header>
  );
}
