'use client';

import Link from '@/src/next-link';
import LogoutConfirmButton from './LogoutConfirmButton';
import { downloadTextFile } from '@/lib/downloadFile';
import LogoMark from './LogoMark';

type AnalyticsItem = 'analytics' | 'students' | 'teachers' | 'messages' | 'incident' | 'reports' | 'audit' | 'timetable';
type Variant = 'analytics' | 'hub';

interface AdminSidebarProps {
  activeItem: AnalyticsItem;
  variant?: Variant;
  className?: string;
  onNavigate?: () => void;
}

const activeClass = 'flex items-center gap-3 rounded-md bg-surface-container px-3 py-2.5 font-bold text-on-surface transition-colors';
const inactiveClass = 'flex items-center gap-3 rounded-md px-3 py-2.5 text-on-surface-variant transition-colors hover:bg-surface-container-low';

export default function AdminSidebar({ activeItem, variant = 'analytics', className, onNavigate }: AdminSidebarProps) {
  function exportGlobalData() {
    const csv = [
      'module,total,active,pending',
      'Students,2480,2301,18',
      'Teachers,86,82,4',
      'Incidents,24,8,5',
      'Reports,47,42,5',
    ].join('\n');
    downloadTextFile('safereach-global-data.csv', csv, 'text/csv');
  }

  if (variant === 'hub') {
    return (
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-screen bg-surface border-r border-outline-variant/60 w-64 z-50 p-3">
        <div className="mb-7 rounded-lg bg-surface-container-low px-3 py-3">
          <div className="flex items-center gap-2 mb-1">
            <LogoMark className="h-8 w-8 rounded-lg" />
            <h2 className="text-label-md font-bold text-primary">SafeReach</h2>
          </div>
        </div>
        <nav className="flex-1 space-y-1">
            <Link href="/admin/dashboard" onClick={onNavigate} className={activeItem === 'analytics' ? activeClass : inactiveClass}>
            <span className="material-symbols-outlined text-[20px]">dashboard</span>
            <span className="font-label-md text-label-md">Dashboard</span>
          </Link>
          <Link href="/admin/students" onClick={onNavigate} className={activeItem === 'students' ? activeClass : inactiveClass}>
            <span className="material-symbols-outlined text-[20px]">school</span>
          <span className="font-label-md text-label-md">Class Records</span>
          </Link>
        <Link href="/admin/teachers" onClick={onNavigate} className={activeItem === 'teachers' ? activeClass : inactiveClass}>
          <span className="material-symbols-outlined text-[20px]">badge</span>
          <span className="font-label-md text-label-md">Staff Management</span>
        </Link>
          <Link href="/admin/messages" onClick={onNavigate} className={activeItem === 'messages' ? activeClass : inactiveClass}>
            <span className="material-symbols-outlined text-[20px]">chat</span>
            <span className="font-label-md text-label-md">Messages</span>
          </Link>
          <Link href="/admin/incidents" onClick={onNavigate} className={activeItem === 'incident' ? activeClass : inactiveClass}>
            <span className="material-symbols-outlined text-[20px]">warning</span>
            <span className="font-label-md text-label-md">Incident Logs</span>
          </Link>
          <Link href="/admin/reports" onClick={onNavigate} className={activeItem === 'reports' ? activeClass : inactiveClass}>
            <span className="material-symbols-outlined text-[20px]">bar_chart</span>
            <span className="font-label-md text-label-md">Reports</span>
          </Link>
        </nav>
        <div className="mt-auto space-y-2">
          <button className="w-full bg-error text-on-error py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all">
            <span className="material-symbols-outlined text-[18px]" style={{fontVariationSettings: "'FILL' 1"}}>emergency</span>
            Emergency Alert
          </button>
          <div className="pt-4 border-t border-outline-variant space-y-1">
            <Link href="/admin/account" onClick={onNavigate} className={activeItem === 'audit' ? activeClass : inactiveClass}>
              <span className="material-symbols-outlined text-[20px]">manage_accounts</span>
              <span className="font-label-md text-label-md">Account Settings</span>
            </Link>
            <LogoutConfirmButton label="Sign Out" className="w-full flex items-center gap-3 rounded-md px-3 py-2.5 text-on-surface-variant transition-colors hover:bg-surface-container-low" />
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className={`${className ?? 'hidden lg:flex fixed left-0 top-0 h-screen'} flex-col w-64 bg-surface border-r border-outline-variant/60 p-3 overflow-y-auto z-50`}>
      <div className="mb-6">
        <h2 className="text-label-md font-bold text-primary px-2 mb-1">Admin Panel</h2>
      </div>
      <nav className="flex-1 space-y-1">
        <Link href="/admin/dashboard" onClick={onNavigate} className={activeItem === 'analytics' ? activeClass : inactiveClass}>
          <span className="material-symbols-outlined text-[20px]" style={activeItem === 'analytics' ? {fontVariationSettings: "'FILL' 1"} : undefined}>dashboard</span>
          <span className="text-label-md">Real-time Analytics</span>
        </Link>
        <Link href="/admin/students" onClick={onNavigate} className={activeItem === 'students' ? activeClass : inactiveClass}>
          <span className="material-symbols-outlined text-[20px]">school</span>
          <span className="text-label-md">Class Records</span>
        </Link>
        <Link href="/admin/teachers" onClick={onNavigate} className={activeItem === 'teachers' ? activeClass : inactiveClass}>
          <span className="material-symbols-outlined text-[20px]">badge</span>
          <span className="text-label-md">Staff Management</span>
        </Link>
        <Link href="/admin/timetable" onClick={onNavigate} className={activeItem === 'timetable' ? activeClass : inactiveClass}>
          <span className="material-symbols-outlined text-[20px]">calendar_month</span>
          <span className="text-label-md">Timetable</span>
        </Link>
        <Link href="/admin/messages" onClick={onNavigate} className={activeItem === 'messages' ? activeClass : inactiveClass}>
          <span className="material-symbols-outlined text-[20px]">chat</span>
          <span className="text-label-md">Messages</span>
        </Link>
        <Link href="/admin/incidents" onClick={onNavigate} className={activeItem === 'incident' ? activeClass : inactiveClass}>
          <span className="material-symbols-outlined text-[20px]">warning</span>
          <span className="text-label-md">Incident Logs</span>
        </Link>
        <Link href="/admin/reports" onClick={onNavigate} className={activeItem === 'reports' ? activeClass : inactiveClass}>
          <span className="material-symbols-outlined text-[20px]">bar_chart</span>
          <span className="text-label-md">Safety Reports</span>
        </Link>
        <Link href="/admin/account" onClick={onNavigate} className={activeItem === 'audit' ? activeClass : inactiveClass}>
          <span className="material-symbols-outlined text-[20px]">security</span>
          <span className="text-label-md">System Audit</span>
        </Link>
      </nav>
      <button onClick={exportGlobalData} className="mt-4 mb-4 w-full py-2 bg-secondary text-on-secondary rounded-lg font-label-md hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
        <span className="material-symbols-outlined text-[18px]">download</span>
        Export Global Data
      </button>
      <div className="border-t border-outline-variant pt-4 space-y-1">
        <Link href="/admin/support" onClick={onNavigate} className="flex items-center gap-3 rounded-md px-3 py-2.5 text-on-surface-variant transition-colors hover:bg-surface-container-low">
          <span className="material-symbols-outlined text-[20px]">help</span>
          <span className="text-label-md">Support</span>
        </Link>
        <LogoutConfirmButton className="w-full flex items-center gap-3 rounded-md px-3 py-2.5 text-on-surface-variant transition-colors hover:bg-surface-container-low" />
      </div>
    </aside>
  );
}

