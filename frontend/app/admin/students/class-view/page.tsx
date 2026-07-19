'use client';

import Link from '@/src/next-link';
import { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from '@/src/next-navigation';

type Panel = 'overview' | 'teachers' | 'students';

const students = [
  { name: 'Sarah Jenkins', id: 'ST-2025-001', className: 'Class 5', section: 'B', roll: '05', status: 'At School', guardian: 'Robert Jenkins', phone: '+1 (555) 0123-456', last: 'Arrived at 07:45 AM' },
  { name: 'Marcus Thorne', id: 'ST-2025-042', className: 'Class 3', section: 'A', roll: '14', status: 'In Class', guardian: 'Elena Thorne', phone: '+1 (555) 0987-654', last: 'Class check-in 09:00 AM' },
  { name: 'Leo Martinez', id: 'ST-2025-118', className: 'Class 4', section: 'C', roll: '22', status: 'Absent', guardian: 'Maria Martinez', phone: '+1 (555) 1122-334', last: 'No check-in recorded today' },
  { name: 'Chloe Zhao', id: 'ST-2025-089', className: 'Class 2', section: 'A', roll: '08', status: 'At School', guardian: 'David Zhao', phone: '+1 (555) 4455-667', last: 'Library entry 10:15 AM' },
  { name: 'Aarav Mehta', id: 'ST-2025-204', className: 'Class 4', section: 'B', roll: '11', status: 'At School', guardian: 'Neha Mehta', phone: '+1 (555) 7100-218', last: 'Science Lab 10:00 AM' },
  { name: 'Diya Mehta', id: 'ST-2025-251', className: 'Class 5', section: 'C', roll: '18', status: 'In Class', guardian: 'Neha Mehta', phone: '+1 (555) 7100-218', last: 'English class 09:00 AM' },
  { name: 'Priya Nair', id: 'ST-2025-311', className: 'Class 6', section: 'A', roll: '04', status: 'At School', guardian: 'Vikram Nair', phone: '+1 (555) 2001-918', last: 'Morning attendance submitted' },
];

const teacherSeed = [
  { id: 't-1', name: 'David Ng', role: 'Class Incharge', subject: 'Mathematics', phone: '+91 98765 43210', email: 'david.ng@safereach.school' },
  { id: 't-2', name: 'Elena Smith', role: 'Assistant Incharge', subject: 'Science', phone: '+91 98765 43211', email: 'elena.smith@safereach.school' },
  { id: 't-3', name: 'Clara White', role: 'Subject Teacher', subject: 'English', phone: '+91 98765 43212', email: 'clara.white@safereach.school' },
];

const statusStyle: Record<string, string> = {
  'At School': 'bg-green-100 text-green-700',
  'In Class': 'bg-blue-100 text-blue-700',
  Absent: 'bg-red-100 text-red-700',
};

function ClassViewContent() {
  const params = useSearchParams();
  const className = params?.get('class') || 'Class 4';
  const section = params?.get('section') || 'B';
  const initialView = (params?.get('view') as Panel | null) || 'overview';
  const [panel, setPanel] = useState<Panel>(initialView);
  const [search, setSearch] = useState('');

  const visibleStudents = useMemo(() => students.filter(student => {
    const classMatch = student.className === className && student.section === section;
    const searchMatch = `${student.name} ${student.id} ${student.guardian} ${student.phone}`.toLowerCase().includes(search.toLowerCase());
    return classMatch && searchMatch;
  }), [className, search, section]);

  return (
    <div className="p-gutter">
      <nav className="flex flex-wrap items-center gap-2 text-label-md text-on-surface-variant mb-stack-lg">
        <Link href="/admin/students" className="hover:text-primary">Class Records</Link>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <span className="text-primary font-bold">{className} - Section {section}</span>
      </nav>

      <div className="mb-stack-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-primary">{className} - Section {section}</h1>
        </div>
        <Link href="/admin/students" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-outline-variant text-primary font-bold hover:bg-primary/5">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Classes
        </Link>
      </div>

      <div className="grid max-w-xl grid-cols-2 gap-3 mb-stack-lg">
        <button onClick={() => setPanel('teachers')} className={`aspect-square text-center rounded-2xl border bg-white p-4 shadow-sm hover:shadow-md transition-all ${panel === 'teachers' ? 'border-primary ring-2 ring-primary/20' : 'border-outline-variant/40'}`}>
          <span className="material-symbols-outlined text-[58px] text-primary">co_present</span>
          <span className="mt-4 block font-headline-md text-headline-md text-on-surface">Teacher</span>
        </button>
        <button onClick={() => setPanel('students')} className={`aspect-square text-center rounded-2xl border bg-white p-4 shadow-sm hover:shadow-md transition-all ${panel === 'students' ? 'border-primary ring-2 ring-primary/20' : 'border-outline-variant/40'}`}>
          <span className="material-symbols-outlined text-[58px] text-primary">groups</span>
          <span className="mt-4 block font-headline-md text-headline-md text-on-surface">Students</span>
        </button>
      </div>

      {panel === 'overview' && (
        <div className="rounded-xl border border-outline-variant/40 bg-white p-stack-md text-on-surface-variant">
          Select Teacher or Students above.
        </div>
      )}

      {panel === 'teachers' && (
        <section className="glass-card rounded-xl overflow-hidden">
          <div className="p-stack-md border-b border-outline-variant flex items-center justify-between gap-3">
            <h2 className="font-headline-md text-headline-md text-primary">Class Teachers</h2>
            <Link href={`/admin/teachers/new?class=${encodeURIComponent(className)}&section=${encodeURIComponent(section)}`} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-on-primary font-bold"><span className="material-symbols-outlined text-[18px]">person_add</span>Add Teacher</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-stack-md">
            {teachers.map(teacher => (
              <div key={teacher.id} className="rounded-xl border border-outline-variant/50 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-primary">{teacher.name}</p>
                    <p className="text-label-sm text-on-surface-variant">{teacher.role}</p>
                  </div>
                  <span className="status-chip bg-primary/10 text-primary">{teacher.subject}</span>
                </div>
                <p className="mt-3 text-label-md text-on-surface-variant">{teacher.email}</p>
                <p className="text-label-md text-on-surface-variant">{teacher.phone}</p>
                <Link href={`/admin/teachers/profile?id=${teacher.id}&mode=edit`} className="mt-4 inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 text-primary font-bold">
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                  Edit Subject
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {panel === 'students' && (
        <section className="glass-card rounded-xl overflow-hidden">
          <div className="p-stack-md border-b border-outline-variant flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
            <div>
              <h2 className="font-headline-md text-headline-md text-primary">Class Students</h2>
              <p className="text-label-md text-on-surface-variant">Open a student profile to edit, delete, review safety details, and use admin actions.</p>
            </div>
            <label className="relative w-full lg:w-80">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
              <input value={search} onChange={event => setSearch(event.target.value)} className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary outline-none" placeholder="Search students..." />
            </label>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left border-collapse">
              <thead className="bg-surface-container-high text-on-surface-variant font-label-md text-label-md">
                <tr>{['S No', 'Student Name', 'Student ID', 'Action'].map(h => <th key={h} className={`px-6 py-4 font-bold ${h === 'Action' ? 'text-right' : ''}`}>{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                {visibleStudents.map(student => (
                  <tr key={student.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-6 py-4 font-bold text-primary">{student.roll}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-primary font-bold">{student.name.split(' ').map(part => part[0]).join('').slice(0, 2)}</div>
                        <div><p className="font-bold text-on-surface">{student.name}</p><p className="text-xs text-on-surface-variant">{student.className} - {student.section}</p></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-label-md text-on-surface-variant">{student.id}</td>
                    <td className="px-6 py-4 text-right">
                      <Link href="/admin/students/profile" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-on-primary font-bold hover:opacity-90">
                        <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
                {visibleStudents.length === 0 && <tr><td colSpan={4} className="px-6 py-10 text-center text-on-surface-variant">No student records found for this class-section.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

export default function AdminStudentClassViewPage() {
  return (
    <Suspense fallback={<div className="p-gutter text-on-surface-variant">Loading class records...</div>}>
      <ClassViewContent />
    </Suspense>
  );
}

