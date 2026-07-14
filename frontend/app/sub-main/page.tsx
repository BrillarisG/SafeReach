'use client';

import { useState } from 'react';
import Link from '@/src/next-link';
import { useRouter } from '@/src/next-navigation';
import LogoMark from '@/components/LogoMark';

const SUB_ADMIN_EMAIL = 'admin@demo.safereach.edu';
const SUB_ADMIN_PASSWORD = 'Admin@2025';
const SUB_ADMIN_OTP = '246810';

export default function SubMainLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [showPassword, setShowPassword] = useState(false);

  function handleCredentials(event: React.FormEvent) {
    event.preventDefault();
    setStep(2);
  }

  function handleOtp(event: React.FormEvent) {
    event.preventDefault();
    router.push('/admin/dashboard');
  }

  return (
    <main className="min-h-screen bg-[#eef4ff] flex">
      <section className="flex-1 flex flex-col justify-center px-6 md:px-12 lg:px-20 py-12 max-w-xl w-full mx-auto lg:mx-0">
        <Link href="/" className="inline-flex items-center gap-1 text-primary text-label-md hover:underline mb-10">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to SafeReach
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <LogoMark className="h-10 w-10 rounded-xl" />
          <div>
            <h1 className="font-headline-md text-headline-md text-primary font-bold leading-tight">SafeReach School Administrator</h1>
            <p className="text-label-sm text-on-surface-variant">Sub-admin access on a separate URL</p>
          </div>
        </div>

        <div className="bg-white border border-primary/15 rounded-xl p-4 mb-6 shadow-sm">
          <p className="text-label-sm font-bold text-primary flex items-center gap-1.5 mb-2">
            <span className="material-symbols-outlined text-[14px]">info</span>
            Default School Administrator Access
          </p>
          <div className="space-y-2 text-label-sm">
            <div className="rounded-lg bg-surface-container px-3 py-2">
              <span className="block text-on-surface-variant">Email</span>
              <span className="block min-w-0 break-all font-mono text-[13px] font-bold text-on-surface sm:text-label-sm">{SUB_ADMIN_EMAIL}</span>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div className="rounded-lg bg-surface-container px-3 py-2">
                <span className="block text-on-surface-variant">Password</span>
                <span className="block min-w-0 break-all font-mono font-bold text-on-surface">{SUB_ADMIN_PASSWORD}</span>
              </div>
              <div className="rounded-lg bg-surface-container px-3 py-2">
                <span className="block text-on-surface-variant">OTP Code</span>
                <span className="block min-w-0 break-all font-mono font-bold text-primary">{SUB_ADMIN_OTP}</span>
              </div>
            </div>
          </div>
        </div>

        {step === 1 ? (
          <div className="bg-white rounded-2xl border border-outline-variant/40 p-6 shadow-sm">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-1">School Administrator Sign In</h2>
            <p className="text-body-md text-on-surface-variant mb-6">Use this separate page for school administrator and sub-admin operations access.</p>
            <form onSubmit={handleCredentials} className="space-y-4">
              <label className="block space-y-1.5">
                <span className="text-label-md text-on-surface-variant font-medium">Email Address</span>
                <input required type="email" defaultValue={SUB_ADMIN_EMAIL} className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
              </label>
              <label className="block space-y-1.5">
                <span className="text-label-md text-on-surface-variant font-medium">Password</span>
                <div className="relative">
                  <input required type={showPassword ? 'text' : 'password'} defaultValue={SUB_ADMIN_PASSWORD} className="w-full px-4 py-3 pr-12 bg-surface-container border border-outline-variant rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary" aria-label="Toggle password visibility">
                    <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </label>
              <button type="submit" className="w-full h-12 bg-primary text-on-primary font-bold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all">
                Continue to OTP
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-outline-variant/40 p-6 shadow-sm">
            <button type="button" onClick={() => setStep(1)} className="inline-flex items-center gap-1 text-primary text-label-md hover:underline mb-6">
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Back to login
            </button>
            <h2 className="font-headline-md text-headline-md text-on-surface mb-1">School Administrator OTP Verification</h2>
            <p className="text-body-md text-on-surface-variant mb-6">Use default OTP <span className="text-primary font-bold">{SUB_ADMIN_OTP}</span> for this frontend demo.</p>
            <form onSubmit={handleOtp} className="space-y-6">
              <div className="grid grid-cols-6 gap-2">
                {SUB_ADMIN_OTP.split('').map((digit, index) => (
                  <input key={`${digit}-${index}`} maxLength={1} type="text" defaultValue={digit} className="h-14 text-center text-headline-md font-bold bg-surface-container border border-outline-variant rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
                ))}
              </div>
              <button type="submit" className="w-full h-12 bg-primary text-on-primary font-bold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all">
                Verify & Open School Admin
              </button>
            </form>
          </div>
        )}
      </section>

      <section className="hidden lg:flex flex-1 bg-gradient-to-br from-[#071d49] to-[#0f766e] flex-col items-center justify-center p-16 text-white relative overflow-hidden">
        <div className="relative z-10 text-center max-w-md">
          <span className="material-symbols-outlined text-[84px] text-white/30 mb-6 block">admin_panel_settings</span>
          <h2 className="font-headline-lg text-headline-lg font-bold mb-4">School operations access with controlled permissions.</h2>
          <p className="text-white/80 text-body-md leading-relaxed">Work: manage school users, classes, attendance, reports, messages, and safety workflows. Access: assigned school environment only. Policy: use approved school data, follow role permissions, and keep administrator credentials private.</p>
        </div>
      </section>
    </main>
  );
}
