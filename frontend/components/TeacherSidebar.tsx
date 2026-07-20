'use client';

import Link from '@/src/next-link';
import LogoutConfirmButton from './LogoutConfirmButton';
import LogoMark from './LogoMark';

type ActiveItem = 'dashboard' | 'students' | 'attendance' | 'messages' | 'reports' | 'timetable';

interface TeacherSidebarProps {
  activeItem: ActiveItem;
  className?: string;
  onNavigate?: () => void;
}

const activeClass = 'bg-surface-container text-on-surface font-bold rounded-md px-3 py-2.5 flex items-center gap-3 transition-colors';
const inactiveClass = 'text-on-surface-variant hover:bg-surface-container-low px-3 py-2.5 rounded-md flex items-center gap-3 transition-colors';

export default function TeacherSidebar({ activeItem, className = 'hidden md:flex', onNavigate }: TeacherSidebarProps) {
  return (
    <aside className={`${className} flex-col h-dvh max-h-dvh w-60 fixed left-0 top-0 z-50 border-r border-outline-variant/60 bg-surface px-3 py-4 overflow-y-auto overscroll-contain`}>
      <div className="mb-7 rounded-lg bg-surface-container-low px-3 py-3">
        <div className="mb-1 flex items-center gap-2">
          <LogoMark className="h-8 w-8 rounded-md" />
          <h1 className="font-headline-md text-headline-md font-extrabold text-on-surface">SafeReach</h1>
        </div>
      </div>
      <nav className="flex min-h-0 flex-1 flex-col gap-1">
        <Link href="/teacher/dashboard" onClick={onNavigate} className={activeItem === 'dashboard' ? activeClass : inactiveClass}>
          <span className="material-symbols-outlined text-[20px]">dashboard</span>
          <span className="font-label-md text-label-md">Dashboard</span>
        </Link>
        <Link href="/teacher/students" onClick={onNavigate} className={`hidden ${activeItem === 'students' ? activeClass : inactiveClass}`}>
          <span className="material-symbols-outlined text-[20px]">school</span>
          <span className="font-label-md text-label-md">My Students</span>
        </Link>
        <Link href="/teacher/attendance" onClick={onNavigate} className={activeItem === 'attendance' ? activeClass : inactiveClass}>
          <span className="material-symbols-outlined text-[20px]">how_to_reg</span>
          <span className="font-label-md text-label-md">Attendance</span>
        </Link>
        <Link href="/teacher/timetable" onClick={onNavigate} className={activeItem === 'timetable' ? activeClass : inactiveClass}>
          <span className="material-symbols-outlined text-[20px]">calendar_month</span>
          <span className="font-label-md text-label-md">Timetable</span>
        </Link>
        <Link href="/teacher/messages" onClick={onNavigate} className={activeItem === 'messages' ? activeClass : inactiveClass}>
          <span className="material-symbols-outlined text-[20px]">chat</span>
          <span className="font-label-md text-label-md">Messages</span>
        </Link>
        <Link href="/teacher/reports" onClick={onNavigate} className={activeItem === 'reports' ? activeClass : inactiveClass}>
          <span className="material-symbols-outlined text-[20px]">analytics</span>
          <span className="font-label-md text-label-md">Reports</span>
        </Link>
      </nav>
      <div className="mt-auto flex shrink-0 flex-col gap-3 border-t border-outline-variant/60 pt-4">
        <button className="flex items-center justify-center gap-2 rounded-md bg-error px-3 py-2.5 font-bold text-on-error transition-transform hover:opacity-90 active:scale-95">
          <span className="material-symbols-outlined text-[18px]" style={{fontVariationSettings: "'FILL' 1"}}>report</span>
          Emergency Alert
        </button>
        <div className="flex flex-col gap-1">
          <Link href="/teacher/support" onClick={onNavigate} className="flex items-center gap-3 rounded-md px-3 py-2.5 text-on-surface-variant transition-colors hover:bg-surface-container-low">
            <span className="material-symbols-outlined text-[20px]">help</span>
            <span className="font-label-md text-label-md">Help Center</span>
          </Link>
          <LogoutConfirmButton label="Sign Out" className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-on-surface-variant transition-colors hover:bg-surface-container-low" />
        </div>
      </div>
    </aside>
  );
}

