'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface LogoutConfirmButtonProps {
  className: string;
  label?: string;
}

export default function LogoutConfirmButton({ className, label = 'Logout' }: LogoutConfirmButtonProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        <span className="material-symbols-outlined text-[20px]">logout</span>
        <span className="font-label-md text-label-md">{label}</span>
      </button>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4">
          <section className="w-full max-w-sm rounded-xl bg-white p-5 shadow-2xl border border-outline-variant">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-error-container flex items-center justify-center">
                <span className="material-symbols-outlined text-error">logout</span>
              </div>
              <div>
                <h2 className="font-headline-md text-primary">Confirm Logout</h2>
                <p className="text-label-md text-on-surface-variant">Do you want to logout from SafeReach?</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container font-bold">Cancel</button>
              <button type="button" onClick={() => router.push('/')} className="px-4 py-2 rounded-lg bg-error text-on-error font-bold hover:opacity-90">Confirm Logout</button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
