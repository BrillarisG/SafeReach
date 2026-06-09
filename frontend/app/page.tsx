'use client';

import Link from 'next/link';

const roles = [
  {
    key: 'admin',
    title: 'School Administrator',
    description: 'Full system access — manage students, staff, incidents, and safety analytics.',
    icon: 'admin_panel_settings',
    gradient: 'from-[#00236f] to-[#1e3a8a]',
    accent: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-800',
    href: '/login/admin',
    email: 'admin@demo.safereach.edu',
    password: 'Admin@2025',
    extra: 'OTP: 000000',
  },
  {
    key: 'teacher',
    title: 'Class Teacher',
    description: 'Manage your class — mark attendance, view students, file reports, message parents.',
    icon: 'school',
    gradient: 'from-[#006b5f] to-[#047857]',
    accent: 'border-green-200',
    badge: 'bg-green-100 text-green-800',
    href: '/login/teacher',
    email: 'teacher@demo.safereach.edu',
    password: 'Teacher@2025',
    extra: null,
  },
  {
    key: 'parent',
    title: 'Parent / Guardian',
    description: 'Track your child in real-time — view attendance, communicate with school, check reports.',
    icon: 'family_restroom',
    gradient: 'from-[#4b1c00] to-[#92400e]',
    accent: 'border-orange-200',
    badge: 'bg-orange-100 text-orange-800',
    href: '/login/parent',
    email: 'parent@demo.safereach.edu',
    password: 'Parent@2025',
    extra: null,
  },
];

export default function RoleSelectorPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex flex-col items-center justify-center p-4 md:p-8">

      {/* Branding */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-primary rounded-2xl mb-4 shadow-lg">
          <span className="material-symbols-outlined text-white text-[30px]" style={{fontVariationSettings: "'FILL' 1"}}>security</span>
        </div>
        <h1 className="font-headline-lg text-headline-lg text-primary font-extrabold tracking-tight">SafeReach</h1>
        <p className="text-body-md text-on-surface-variant mt-1">Smart Student Safety Tracker</p>
      </div>

      {/* Role Cards */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6">
        {roles.map(role => (
          <div key={role.key} className={`bg-white rounded-2xl shadow-md border ${role.accent} overflow-hidden flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-200`}>
            {/* Card Header */}
            <div className={`bg-gradient-to-br ${role.gradient} p-6 text-white`}>
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-white text-[28px]">{role.icon}</span>
              </div>
              <h2 className="font-headline-md text-headline-md font-bold">{role.title}</h2>
              <p className="text-white/80 text-label-md mt-1 leading-relaxed">{role.description}</p>
            </div>

            {/* Demo Credentials */}
            <div className="p-5 flex-1 flex flex-col">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mb-5 flex-1">
                <p className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px]">key</span>
                  Demo Credentials
                </p>
                <div className="space-y-2">
                  <div>
                    <p className="text-label-sm text-on-surface-variant">Email</p>
                    <p className="font-mono text-label-md text-on-surface font-bold break-all">{role.email}</p>
                  </div>
                  <div>
                    <p className="text-label-sm text-on-surface-variant">Password</p>
                    <p className="font-mono text-label-md text-on-surface font-bold">{role.password}</p>
                  </div>
                  {role.extra && (
                    <div className="pt-1 border-t border-slate-200 mt-1">
                      <p className="text-label-sm text-on-surface-variant">2FA Code</p>
                      <p className="font-mono text-label-md text-primary font-bold">{role.extra}</p>
                    </div>
                  )}
                </div>
              </div>

              <Link href={role.href} className={`w-full py-3 rounded-xl font-bold text-label-md text-center text-white bg-gradient-to-r ${role.gradient} hover:opacity-90 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-2`}>
                <span>Login as {role.key.charAt(0).toUpperCase() + role.key.slice(1)}</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-8 flex flex-col items-center gap-2">
        <p className="text-label-sm text-on-surface-variant flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[14px] text-secondary">verified_user</span>
          AES-256 Encrypted · Demo Environment
        </p>
        <p className="text-label-sm text-on-surface-variant/60">© 2025 SafeReach. All rights reserved.</p>
      </div>

      {/* Decorative blobs */}
      <div className="fixed top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
    </main>
  );
}
