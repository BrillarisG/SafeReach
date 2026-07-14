'use client';

import { useState } from 'react';
import { useRouter } from '@/src/next-navigation';
import Link from '@/src/next-link';
import LogoMark from '@/components/LogoMark';

export default function AdminLoginPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [showPwd, setShowPwd] = useState(false);
  const router = useRouter();

  function handleCredentials(e: React.FormEvent) {
    e.preventDefault();
    setStep(2);
  }

  function handleOtp(e: React.FormEvent) {
    e.preventDefault();
    router.push('/admin/dashboard');
  }

  return (
    <main className="min-h-screen bg-background flex">

      {/* Left: Form Panel */}
      <div className="flex-1 flex flex-col justify-center px-6 md:px-12 lg:px-20 py-12 max-w-xl w-full mx-auto lg:mx-0">

        {/* Back to roles */}
        <Link href="/" className="inline-flex items-center gap-1 text-primary text-label-md hover:underline mb-10">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to role selection
        </Link>

        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <LogoMark className="h-10 w-10 rounded-xl" />
          <div>
            <h1 className="font-headline-md text-headline-md text-primary font-bold leading-tight">SafeReach</h1>
            <p className="text-label-sm text-on-surface-variant">Administrator Access</p>
          </div>
        </div>

        {/* Demo credentials banner */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6">
          <p className="text-label-sm font-bold text-primary flex items-center gap-1.5 mb-2">
            <span className="material-symbols-outlined text-[14px]">info</span>
            Demo Credentials
          </p>
          <div className="space-y-2 text-label-sm">
            <div className="rounded-lg bg-white px-3 py-2">
              <span className="block text-on-surface-variant">Email</span>
              <span className="block min-w-0 break-all font-mono text-[13px] font-bold text-on-surface sm:text-label-sm">admin@demo.safereach.edu</span>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div className="rounded-lg bg-white px-3 py-2">
                <span className="block text-on-surface-variant">Password</span>
                <span className="block min-w-0 break-all font-mono font-bold text-on-surface">Admin@2025</span>
              </div>
              <div className="rounded-lg bg-white px-3 py-2">
                <span className="block text-on-surface-variant">OTP Code</span>
                <span className="block min-w-0 break-all font-mono font-bold text-primary">000000</span>
              </div>
            </div>
          </div>
        </div>

        {/* Step 1: Credentials */}
        {step === 1 && (
          <div>
            <h2 className="font-headline-md text-headline-md text-on-surface mb-1">Sign In</h2>
            <p className="text-body-md text-on-surface-variant mb-6">Enter your administrative credentials to continue.</p>
            <form onSubmit={handleCredentials} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-label-md text-on-surface-variant font-medium" htmlFor="email">Email Address</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[20px]">mail</span>
                  <input id="email" required type="email" defaultValue="admin@demo.safereach.edu" className="w-full pl-11 pr-4 py-3 bg-surface-container border border-outline-variant rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-body-md" placeholder="admin@school.edu" />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-label-md text-on-surface-variant font-medium" htmlFor="password">Password</label>
                  <Link href="/login/forgot-password?role=admin" className="text-label-sm text-primary hover:underline">Forgot password?</Link>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[20px]">lock</span>
                  <input id="password" required type={showPwd ? 'text' : 'password'} defaultValue="Admin@2025" className="w-full pl-11 pr-12 py-3 bg-surface-container border border-outline-variant rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-body-md" placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-[20px]">{showPwd ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input id="remember" type="checkbox" className="w-4 h-4 rounded text-primary border-outline-variant focus:ring-primary" />
                <label htmlFor="remember" className="text-label-md text-on-surface-variant cursor-pointer">Keep me signed in for 30 days</label>
              </div>
              <button type="submit" className="w-full h-12 bg-primary text-on-primary font-bold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-2 mt-2">
                Continue to Verification
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </form>
          </div>
        )}

        {/* Step 2: OTP */}
        {step === 2 && (
          <div>
            <button onClick={() => setStep(1)} className="inline-flex items-center gap-1 text-primary text-label-md hover:underline mb-6">
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Back to login
            </button>
            <h2 className="font-headline-md text-headline-md text-on-surface mb-1">Two-Step Verification</h2>
            <p className="text-body-md text-on-surface-variant mb-6">Enter the 6-digit code sent to your registered device.<br /><span className="text-primary font-bold">Demo OTP: 000000</span></p>
            <form onSubmit={handleOtp} className="space-y-6">
              <div className="flex justify-between gap-2">
                {[0,1,2,3,4,5].map(i => (
                  <input key={i} maxLength={1} type="text" defaultValue="0" className="w-12 h-14 text-center text-headline-md font-bold bg-surface-container border border-outline-variant rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                ))}
              </div>
              <p className="text-center text-label-md text-on-surface-variant">
                Didn&apos;t receive the code?{' '}
                <button type="button" className="text-primary font-bold hover:underline">Resend (45s)</button>
              </p>
              <button type="submit" className="w-full h-12 bg-primary text-on-primary font-bold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[18px]" style={{fontVariationSettings: "'FILL' 1"}}>verified_user</span>
                Verify &amp; Sign In
              </button>
            </form>
          </div>
        )}

        <p className="mt-8 text-center text-label-sm text-on-surface-variant flex items-center justify-center gap-1">
          <span className="material-symbols-outlined text-[14px]">lock</span>
          Protected by AES-256 end-to-end encryption
        </p>
      </div>

      {/* Right: Brand panel (desktop only) */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary to-primary-container flex-col items-center justify-center p-16 text-on-primary relative overflow-hidden">
        <div className="relative z-10 text-center max-w-md">
          <span className="material-symbols-outlined text-[80px] text-white/30 mb-6 block" style={{fontVariationSettings: "'FILL' 1"}}>shield_person</span>
          <h2 className="font-headline-lg text-headline-lg font-bold mb-4">School operations access with controlled permissions.</h2>
          <p className="text-on-primary/80 text-body-md leading-relaxed">Work: manage school users, classes, attendance, reports, messages, and safety workflows. Access: assigned school environment only. Policy: use approved school data, follow role permissions, and keep administrator credentials private.</p>
          <div className="grid grid-cols-3 gap-4 mt-10">
            {[['2,400+', 'Students Tracked'], ['99.9%', 'System Uptime'], ['15s', 'Alert Response']].map(([val, label]) => (
              <div key={label} className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <p className="font-bold text-headline-md">{val}</p>
                <p className="text-on-primary/70 text-label-sm">{label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute top-10 -left-10 w-60 h-60 bg-white/5 rounded-full blur-3xl"></div>
      </div>

    </main>
  );
}

