'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [role, setRole] = useState('admin');

  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get('role');
    if (value) {
      setRole(value);
    }
  }, []);

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <section className="w-full max-w-lg bg-white rounded-2xl shadow-lg border border-outline-variant/30 p-6">
        <Link href="/" className="inline-flex items-center gap-1 text-primary text-label-md hover:underline mb-6">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to role selection
        </Link>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 bg-primary rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-white">lock_reset</span>
          </div>
          <div>
            <h1 className="font-headline-md text-headline-md text-primary">Forgot Password</h1>
            <p className="text-label-md text-on-surface-variant capitalize">SafeReach {role} password recovery</p>
          </div>
        </div>
        {submitted ? (
          <div className="bg-green-50 border border-green-100 rounded-xl p-5 text-green-800">
            <p className="font-bold flex items-center gap-2 mb-2"><span className="material-symbols-outlined">check_circle</span>Reset request prepared</p>
            <p className="text-body-md capitalize">A reset instruction message is shown here for the {role} frontend demo. When backend authentication is added, this action will send a secure reset email or OTP.</p>
            <Link href="/" className="mt-5 inline-flex bg-primary text-on-primary px-4 py-2 rounded-lg font-bold">Return to login</Link>
          </div>
        ) : (
          <form onSubmit={e => { e.preventDefault(); setSubmitted(true); }} className="space-y-4">
            <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-3">
              <p className="text-label-sm text-on-surface-variant">Selected login role</p>
              <p className="font-bold text-primary capitalize">{role}</p>
            </div>
            <div>
              <label className="text-label-md text-on-surface-variant block mb-1">Registered Email</label>
              <input required type="email" placeholder="name@school.edu" className="w-full bg-surface-container border border-outline-variant rounded-xl px-3 py-3 focus:ring-2 focus:ring-primary outline-none" />
            </div>
            <button type="submit" className="w-full h-12 bg-primary text-on-primary font-bold rounded-xl hover:opacity-90 flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[18px]">send</span>
              Send Reset Instructions
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
