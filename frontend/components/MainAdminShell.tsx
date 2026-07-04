'use client';

import Link from '@/src/next-link';
import { useState } from 'react';
import LogoutConfirmButton from './LogoutConfirmButton';
import LogoMark from './LogoMark';

type MainAdminShellProps = {
  active: 'dashboard' | 'reports' | 'terms' | 'notifications';
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

const navItems = [
  { id: 'dashboard', label: 'App Control', href: '/main-admin/dashboard', icon: 'admin_panel_settings' },
  { id: 'reports', label: 'All Reports', href: '/main-admin/reports', icon: 'monitoring' },
  { id: 'terms', label: 'Terms & Conditions', href: '/main-admin/terms', icon: 'policy' },
  { id: 'notifications', label: 'Notifications', href: '/main-admin/notifications', icon: 'notifications' },
] as const;

export default function MainAdminShell({ active, title, subtitle, children }: MainAdminShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const sidebar = (
    <aside className="w-64 h-screen bg-white border-r border-outline-variant/50 flex flex-col p-4 shadow-sm">
      <div className="flex items-center gap-3 mb-8">
        <LogoMark className="h-10 w-10 rounded-xl" />
        <div>
          <p className="font-bold text-primary leading-tight">SafeReach</p>
          <p className="text-label-sm text-on-surface-variant">Main Admin</p>
        </div>
      </div>
      <nav className="space-y-2">
        {navItems.map(item => (
          <Link
            key={item.id}
            href={item.href}
            onClick={() => setMenuOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-label-md transition-colors ${active === item.id ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container hover:text-primary'}`}
          >
            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto space-y-3 border-t border-outline-variant pt-4">
        <Link href="/school-registration" className="flex items-center gap-3 px-4 py-3 rounded-lg text-primary hover:bg-primary/5 font-label-md">
          <span className="material-symbols-outlined text-[20px]">domain_add</span>
          School Registration URL
        </Link>
        <LogoutConfirmButton className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-error hover:bg-error-container font-label-md" />
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-background text-on-surface overflow-x-hidden pt-16">
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-surface border-b border-outline-variant/40 shadow-sm flex items-center justify-between px-container-padding-mobile md:px-container-padding-desktop">
        <div className="flex items-center gap-3 min-w-0">
          <button type="button" onClick={() => setMenuOpen(open => !open)} className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-surface-container" aria-label="Toggle main admin navigation">
            <span className="material-symbols-outlined">menu</span>
          </button>
          <div className="min-w-0">
            <h1 className="font-headline-md text-headline-md text-primary leading-tight truncate">{title}</h1>
            <p className="hidden md:block text-label-sm text-on-surface-variant">{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex status-chip bg-primary/10 text-primary">App Owner Access</span>
          <Link href="/main-admin/login" className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center" title="Main admin profile">
            <span className="material-symbols-outlined text-[20px]">person</span>
          </Link>
        </div>
      </header>
      <div className="flex min-h-[calc(100vh-64px)]">
        <div className="hidden lg:block fixed left-0 top-16 z-30">{sidebar}</div>
        {menuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <button type="button" aria-label="Close main admin navigation" className="absolute inset-0 bg-black/40" onClick={() => setMenuOpen(false)} />
            <div className="fixed left-0 top-0 z-50">{sidebar}</div>
          </div>
        )}
        <main className="flex-1 min-w-0 lg:ml-64">
          {children}
        </main>
      </div>
    </div>
  );
}

