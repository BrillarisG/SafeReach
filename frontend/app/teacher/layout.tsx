'use client';

import { usePathname } from '@/src/next-navigation';
import Link from '@/src/next-link';
import { useState } from 'react';
import TeacherSidebar from '@/components/TeacherSidebar';

type ActiveItem = 'dashboard' | 'students' | 'attendance' | 'messages' | 'reports' | 'timetable';

const itemMap: Record<string, ActiveItem> = {
  '/teacher/dashboard': 'dashboard',
  '/teacher/students': 'students',
  '/teacher/attendance': 'attendance',
  '/teacher/messages': 'messages',
  '/teacher/reports': 'reports',
  '/teacher/timetable': 'timetable',
  '/teacher/notifications': 'messages',
};

const titleMap: Record<string, { title: string; sub: string }> = {
  '/teacher/dashboard': { title: 'Sarah Jenkins', sub: 'Class 4-B Supervisor Â· Academic Year 2024â€“25' },
  '/teacher/students': { title: 'My Students', sub: 'Student records and live tracking status' },
  '/teacher/students/add': { title: 'Add Student', sub: 'Create a new assigned class student record' },
  '/teacher/attendance': { title: 'Attendance', sub: 'Mark and track daily attendance' },
  '/teacher/messages': { title: 'Messages', sub: 'Communicate with parents and staff' },
  '/teacher/reports': { title: 'Reports', sub: 'File incidents and view class reports' },
  '/teacher/settings': { title: 'Settings', sub: 'Teacher profile and account preferences' },
  '/teacher/support': { title: 'Support', sub: 'Help requests and school support contacts' },
  '/teacher/profile': { title: 'Profile', sub: 'Teacher profile settings' },
  '/teacher/timetable': { title: 'Timetable', sub: 'Class 4-B weekly periods and breaks' },
  '/teacher/timetable/edit': { title: 'Edit Timetable', sub: 'Manage periods, breaks, and subject assignments' },
  '/teacher/notifications': { title: 'Notifications', sub: 'Realtime student status updates' },
};

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? '';
  const [menuOpen, setMenuOpen] = useState(false);
  const activeItem: ActiveItem = itemMap[pathname] ?? 'dashboard';
  const { title, sub } = titleMap[pathname] ?? { title: 'Teacher Portal', sub: '' };

  return (
    <div className="bg-background text-on-surface min-h-screen overflow-x-hidden pt-16">
      <TeacherSidebar activeItem={activeItem} />
      {menuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button type="button" aria-label="Close navigation menu" onClick={() => setMenuOpen(false)} className="absolute inset-0 bg-black/40"></button>
          <TeacherSidebar activeItem={activeItem} className="flex" onNavigate={() => setMenuOpen(false)} />
        </div>
      )}
      <div className="md:ml-60 flex flex-col min-h-[calc(100vh-64px)] min-w-0">
        <header className="fixed top-0 left-0 right-0 md:left-60 z-30 flex justify-between items-center h-16 px-container-padding-mobile md:px-container-padding-desktop bg-surface border-b border-outline-variant/30 shadow-sm shrink-0">
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
              <input className="bg-transparent focus:ring-0 border-none text-body-md w-36 outline-none" placeholder="Search..." />
            </div>
            <Link href="/teacher/notifications" className="relative h-9 w-9 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors" title="Notifications">
              <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full"></span>
            </Link>
            <Link href="/teacher/support" className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors" title="Support">
              <span className="material-symbols-outlined text-on-surface-variant">help</span>
            </Link>
            <Link href="/teacher/profile" className="w-9 h-9 rounded-full overflow-hidden border-2 border-primary-container shrink-0" title="Teacher profile">
              <img alt="Teacher" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDd1RNbZ24b_iQ3_FL57yS395rgZ_iD9C2SdErGHp_gkjLnLAitVvWoTTn6T3VJL-VlQYIlp7EEZId9MF4tahLWSeqot2YhPM_REtQz5zVSjnG0qQ5_T6CW86GKtb-7sFlfw1uRDn0m6W41RVZI8TjHEQyoayt7xLSkamLgDULlnUKeitN2QoVlwfyn4No3nHQty7g70eWPuMQCNWFboad27ZSPcqOoXncwKU1ZzcVMRJDtdfMx8hEJL4D55qi7gO2ak1rsos2pm_CA" />
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

