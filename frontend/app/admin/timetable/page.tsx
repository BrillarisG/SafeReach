'use client';

import Link from '@/src/next-link';
import { useBackendBootstrap } from '@/lib/backendData';

export default function AdminTimetablePage() {
  const { data, loading, error } = useBackendBootstrap();
  return (
    <div className="p-container-padding-mobile md:p-container-padding-desktop">
      <div className="mb-stack-lg"><h1 className="font-headline-lg text-headline-lg text-primary">Class Timetables</h1><p className="text-on-surface-variant">Choose a class to open its stored timetable.</p></div>
      {loading && <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-28 animate-pulse rounded-2xl bg-surface-container md:h-32" />)}</div>}
      {error && <div className="rounded-xl bg-error-container p-4 text-error font-bold">Backend data unavailable: {error}</div>}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
        {data.classes.map(item => <Link key={item.id} href={`/admin/timetable/class?class=${encodeURIComponent(item.class_name)}&section=${encodeURIComponent(item.sections[0]?.name ?? '')}`} className="class-record-card class-record-font flex min-h-28 flex-col justify-center rounded-2xl border border-outline-variant/70 bg-white p-4 shadow-[3px_4px_0_rgba(117,118,130,0.34)] transition-colors hover:border-primary hover:bg-primary/5 md:min-h-32 md:p-5">
          <h2 className="text-[22px] leading-none text-on-surface md:text-[27px]">{item.class_name}</h2><p className="mt-1 text-[15px] font-bold text-on-surface-variant md:text-[17px]">Section {item.sections[0]?.name ?? '-'}</p>
        </Link>)}
      </div>
    </div>
  );
}
