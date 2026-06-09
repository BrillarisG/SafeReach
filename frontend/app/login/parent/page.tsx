'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';

export default function ParentLoginPage() {
  const [showPwd, setShowPwd] = useState(false);
  const router = useRouter();

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    router.push('/parent/dashboard');
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Back */}
        <Link href="/" className="inline-flex items-center gap-1 text-[#4b1c00] text-label-md hover:underline mb-8">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to role selection
        </Link>

        <div className="bg-white rounded-2xl shadow-lg border border-outline-variant/20 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#4b1c00] to-[#92400e] p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-[22px]">family_restroom</span>
              </div>
              <div>
                <h1 className="font-headline-md text-headline-md font-bold">Parent Portal</h1>
                <p className="text-white/80 text-label-sm">SafeReach</p>
              </div>
            </div>
            <p className="text-white/80 text-body-md">Track your children in real-time and stay connected with their school.</p>
          </div>

          <div className="p-6">
            {/* Demo credentials */}
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
              <p className="text-label-sm font-bold text-orange-800 flex items-center gap-1.5 mb-2">
                <span className="material-symbols-outlined text-[14px]">info</span>
                Demo Credentials
              </p>
              <div className="space-y-1 text-label-sm">
                <div className="flex justify-between">
                  <span className="text-orange-700">Email</span>
                  <span className="font-mono font-bold text-orange-900">parent@demo.safereach.edu</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-orange-700">Password</span>
                  <span className="font-mono font-bold text-orange-900">Parent@2025</span>
                </div>
              </div>
            </div>

            <h2 className="font-headline-md text-on-surface mb-4">Sign In</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-label-md text-on-surface-variant font-medium" htmlFor="email">Email Address</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[20px]">mail</span>
                  <input id="email" required type="email" defaultValue="parent@demo.safereach.edu" className="w-full pl-11 pr-4 py-3 bg-surface-container border border-outline-variant rounded-xl focus:ring-1 outline-none text-body-md" style={{borderColor: 'rgb(180 83 9 / 0.4)'}} />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <label className="text-label-md text-on-surface-variant font-medium" htmlFor="password">Password</label>
                  <Link href="/login/forgot-password?role=parent" className="text-label-sm text-[#92400e] hover:underline">Forgot?</Link>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[20px]">lock</span>
                  <input id="password" required type={showPwd ? 'text' : 'password'} defaultValue="Parent@2025" className="w-full pl-11 pr-12 py-3 bg-surface-container border border-outline-variant rounded-xl focus:ring-1 outline-none text-body-md" />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-outline">
                    <span className="material-symbols-outlined text-[20px]">{showPwd ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input id="remember" type="checkbox" className="w-4 h-4 rounded border-outline-variant" />
                <label htmlFor="remember" className="text-label-md text-on-surface-variant cursor-pointer">Remember me</label>
              </div>
              <button type="submit" className="w-full h-12 bg-gradient-to-r from-[#4b1c00] to-[#92400e] text-white font-bold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-2">
                Sign Into Parent Portal
                <span className="material-symbols-outlined text-[18px]">login</span>
              </button>
            </form>

            {/* Child safety reminder */}
            <div className="mt-4 flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl">
              <span className="material-symbols-outlined text-amber-600 text-[18px] mt-0.5">child_care</span>
              <p className="text-label-sm text-amber-800">Your children&apos;s safety is our priority. Real-time tracking is active 24/7 during school hours.</p>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-label-sm text-on-surface-variant flex items-center justify-center gap-1">
          <span className="material-symbols-outlined text-[14px]">lock</span>
          Secure · Encrypted · COPPA Compliant
        </p>
      </div>
    </main>
  );
}
