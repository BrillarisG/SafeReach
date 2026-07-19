'use client';

import Link from '@/src/next-link';
import { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from '@/src/next-navigation';
import { useBackendBootstrap } from '@/lib/backendData';
import LoadingRing from '@/components/LoadingRing';

function nextClassName(className: string, direction: 1 | -1) {
  const match = className.match(/(\d+)/);
  if (!match) return className;
  const next = Math.max(1, Number(match[1]) + direction);
  return className.replace(match[1], String(next));
}

function EditClassContent() {
  const params = useSearchParams();
  const mode = params?.get('mode') ?? 'edit';
  const sourceClass = params?.get('class') ?? 'Class 4';
  const sourceSection = params?.get('section') ?? 'B';
  const { data, loading, error } = useBackendBootstrap();
  const [className, setClassName] = useState(sourceClass);
  const [sectionName, setSectionName] = useState(sourceSection);
  const [selected, setSelected] = useState<string[]>([]);
  const [notice, setNotice] = useState('');

  const classStudents = useMemo(() => data.students.filter(student => student.class_name === sourceClass && student.section_name === sourceSection), [data.students, sourceClass, sourceSection]);
  const allSelected = classStudents.length > 0 && selected.length === classStudents.length;

  function toggleAll() {
    setSelected(allSelected ? [] : classStudents.map(student => student.id));
  }

  function moveStudents(direction: 1 | -1) {
    if (selected.length === 0) {
      setNotice('Select at least one student before running upgrade or downgrade.');
      return;
    }
    const targetClass = nextClassName(sourceClass, direction);
    setNotice(`${selected.length} selected student${selected.length === 1 ? '' : 's'} prepared to move from ${sourceClass}-${sourceSection} to ${targetClass}-${sourceSection}. Backend write will update only student class fields; student profiles stay intact.`);
  }

  function deleteClass() {
    if (window.confirm(`Delete ${sourceClass} Section ${sourceSection}? Student records will remain, and their class fields will be cleared.`)) {
      setNotice(`${sourceClass} Section ${sourceSection} marked for delete. Student rows remain stored; only class/section links are cleared in the planned backend write.`);
    }
  }

  return (
    <div className="p-gutter">
      <div className="mx-auto max-w-5xl">
        <nav className="mb-4 flex items-center gap-1.5 text-[13px] text-on-surface-variant">
          <Link href="/admin/dashboard" className="hover:text-primary">Dashboard</Link>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="font-bold text-primary">{mode === 'new' ? 'Add Class' : `${sourceClass} - Section ${sourceSection}`}</span>
        </nav>

        {(loading || error || notice) && (
          <div className="mb-4 space-y-2">
            {loading && <LoadingRing size="md" />}
            {error && <div className="rounded-xl border border-error/20 bg-error-container px-4 py-3 font-bold text-error">Backend data unavailable: {error}</div>}
            {notice && <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 font-bold text-primary">{notice}</div>}
          </div>
        )}

        <section className="safe-surface-enter w-full min-w-0 max-w-full overflow-hidden rounded-xl border border-outline-variant/40 bg-white p-stack-lg shadow-sm">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-headline-lg font-bold text-primary">{mode === 'new' ? 'Add Class' : 'Edit Class'}</h1>
            </div>
            <Link href="/admin/dashboard" title="Back to dashboard" aria-label="Back to dashboard" className="group relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-outline-variant bg-white text-primary transition hover:bg-primary/5 focus-visible:z-50">
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
              <span role="tooltip" className="safe-tooltip pointer-events-none absolute bottom-full right-0 mb-2 whitespace-nowrap rounded-md border border-outline-variant bg-white px-2 py-1 text-xs font-bold text-on-surface shadow-md opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">Back</span>
            </Link>
          </div>

          <form onSubmit={event => { event.preventDefault(); setNotice(`${className} Section ${sectionName} saved in frontend demo. Backend write will create or update the stored class record.`); }} className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
            <label className="min-w-0 space-y-1.5">
              <span className="text-label-md font-bold text-on-surface-variant">Class</span>
              <input value={className} onChange={event => setClassName(event.target.value)} className="w-full rounded-lg border border-outline-variant bg-surface-container px-4 py-3" />
            </label>
            <label className="min-w-0 space-y-1.5">
              <span className="text-label-md font-bold text-on-surface-variant">Section</span>
              <input value={sectionName} onChange={event => setSectionName(event.target.value.toUpperCase())} className="w-full rounded-lg border border-outline-variant bg-surface-container px-4 py-3" />
            </label>
            <button type="submit" title="Save class" aria-label="Save class" className="group relative inline-flex h-12 w-12 items-center justify-center gap-2 rounded-lg bg-primary font-bold text-on-primary focus-visible:z-50 sm:w-auto sm:px-5">
              <span className="material-symbols-outlined text-[20px]">save</span>
              <span className="hidden sm:inline">Save</span>
              <span role="tooltip" className="safe-tooltip pointer-events-none absolute bottom-full right-0 mb-2 whitespace-nowrap rounded-md border border-outline-variant bg-white px-2 py-1 text-xs font-bold text-on-surface shadow-md opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">Save Class</span>
            </button>
          </form>

          {mode !== 'new' && (
            <div className="mt-6 min-w-0 rounded-xl border border-outline-variant/40 bg-surface-container-low p-stack-md">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-headline-md font-bold text-primary">Upgrade / Downgrade Students</h2>
                  <p className="max-w-full text-label-md text-on-surface-variant">Students are moved by class field only; profiles and IDs remain stored.</p>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => moveStudents(1)} title="Upgrade selected students" aria-label="Upgrade selected students" className="group relative inline-flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-on-secondary focus-visible:z-50">
                    <span className="material-symbols-outlined text-[20px]">upgrade</span>
                    <span role="tooltip" className="safe-tooltip pointer-events-none absolute bottom-full right-0 mb-2 whitespace-nowrap rounded-md border border-outline-variant bg-white px-2 py-1 text-xs font-bold text-on-surface shadow-md opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">Upgrade</span>
                  </button>
                  <button type="button" onClick={() => moveStudents(-1)} title="Downgrade selected students" aria-label="Downgrade selected students" className="group relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-outline-variant bg-white text-primary focus-visible:z-50">
                    <span className="material-symbols-outlined text-[20px]">download</span>
                    <span role="tooltip" className="safe-tooltip pointer-events-none absolute bottom-full right-0 mb-2 whitespace-nowrap rounded-md border border-outline-variant bg-white px-2 py-1 text-xs font-bold text-on-surface shadow-md opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">Downgrade</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto rounded-lg border border-outline-variant/40 bg-white">
                <table className="w-full min-w-[560px] text-left">
                  <thead className="bg-surface-container">
                    <tr>
                      <th className="px-4 py-3"><input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Select all students" /></th>
                      <th className="px-4 py-3 text-label-md text-on-surface-variant">Student</th>
                      <th className="px-4 py-3 text-label-md text-on-surface-variant">Student ID</th>
                      <th className="px-4 py-3 text-label-md text-on-surface-variant">Current Class</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/30">
                    {classStudents.map(student => (
                      <tr key={student.id}>
                        <td className="px-4 py-3"><input type="checkbox" checked={selected.includes(student.id)} onChange={() => setSelected(current => current.includes(student.id) ? current.filter(id => id !== student.id) : [...current, student.id])} aria-label={`Select ${student.full_name}`} /></td>
                        <td className="px-4 py-3 font-bold">{student.full_name}</td>
                        <td className="px-4 py-3 text-primary font-bold">{student.student_code}</td>
                        <td className="px-4 py-3">{student.class_name} - {student.section_name}</td>
                      </tr>
                    ))}
                    {classStudents.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-on-surface-variant">No students are currently linked to this class section.</td></tr>}
                  </tbody>
                </table>
              </div>

              <div className="mt-5 flex justify-end">
                <button type="button" onClick={deleteClass} title="Delete class" aria-label="Delete class" className="group relative inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-error/30 px-4 font-bold text-error hover:bg-error/5 focus-visible:z-50">
                  <span className="material-symbols-outlined text-[20px]">delete</span>
                  <span className="hidden sm:inline">Delete Class</span>
                  <span role="tooltip" className="safe-tooltip pointer-events-none absolute bottom-full right-0 mb-2 whitespace-nowrap rounded-md border border-outline-variant bg-white px-2 py-1 text-xs font-bold text-on-surface shadow-md opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">Delete Class</span>
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default function AdminEditClassPage() {
  return (
    <Suspense fallback={<LoadingRing size="lg" />}>
      <EditClassContent />
    </Suspense>
  );
}
