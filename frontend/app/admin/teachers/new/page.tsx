'use client';

import Link from '@/src/next-link';
import { useState } from 'react';
import { useSearchParams } from '@/src/next-navigation';

export default function AdminNewTeacherPage() {
  const searchParams = useSearchParams();
  const className = searchParams?.get('class') ?? '';
  const section = searchParams?.get('section') ?? '';
  const [saved, setSaved] = useState(false);

  return (
    <div className="p-gutter max-w-3xl">
      <div className="mb-stack-lg flex items-center justify-between gap-3">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-primary">Add Teacher</h1>
          {className && <p className="text-label-md text-on-surface-variant">Class assignment: {className}{section ? ` - Section ${section}` : ''}</p>}
        </div>
        <Link href={className ? `/admin/students/class-view?class=${encodeURIComponent(className)}&section=${encodeURIComponent(section)}&view=teachers` : '/admin/teachers'} className="inline-flex items-center gap-2 rounded-lg border border-outline-variant px-4 py-2 font-bold text-primary"><span className="material-symbols-outlined text-[18px]">arrow_back</span>Back</Link>
      </div>

      <form onSubmit={event => { event.preventDefault(); setSaved(true); }} className="rounded-xl border border-outline-variant/40 bg-white p-stack-lg shadow-sm">
        {saved && <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 font-bold text-green-700">Teacher details saved in the frontend demo.</div>}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="space-y-1.5"><span className="font-bold text-label-md">Teacher name</span><input required className="w-full rounded-lg border border-outline-variant bg-surface-container px-4 py-3" placeholder="Full name" /></label>
          <label className="space-y-1.5"><span className="font-bold text-label-md">Email address</span><input required type="email" className="w-full rounded-lg border border-outline-variant bg-surface-container px-4 py-3" placeholder="teacher@school.edu" /></label>
          <label className="space-y-1.5"><span className="font-bold text-label-md">Phone number</span><input required className="w-full rounded-lg border border-outline-variant bg-surface-container px-4 py-3" placeholder="Phone number" /></label>
          <label className="space-y-1.5"><span className="font-bold text-label-md">Subject</span><input required className="w-full rounded-lg border border-outline-variant bg-surface-container px-4 py-3" placeholder="Subject" /></label>
        </div>
        <div className="mt-5 flex justify-end"><button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 font-bold text-on-primary"><span className="material-symbols-outlined text-[18px]">save</span>Save Teacher</button></div>
      </form>
    </div>
  );
}
