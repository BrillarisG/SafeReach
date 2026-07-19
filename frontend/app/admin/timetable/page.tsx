'use client';

import Link from '@/src/next-link';
import { useBackendBootstrap } from '@/lib/backendData';

export default function AdminTimetablePage() {
  const { data, loading, error } = useBackendBootstrap();
  return (
    <div className="p-container-padding-mobile md:p-container-padding-desktop">
      <div className="mb-stack-lg"><h1 className="font-headline-lg text-headline-lg text-primary">Class Timetables</h1><p className="text-on-surface-variant">Choose a class to open its stored timetable.</p></div>
      {loading && <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-32 animate-pulse rounded-xl bg-surface-container" />)}</div>}
      {error && <div className="rounded-xl bg-error-container p-4 text-error font-bold">Backend data unavailable: {error}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {data.classes.map(item => <Link key={item.id} href={`/admin/timetable/class?class=${encodeURIComponent(item.class_name)}&section=${encodeURIComponent(item.sections[0]?.name ?? '')}`} className="rounded-xl border border-outline-variant/50 bg-white p-stack-md shadow-sm transition-colors hover:border-primary hover:bg-primary/5">
          <span className="material-symbols-outlined text-primary">calendar_month</span><h2 className="mt-3 font-headline-md text-primary">{item.class_name}</h2><p className="text-label-md text-on-surface-variant">Section {item.sections[0]?.name ?? '-'} | Open timetable</p>
        </Link>)}
      </div>
    </div>
  );
}
