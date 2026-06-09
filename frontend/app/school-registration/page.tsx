'use client';

import Link from 'next/link';
import { useState } from 'react';

type SchoolRequest = {
  id: string;
  schoolName: string;
  board: string;
  city: string;
  address: string;
  adminName: string;
  email: string;
  phone: string;
  password: string;
  status: 'Pending' | 'Accepted' | 'Rejected';
  requestedAt: string;
};

const REQUEST_KEY = 'safereach_school_requests';

function readRequests(): SchoolRequest[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(window.localStorage.getItem(REQUEST_KEY) ?? '[]') as SchoolRequest[];
  } catch {
    return [];
  }
}

export default function SchoolRegistrationPage() {
  const [submitted, setSubmitted] = useState<SchoolRequest | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const request: SchoolRequest = {
      id: `REQ-${Date.now().toString().slice(-6)}`,
      schoolName: String(form.get('schoolName') ?? ''),
      board: String(form.get('board') ?? ''),
      city: String(form.get('city') ?? ''),
      address: String(form.get('address') ?? ''),
      adminName: String(form.get('adminName') ?? ''),
      email: String(form.get('email') ?? ''),
      phone: String(form.get('phone') ?? ''),
      password: String(form.get('password') ?? ''),
      status: 'Pending',
      requestedAt: new Date().toLocaleString(),
    };
    window.localStorage.setItem(REQUEST_KEY, JSON.stringify([request, ...readRequests()]));
    setSubmitted(request);
    event.currentTarget.reset();
  }

  return (
    <main className="min-h-screen bg-background p-container-padding-mobile md:p-container-padding-desktop">
      <div className="max-w-5xl mx-auto">
        <div className="mb-stack-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Link href="/main-admin/login" className="inline-flex items-center gap-1 text-primary text-label-md hover:underline mb-4">
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Main admin access
            </Link>
            <h1 className="font-headline-lg text-headline-lg text-primary">School Environment Registration</h1>
            <p className="text-body-md text-on-surface-variant">School admins can request a SafeReach school workspace using this separate frontend URL.</p>
          </div>
          <span className="status-chip bg-primary/10 text-primary">Frontend request demo</span>
        </div>

        {submitted && (
          <div className="mb-stack-lg rounded-xl border border-green-200 bg-green-50 p-stack-md">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-green-700">task_alt</span>
              <div>
                <p className="font-bold text-green-700">Request submitted to main admin</p>
                <p className="text-label-md text-on-surface-variant">Request ID {submitted.id} is now visible in the main-admin approvals panel. When accepted, the SMS preview will include {submitted.email} and the entered password.</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-outline-variant/50 shadow-sm overflow-hidden">
          <div className="p-stack-md border-b border-outline-variant/40">
            <h2 className="font-headline-md text-headline-md text-on-surface">School Details</h2>
            <p className="text-label-md text-on-surface-variant">These details create the pending school environment request for app-level approval.</p>
          </div>
          <div className="p-stack-md grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="space-y-1.5">
              <span className="text-label-md text-on-surface-variant font-medium">School Name</span>
              <input name="schoolName" required className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="Green Valley Public School" />
            </label>
            <label className="space-y-1.5">
              <span className="text-label-md text-on-surface-variant font-medium">Board / Curriculum</span>
              <select name="board" required className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none">
                <option value="">Select board</option>
                <option>CBSE</option>
                <option>ICSE</option>
                <option>State Board</option>
                <option>International</option>
              </select>
            </label>
            <label className="space-y-1.5">
              <span className="text-label-md text-on-surface-variant font-medium">City</span>
              <input name="city" required className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="Chennai" />
            </label>
            <label className="space-y-1.5">
              <span className="text-label-md text-on-surface-variant font-medium">School Address</span>
              <input name="address" required className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="Campus address" />
            </label>
          </div>

          <div className="p-stack-md border-t border-outline-variant/40">
            <h2 className="font-headline-md text-headline-md text-on-surface">School Admin Details</h2>
            <p className="text-label-md text-on-surface-variant">The password entered here is the same demo password shown in the acceptance SMS preview.</p>
          </div>
          <div className="p-stack-md pt-0 grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="space-y-1.5">
              <span className="text-label-md text-on-surface-variant font-medium">Admin Full Name</span>
              <input name="adminName" required className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="Priya Raman" />
            </label>
            <label className="space-y-1.5">
              <span className="text-label-md text-on-surface-variant font-medium">Admin Email</span>
              <input name="email" required type="email" className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="admin@school.edu" />
            </label>
            <label className="space-y-1.5">
              <span className="text-label-md text-on-surface-variant font-medium">Mobile Number</span>
              <input name="phone" required className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="+91 98765 43210" />
            </label>
            <label className="space-y-1.5">
              <span className="text-label-md text-on-surface-variant font-medium">Requested Login Password</span>
              <input name="password" required type="password" minLength={8} className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="Minimum 8 characters" />
            </label>
          </div>
          <div className="p-stack-md border-t border-outline-variant/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-low">
            <p className="text-label-md text-on-surface-variant">No backend is created here. Requests are stored locally for frontend demonstration.</p>
            <button type="submit" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-lg font-bold hover:opacity-90">
              <span className="material-symbols-outlined text-[20px]">send</span>
              Request School Environment
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
