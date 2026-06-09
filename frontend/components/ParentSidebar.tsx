'use client';

import Link from 'next/link';
import LogoutConfirmButton from './LogoutConfirmButton';

type ActiveItem = 'dashboard' | 'students' | 'attendance' | 'messages' | 'reports';

interface ParentSidebarProps {
  activeItem: ActiveItem;
  className?: string;
  onNavigate?: () => void;
}

const activeClass = 'flex items-center gap-3 px-4 py-3 bg-primary-container text-on-primary-container font-bold rounded-lg transition-all';
const inactiveClass = 'flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-variant transition-all rounded-lg';

export default function ParentSidebar({ activeItem, className = 'hidden md:flex', onNavigate }: ParentSidebarProps) {
  return (
    <aside className={`${className} flex-col h-full py-stack-lg px-stack-md bg-surface-container-low w-64 fixed left-0 top-0 z-50 border-r border-outline-variant overflow-y-auto`}>
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
          <span className="material-symbols-outlined text-white">shield</span>
        </div>
        <div>
          <h1 className="font-label-md font-extrabold text-primary leading-tight">SafeReach</h1>
          <p className="font-label-sm text-label-sm text-on-surface-variant">Parent Portal</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1">
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
        <Link href="/parent/messages" onClick={onNavigate} className={`${activeItem === 'messages' ? activeClass : inactiveClass} relative`}>
          <span className="material-symbols-outlined text-[20px]">chat</span>
          <span className="font-label-md text-label-md">Messages</span>
          <span className="ml-auto w-2 h-2 bg-error rounded-full"></span>
        </Link>
        <Link href="/parent/reports" onClick={onNavigate} className={activeItem === 'reports' ? activeClass : inactiveClass}>
          <span className="material-symbols-outlined text-[20px]">description</span>
          <span className="font-label-md text-label-md">Reports</span>
        </Link>
      </nav>
      <div className="mt-auto pt-6 border-t border-outline-variant space-y-2">
        <button className="w-full mb-2 py-3 bg-error text-white font-bold rounded-lg flex items-center justify-center gap-2 active:scale-95 transition-transform hover:opacity-90">
          <span className="material-symbols-outlined text-[18px]">emergency</span>
          Emergency Alert
        </button>
        <Link href="/parent/support" onClick={onNavigate} className="flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:bg-surface-variant transition-all rounded-lg">
          <span className="material-symbols-outlined text-[20px]">help</span>
          <span className="font-label-md text-label-md">Help Center</span>
        </Link>
        <LogoutConfirmButton label="Sign Out" className="w-full flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:bg-surface-variant transition-all rounded-lg" />
      </div>
    </aside>
  );
}
