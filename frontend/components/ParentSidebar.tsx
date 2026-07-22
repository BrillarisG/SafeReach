'use client';

import Link from '@/src/next-link';
import LogoutConfirmButton from './LogoutConfirmButton';
import LogoMark from './LogoMark';

type ActiveItem = 'dashboard' | 'students' | 'attendance' | 'messages' | 'reports' | 'timetable';

interface ParentSidebarProps {
  activeItem: ActiveItem;
  className?: string;
  onNavigate?: () => void;
}

const activeClass = 'flex items-center gap-3 rounded-md bg-surface-container px-3 py-2.5 font-bold text-on-surface transition-colors';
const inactiveClass = 'flex items-center gap-3 rounded-md px-3 py-2.5 text-on-surface-variant transition-colors hover:bg-surface-container-low';

export default function ParentSidebar({ activeItem, className = 'hidden md:flex', onNavigate }: ParentSidebarProps) {
  return (
    <aside className={`${className} flex-col h-[100svh] max-h-[100svh] w-64 fixed left-0 top-0 z-50 border-r border-outline-variant/60 bg-surface px-3 py-4 pb-4 overflow-y-auto overscroll-contain touch-pan-y [-webkit-overflow-scrolling:touch]`}>
      <div className="mb-7 rounded-lg bg-surface-container-low px-3 py-3">
        <div className="mb-1 flex items-center gap-2">
          <LogoMark className="h-8 w-8 rounded-md" />
          <h1 className="font-headline-md text-headline-md font-extrabold text-on-surface leading-tight">SafeReach</h1>
        </div>
      </div>
      <nav className="flex min-h-0 flex-1 flex-col gap-1">
        <Link href="/parent/dashboard" onClick={onNavigate} className={activeItem === 'dashboard' ? activeClass : inactiveClass}>
          <span className="material-symbols-outlined text-[20px]">dashboard</span>
          <span className="font-label-md text-label-md">Dashboard</span>
        </Link>
        <Link href="/parent/students" onClick={onNavigate} className={activeItem === 'students' ? activeClass : inactiveClass}>
          <span className="material-symbols-outlined text-[20px]">child_care</span>
          <span className="font-label-md text-label-md">My Children</span>
        </Link>
        <Link href="/parent/attendance" onClick={onNavigate} className={activeItem === 'attendance' ? activeClass : inactiveClass}>
          <span className="material-symbols-outlined text-[20px]">how_to_reg</span>
          <span className="font-label-md text-label-md">Attendance</span>
        </Link>
        <Link href="/parent/timetable" onClick={onNavigate} className={activeItem === 'timetable' ? activeClass : inactiveClass}>
          <span className="material-symbols-outlined text-[20px]">calendar_month</span>
          <span className="font-label-md text-label-md">Timetable</span>
        </Link>
        <Link href="/parent/messages" onClick={onNavigate} className={`${activeItem === 'messages' ? activeClass : inactiveClass} relative`}>
          <span className="material-symbols-outlined text-[20px]">chat</span>
          <span className="font-label-md text-label-md">Messages</span>
          <span className="ml-auto w-2 h-2 bg-error rounded-full"></span>
        </Link>
        <Link href="/parent/reports" onClick={onNavigate} className={activeItem === 'reports' ? activeClass : inactiveClass}>
          <span className="material-symbols-outlined text-[20px]">description</span>
          <span className="font-label-md text-label-md">Results</span>
        </Link>
      </nav>
      <div className="mt-auto flex shrink-0 flex-col gap-1 border-t border-outline-variant/60 pt-4">
        <Link href="/parent/support" onClick={onNavigate} className="flex items-center gap-3 rounded-md px-3 py-2.5 text-on-surface-variant transition-colors hover:bg-surface-container-low">
          <span className="material-symbols-outlined text-[20px]">help</span>
          <span className="font-label-md text-label-md">Help Center</span>
        </Link>
        <LogoutConfirmButton label="Sign Out" className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-on-surface-variant transition-colors hover:bg-surface-container-low" />
        <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-md bg-error px-3 py-2.5 font-bold text-on-error transition-transform hover:opacity-90 active:scale-95">
          <span className="material-symbols-outlined text-[18px]">emergency</span>
          Emergency Alert
        </button>
      </div>
    </aside>
  );
}

