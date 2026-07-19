'use client';

import Link from '@/src/next-link';
import { useMemo, useState } from 'react';
import { useBackendBootstrap } from '@/lib/backendData';
import { downloadTextFile } from '@/lib/downloadFile';

export default function AdminStudentsPage() {
  const { data, loading, error } = useBackendBootstrap();
  const firstClass = data.classes[0];
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [search, setSearch] = useState('');
  const selectedClass = data.classes.find(item => item.id === selectedClassId) ?? firstClass;
  const activeSection = selectedSection || selectedClass?.sections[0]?.name || '';

  const visibleStudents = useMemo(() => data.students.filter(student => {
    const classMatch = !selectedClass || student.class_name === selectedClass.class_name;
    const sectionMatch = !activeSection || student.section_name === activeSection;
    const searchMatch = `${student.full_name} ${student.student_code} ${student.guardian_name}`.toLowerCase().includes(search.toLowerCase());
    return classMatch && sectionMatch && searchMatch;
  }), [activeSection, data.students, search, selectedClass]);

  function downloadTemplate() {
    downloadTextFile(
      'safereach-student-upload-template.csv',
      'student_name,student_id,class_name,section,roll_no,guardian_name,guardian_phone,status\n',
      'text/csv'
    );
  }

  return (
    <div className="p-gutter">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-stack-lg">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-primary">Class Records</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={downloadTemplate} className="flex items-center gap-2 px-4 py-2 border border-outline text-primary font-label-md rounded-lg hover:bg-surface-container-high transition-all">
            <span className="material-symbols-outlined text-[20px]">download</span>Download Template
          </button>
          <Link href="/admin/students/add" className="flex items-center gap-2 px-6 py-2 bg-primary text-on-primary font-label-md rounded-lg hover:opacity-90 transition-all shadow-md">
            <span className="material-symbols-outlined text-[20px]">person_add</span>Add Student
          </Link>
        </div>
      </div>

      {loading && <div className="rounded-xl bg-white border border-outline-variant p-stack-md text-primary font-bold">Loading stored class data...</div>}
      {error && <div className="rounded-xl bg-error-container border border-error/20 p-stack-md text-error font-bold">Backend data unavailable: {error}</div>}

      <section className="grid grid-cols-1 justify-items-start sm:grid-cols-2 xl:grid-cols-3 gap-gutter mb-stack-lg">
        {data.classes.map(item => {
          const classStudents = data.students.filter(student => student.class_name === item.class_name);
          const present = classStudents.filter(student => student.attendance_status === 'present').length;
          const attendance = classStudents.length ? `${Math.round((present / classStudents.length) * 100)}%` : '0%';
          return (
            <Link
              key={item.id}
              href={`/admin/students/class-view?class=${encodeURIComponent(item.class_name)}&section=${encodeURIComponent(item.sections[0]?.name ?? '')}`}
              className="w-full max-w-[260px] min-h-[238px] text-left bg-surface-container-low rounded-[30px] border border-outline-variant/40 px-6 py-5 shadow-sm hover:shadow-md hover:border-primary transition-all"
            >
              <p className="font-headline-lg text-[32px] leading-none text-on-surface">{item.class_name}</p>
              <p className="mt-1 text-[24px] leading-none font-bold text-outline">Section {item.sections[0]?.name ?? '-'}</p>
              <p className="mt-8 text-[22px] leading-none font-bold text-primary-container">Students: {String(classStudents.length).padStart(2, '0')}</p>
              <p className="mt-2 text-[22px] leading-none font-bold text-green-700">SafeReach: {attendance}</p>
            </Link>
          );
        })}
      </section>

      <section className="hidden bg-white rounded-xl border border-outline-variant/40 shadow-sm p-stack-md mb-stack-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="font-headline-md text-headline-md text-on-surface">{selectedClass?.class_name ?? 'Stored Class'} Sections</h3>
            <p className="text-label-md text-on-surface-variant">Choose a stored section to show DB students below.</p>
          </div>
          <div className="relative w-full md:w-80">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input className="w-full pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary text-body-md font-body-md" placeholder="Search stored students..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          {selectedClass?.sections.map(section => (
            <button
              key={section.id}
              type="button"
              onClick={() => setSelectedSection(section.name)}
              className={`px-5 py-3 rounded-lg font-label-md border transition-all ${activeSection === section.name ? 'bg-primary text-on-primary border-primary shadow-sm' : 'bg-surface-container-low text-primary border-outline-variant hover:bg-primary-container hover:text-on-primary-container'}`}
            >
              Section {section.name}
            </button>
          ))}
        </div>
      </section>

      <section className="hidden bg-white rounded-xl border border-outline-variant/40 shadow-sm overflow-hidden">
        <div className="p-stack-md border-b border-outline-variant/30">
          <h3 className="font-headline-md text-headline-md text-primary">{selectedClass?.class_name ?? 'Class'} - Section {activeSection}</h3>
          <p className="text-label-md text-on-surface-variant">{visibleStudents.length} stored students found.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead className="bg-surface-container">
              <tr>{['Roll No', 'Student Name', 'Student ID', 'Status', 'Guardian Contact', 'Actions'].map(header => <th key={header} className="px-4 py-3 text-label-md text-on-surface-variant">{header}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {visibleStudents.map(student => (
                <tr key={student.id}>
                  <td className="px-4 py-4 font-bold text-primary">{student.roll_no}</td>
                  <td className="px-4 py-4">
                    <p className="font-bold text-on-surface">{student.full_name}</p>
                    <p className="text-label-sm text-on-surface-variant">{student.class_name} - {student.section_name}</p>
                  </td>
                  <td className="px-4 py-4 font-bold text-primary">{student.student_code}</td>
                  <td className="px-4 py-4"><span className="status-chip bg-green-100 text-green-700">{statusLabel(student.travel_status)}</span></td>
                  <td className="px-4 py-4"><p className="font-bold">{student.guardian_name}</p><p className="text-label-sm text-on-surface-variant">{student.parent_phone}</p></td>
                  <td className="px-4 py-4"><Link href={`/admin/students/profile?id=${student.id}`} className="inline-flex px-4 py-2 rounded-lg bg-primary/10 text-primary font-bold">Open</Link></td>
                </tr>
              ))}
              {visibleStudents.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-on-surface-variant">No stored students match this class, section, or search.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

