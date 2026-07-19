'use client';

import Link from '@/src/next-link';
import { useSearchParams } from '@/src/next-navigation';
import TimetableManager from '@/components/TimetableManager';

export default function AdminClassTimetablePage() {
  const searchParams = useSearchParams();
  const className = searchParams?.get('class') ?? '';
  const section = searchParams?.get('section') ?? '';
  return <div><div className="px-container-padding-mobile pt-container-padding-mobile md:px-container-padding-desktop"><Link href="/admin/timetable" className="inline-flex items-center gap-2 text-primary font-bold"><span className="material-symbols-outlined text-[18px]">arrow_back</span>Class Timetables</Link></div><TimetableManager mode="admin" requestedClassName={className} requestedSection={section} /></div>;
}
