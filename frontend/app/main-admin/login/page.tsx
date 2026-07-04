'use client';

import Link from '@/src/next-link';
import { useRouter } from '@/src/next-navigation';
import { useState } from 'react';
import LogoMark from '@/components/LogoMark';

const MAIN_ADMIN_EMAIL = 'mainadmin@safereach.app';
const MAIN_ADMIN_PASSWORD = 'MainAdmin@2025';
const MAIN_ADMIN_OTP = '123456';

export default function MainAdminLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [showPassword, setShowPassword] = useState(false);

  function handleCredentials(event: React.FormEvent) {
    event.preventDefault();
    setStep(2);
  }

  function handleOtp(event: React.FormEvent) {
    event.preventDefault();
    router.push('/main-admin/dashboard');
  }

  return (
    <main className="min-h-screen bg-background flex">
      <section className="flex-1 flex flex-col justify-center px-6 md:px-12 lg:px-20 py-12 max-w-xl w-full mx-auto lg:mx-0">
        <Link href="/" className="inline-flex items-center gap-1 text-primary text-label-md hover:underline mb-10">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to SafeReach
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <LogoMark className="h-10 w-10 rounded-xl" />
          <div>
            <h1 className="font-headline-md text-headline-md text-primary font-bold leading-tight">SafeReach Main Admin</h1>
            <p className="text-label-sm text-on-surface-variant">App-level owner access only</p>
          </div>
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6">
          <p className="text-label-sm font-bold text-primary flex items-center gap-1.5 mb-2">
            <span className="material-symbols-outlined text-[14px]">info</span>
            Default Main Admin Access
          </p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-label-sm">
            <span className="text-on-surface-variant">Email:</span>
            <span className="font-mono font-bold text-on-surface">{MAIN_ADMIN_EMAIL}</span>
            <span className="text-on-surface-variant">Password:</span>
            <span className="font-mono font-bold text-on-surface">{MAIN_ADMIN_PASSWORD}</span>
            <span className="text-on-surface-variant">OTP Code:</span>
            <span className="font-mono font-bold text-primary">{MAIN_ADMIN_OTP}</span>
          </div>
        </div>

        {step === 1 ? (
          <div>
            <h2 className="font-headline-md text-headline-md text-on-surface mb-1">Main Admin Sign In</h2>
            <p className="text-body-md text-on-surface-variant mb-6">This URL is intentionally separate from the normal school, teacher, and parent login pages.</p>
            <form onSubmit={handleCredentials} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-label-md text-on-surface-variant font-medium" htmlFor="email">Email Address</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[20px]">mail</span>
                  <input id="email" required type="email" defaultValue={MAIN_ADMIN_EMAIL} className="w-full pl-11 pr-4 py-3 bg-surface-container border border-outline-variant rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-body-md" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-label-md text-on-surface-variant font-medium" htmlFor="password">Password</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[20px]">lock</span>
                  <input id="password" required type={showPassword ? 'text' : 'password'} defaultValue={MAIN_ADMIN_PASSWORD} className="w-full pl-11 pr-12 py-3 bg-surface-container border border-outline-variant rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-body-md" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors" aria-label="Toggle password visibility">
                    <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>
              <button type="submit" className="w-full h-12 bg-primary text-on-primary font-bold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-2">
                Continue to OTP
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </form>
          </div>
        ) : (
          <div>
            <button type="button" onClick={() => setStep(1)} className="inline-flex items-center gap-1 text-primary text-label-md hover:underline mb-6">
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Back to login
            </button>
            <h2 className="font-headline-md text-headline-md text-on-surface mb-1">Owner OTP Verification</h2>
            <p className="text-body-md text-on-surface-variant mb-6">Use default OTP <span className="text-primary font-bold">{MAIN_ADMIN_OTP}</span> for this frontend demo.</p>
            <form onSubmit={handleOtp} className="space-y-6">
              <div className="grid grid-cols-6 gap-2">
                {MAIN_ADMIN_OTP.split('').map((digit, index) => (
                  <input key={`${digit}-${index}`} maxLength={1} type="text" defaultValue={digit} className="h-14 text-center text-headline-md font-bold bg-surface-container border border-outline-variant rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                ))}
              </div>
              <button type="submit" className="w-full h-12 bg-primary text-on-primary font-bold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[18px]">verified_user</span>
                Verify & Open Main Admin
              </button>
            </form>
          </div>
        )}
      </section>

      <section className="hidden lg:flex flex-1 bg-primary flex-col items-center justify-center p-16 text-on-primary relative overflow-hidden">
        <div className="relative z-10 text-center max-w-md">
          <span className="material-symbols-outlined text-[84px] text-white/30 mb-6 block">security</span>
          <h2 className="font-headline-lg text-headline-lg font-bold mb-4">App-level school monitoring and privilege control.</h2>
          <p className="text-on-primary/80 text-body-md leading-relaxed">Approve school environments, monitor users across roles, and control add, edit, delete permissions from one owner console.</p>
        </div>
      </section>
    </main>
  );
}

