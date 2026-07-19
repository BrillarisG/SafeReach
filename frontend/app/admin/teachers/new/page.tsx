'use client';

import Link from '@/src/next-link';
import { useMemo, useState } from 'react';
import { useSearchParams } from '@/src/next-navigation';
import { useBackendBootstrap } from '@/lib/backendData';

export default function AdminNewTeacherPage() {
  const searchParams = useSearchParams();
  const className = searchParams?.get('class') ?? '';
  const section = searchParams?.get('section') ?? '';
  const [saved, setSaved] = useState(false);
  const [teacherId, setTeacherId] = useState('');
  const [subject, setSubject] = useState('');
  const { data } = useBackendBootstrap();
  const subjects = useMemo(() => Array.from(new Set(data.timetable.days.flatMap(day => day.periods)
    .map(item => item.trim())
    .filter(item => item && item !== '-' && !/interval|lunch/i.test(item)))).sort(), [data.timetable.days]);

  return (
    <div className="p-gutter">
      <div className="mx-auto mb-stack-lg flex max-w-xl items-center justify-between gap-3">
        <div className="text-center">
          <h1 className="font-headline-lg text-headline-lg text-primary">Add Teacher</h1>
          {className && <p className="text-label-md text-on-surface-variant">Class assignment: {className}{section ? ` - Section ${section}` : ''}</p>}
        </div>
        <Link href={className ? `/admin/students/class-view?class=${encodeURIComponent(className)}&section=${encodeURIComponent(section)}&view=teachers` : '/admin/teachers'} className="inline-flex items-center gap-2 rounded-lg border border-outline-variant px-4 py-2 font-bold text-primary"><span className="material-symbols-outlined text-[18px]">arrow_back</span>Back</Link>
      </div>

      <form onSubmit={event => { event.preventDefault(); setSaved(true); }} className="mx-auto max-w-xl rounded-xl border border-outline-variant/40 bg-white p-stack-lg shadow-sm">
        {saved && <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 font-bold text-green-700">Teacher assignment saved in the frontend demo.</div>}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="space-y-1.5"><span className="font-bold text-label-md">Existing teacher</span><select required value={teacherId} onChange={event => setTeacherId(event.target.value)} className="w-full rounded-lg border border-outline-variant bg-surface-container px-4 py-3"><option value="">Select teacher</option>{data.teachers.map(teacher => <option key={teacher.id} value={teacher.id}>{teacher.full_name} {teacher.subject ? `- ${teacher.subject}` : ''}</option>)}</select></label>
          <label className="space-y-1.5"><span className="font-bold text-label-md">Timetable subject</span><select required value={subject} onChange={event => setSubject(event.target.value)} className="w-full rounded-lg border border-outline-variant bg-surface-container px-4 py-3"><option value="">Select subject</option>{subjects.map(item => <option key={item} value={item}>{item}</option>)}</select></label>
        </div>
        <div className="mt-5 flex justify-center"><button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 font-bold text-on-primary"><span className="material-symbols-outlined text-[18px]">save</span>Save Assignment</button></div>
      </form>
    </div>
  );
}
