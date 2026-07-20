'use client';

import { Fragment, useEffect, useMemo, useState, type PointerEvent } from 'react';
import Link from '@/src/next-link';
import { type TimetableBreak, type TimetableData } from '@/lib/timetable';
import { useBackendBootstrap } from '@/lib/backendData';
import LoadingRing from '@/components/LoadingRing';

const emptyTimetable: TimetableData = {
  className: '',
  section: '',
  breakAfterPeriod2: '',
  lunchAfterPeriod4: '',
  breakAfterPeriod6: '',
  breaks: [],
  days: [],
};

const TEACHER_ASSIGNMENT_KEY = 'safereach_timetable_subject_teacher_assignments';
const teacherOptions = [
  'Mr. James Anderson',
  'Ms. Anita Roy',
  'Mrs. Sarah Jenkins',
  'Mr. David Lee',
  'Counselor Deepa',
  'Dr. Meera Patel',
];

export default function TimetableManager({ mode, editMode = false, requestedClassName = '', requestedSection = '' }: { mode: 'admin' | 'teacher' | 'parent'; editMode?: boolean; requestedClassName?: string; requestedSection?: string }) {
  const canEdit = mode !== 'parent';
  const editable = canEdit && editMode;
  const editHref = mode === 'admin' ? '/admin/timetable/edit' : '/teacher/timetable/edit';
  const viewHref = mode === 'admin' ? '/admin/timetable' : '/teacher/timetable';
  const { data: bootstrap, loading, error } = useBackendBootstrap();
  const [data, setData] = useState<TimetableData>(emptyTimetable);
  const [selectedChild, setSelectedChild] = useState('');
  const [notice, setNotice] = useState('');
  const [draggedBreakId, setDraggedBreakId] = useState<TimetableBreak['id'] | null>(null);
  const [subjectTeachers, setSubjectTeachers] = useState<Record<string, string>>({});
  const periodCount = data.days[0]?.periods.length || 8;
  const uniqueSubjects = useMemo(() => {
    const ignored = new Set(['', '-', 'free', 'interval', 'interval-1', 'interval-2', 'lunch', 'subject']);
    return Array.from(new Set(data.days.flatMap(day => day.periods)
      .map(period => period.trim())
      .filter(period => !ignored.has(period.toLowerCase()))))
      .sort((first, second) => first.localeCompare(second));
  }, [data.days]);

  useEffect(() => {
    try {
      const parsed = JSON.parse(window.localStorage.getItem(TEACHER_ASSIGNMENT_KEY) ?? '{}') as Record<string, string>;
      setSubjectTeachers(parsed && typeof parsed === 'object' ? parsed : {});
    } catch {
      setSubjectTeachers({});
    }
  }, []);

  useEffect(() => {
    if (!bootstrap.timetable.days.length) return;
    const breaks: TimetableBreak[] = bootstrap.timetable.breaks.map(item => ({
      id: item.id as TimetableBreak['id'],
      label: item.label,
      afterPeriod: item.afterPeriod,
      tone: (item.tone === 'lunch' ? 'lunch' : 'interval') as TimetableBreak['tone'],
    }));
    setData({
      className: requestedClassName || bootstrap.timetable.className,
      section: requestedSection || bootstrap.timetable.section,
      breaks,
      days: bootstrap.timetable.days,
      breakAfterPeriod2: breaks.find(item => item.id === 'interval1')?.label || '',
      lunchAfterPeriod4: breaks.find(item => item.id === 'lunch')?.label || '',
      breakAfterPeriod6: breaks.find(item => item.id === 'interval2')?.label || '',
    });
    if (!selectedChild && bootstrap.students.length) {
      const firstStudent = bootstrap.students[0];
      setSelectedChild(`${firstStudent.full_name} - ${firstStudent.class_name}-${firstStudent.section_name}`);
    }
  }, [bootstrap, requestedClassName, requestedSection, selectedChild]);

  function save(next: TimetableData, message: string) {
    setData(next);
    setNotice(`${message} Backend write sync is planned; this screen starts from stored DB data.`);
  }

  function updateSubjectTeacher(subject: string, teacher: string) {
    setSubjectTeachers(current => ({ ...current, [subject]: teacher }));
  }

  function saveSubjectTeachers() {
    window.localStorage.setItem(TEACHER_ASSIGNMENT_KEY, JSON.stringify(subjectTeachers));
    setNotice('Subject teacher assignments saved. Teacher timetable allocation will use these saved subject mappings.');
  }

  function updatePeriod(dayId: string, index: number, value: string) {
    save({
      ...data,
      days: data.days.map(day => day.id === dayId ? { ...day, periods: day.periods.map((period, periodIndex) => periodIndex === index ? value : period) } : day),
    }, 'Timetable period updated.');
  }

  function saveBreaks(breaks: TimetableBreak[], message: string) {
    const interval1 = breaks.find(item => item.id === 'interval1')?.label || 'Interval-1';
    const lunch = breaks.find(item => item.id === 'lunch')?.label || 'Lunch';
    const interval2 = breaks.find(item => item.id === 'interval2')?.label || 'Interval-2';
    save({
      ...data,
      breaks,
      breakAfterPeriod2: interval1,
      lunchAfterPeriod4: lunch,
      breakAfterPeriod6: interval2,
    }, message);
  }

  function updateBreakLabel(id: TimetableBreak['id'], value: string) {
    saveBreaks(data.breaks.map(item => item.id === id ? { ...item, label: value } : item), 'Break and lunch label updated.');
  }

  function moveBreak(id: TimetableBreak['id'], afterPeriod: number) {
    const target = Math.min(Math.max(afterPeriod, 1), periodCount);
    saveBreaks(data.breaks.map(item => item.id === id ? { ...item, afterPeriod: target } : item), `Break moved after P${target}.`);
  }

  function finishBreakPointer(event: PointerEvent<HTMLElement>) {
    if (!draggedBreakId) return;
    const target = document
      .elementFromPoint(event.clientX, event.clientY)
      ?.closest<HTMLElement>('[data-break-slot]');
    const afterPeriod = Number(target?.dataset.breakSlot || '');
    if (afterPeriod) moveBreak(draggedBreakId, afterPeriod);
    setDraggedBreakId(null);
  }

  function breaksAfter(periodNumber: number) {
    return data.breaks.filter(item => item.afterPeriod === periodNumber).sort((first, second) => {
      const order = { interval1: 1, lunch: 2, interval2: 3 };
      return order[first.id] - order[second.id];
    });
  }

  function breakTone(item: TimetableBreak) {
    return item.tone === 'lunch' ? 'text-emerald-800' : 'text-amber-800';
  }

  function addDay() {
    const label = `Day ${data.days.length + 1}`;
    save({ ...data, days: [...data.days, { id: `day-${Date.now()}`, label, periods: Array.from({ length: 8 }, () => 'Subject') }] }, `${label} added.`);
  }

  function removeDay(dayId: string) {
    if (!window.confirm('Delete this timetable day?')) return;
    save({ ...data, days: data.days.filter(day => day.id !== dayId) }, 'Timetable day deleted.');
  }

  function addPeriodColumn() {
    save({ ...data, days: data.days.map(day => ({ ...day, periods: [...day.periods, 'Subject'] })) }, 'New period column added.');
  }

  function removePeriodColumn() {
    if (!window.confirm('Delete the last timetable period column?')) return;
    save({ ...data, days: data.days.map(day => ({ ...day, periods: day.periods.slice(0, -1) })) }, 'Last period column deleted.');
  }

  if (loading) {
    return <LoadingRing size="lg" />;
  }

  if (error || !data.days.length) {
    return (
      <div className="p-container-padding-mobile md:p-container-padding-desktop">
        <section className="bg-white rounded-xl border border-error/20 shadow-sm p-stack-md">
          <h1 className="font-headline-md text-headline-md text-primary">Class Timetable</h1>
          <p className="mt-2 text-error font-bold">Stored timetable data is unavailable{error ? `: ${error}` : '.'}</p>
        </section>
      </div>
    );
  }

  return (
    <div className="p-container-padding-mobile md:p-container-padding-desktop space-y-stack-lg">
      <section className="bg-white rounded-xl border border-outline-variant/40 shadow-sm p-stack-md">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-primary">Class Timetable</h1>
            {data.className && <p className="mt-1 text-label-md text-on-surface-variant">{data.className}{data.section ? ` - Section ${data.section}` : ''}</p>}
          </div>
          {mode === 'parent' ? (
            <select value={selectedChild} onChange={event => setSelectedChild(event.target.value)} className="px-4 py-3 rounded-lg bg-surface-container border border-outline-variant">
              {bootstrap.students.map(student => (
                <option key={student.id}>{student.full_name} - {student.class_name}-{student.section_name}</option>
              ))}
            </select>
          ) : editMode ? (
            <div className="flex flex-wrap justify-end gap-2">
              <Link href={viewHref} title="View timetable" aria-label="View timetable" className="group relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-outline text-on-surface font-bold sm:w-auto sm:px-4"><span className="material-symbols-outlined text-[18px]">visibility</span><span className="hidden sm:ml-2 sm:inline">View</span><span role="tooltip" className="pointer-events-none absolute bottom-full right-0 z-[60] mb-2 whitespace-nowrap rounded-md border border-outline-variant bg-white px-2 py-1 text-xs font-bold text-on-surface shadow-md opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">View timetable</span></Link>
              <button onClick={addDay} title="Add day" aria-label="Add day" className="group relative inline-flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-on-secondary font-bold sm:w-auto sm:px-4"><span className="material-symbols-outlined text-[18px]">calendar_add_on</span><span className="hidden sm:ml-2 sm:inline">Add Day</span><span role="tooltip" className="pointer-events-none absolute bottom-full right-0 z-[60] mb-2 whitespace-nowrap rounded-md border border-outline-variant bg-white px-2 py-1 text-xs font-bold text-on-surface shadow-md opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">Add day</span></button>
              <button onClick={addPeriodColumn} title="Add period" aria-label="Add period" className="group relative inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-on-primary font-bold sm:w-auto sm:px-4"><span className="material-symbols-outlined text-[18px]">view_column</span><span className="hidden sm:ml-2 sm:inline">Add Period</span><span role="tooltip" className="pointer-events-none absolute bottom-full right-0 z-[60] mb-2 whitespace-nowrap rounded-md border border-outline-variant bg-white px-2 py-1 text-xs font-bold text-on-surface shadow-md opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">Add period</span></button>
              <button onClick={removePeriodColumn} title="Delete period" aria-label="Delete period" className="group relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-error text-error font-bold sm:w-auto sm:px-4"><span className="material-symbols-outlined text-[18px]">delete</span><span className="hidden sm:ml-2 sm:inline">Delete Period</span><span role="tooltip" className="pointer-events-none absolute bottom-full right-0 z-[60] mb-2 whitespace-nowrap rounded-md border border-outline-variant bg-white px-2 py-1 text-xs font-bold text-on-surface shadow-md opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">Delete period</span></button>
            </div>
          ) : (
            <Link href={editHref} title="Edit timetable" aria-label="Edit timetable" className="group relative z-10 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-on-primary hover:z-50 hover:bg-primary-container focus-visible:z-50">
              <span className="material-symbols-outlined text-[18px]">edit</span>
              <span role="tooltip" className="pointer-events-none absolute bottom-full right-0 z-[60] mb-2 whitespace-nowrap rounded-md border border-outline-variant bg-white px-2 py-1 text-xs font-bold text-on-surface shadow-md opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">Edit timetable</span>
            </Link>
          )}
        </div>
        {notice && <p className="mt-4 rounded-lg bg-primary/5 border border-primary/15 px-4 py-3 text-primary font-bold">{notice}</p>}
      </section>

      {editable && (
        <section className="bg-white rounded-xl border border-outline-variant/40 shadow-sm p-stack-md">
          <h2 className="font-headline-md text-headline-md text-primary mb-4">Break Labels and Timing</h2>
          <div className="max-w-2xl space-y-3">
            {data.breaks.map(item => (
              <label key={item.id} className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-label-md font-bold text-on-surface-variant">{item.id === 'interval1' ? 'Interval 1' : item.id === 'interval2' ? 'Interval 2' : 'Lunch'}</span>
                <input value={item.label} onChange={event => updateBreakLabel(item.id, event.target.value)} className="min-w-0 flex-1 max-w-sm rounded-lg border border-outline-variant bg-surface-container px-3 py-2" />
              </label>
            ))}
          </div>
          <div className="mt-5">
            <p className="text-label-sm font-bold text-primary mb-2">Drag Break Timing</p>
            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-2">
              {Array.from({ length: periodCount }, (_, index) => {
                const afterPeriod = index + 1;
                const slotBreaks = breaksAfter(afterPeriod);
                return (
                  <div
                    key={afterPeriod}
                    data-break-slot={afterPeriod}
                    onDragOver={event => event.preventDefault()}
                    onDrop={() => {
                      if (draggedBreakId) moveBreak(draggedBreakId, afterPeriod);
                      setDraggedBreakId(null);
                    }}
                    onPointerUp={finishBreakPointer}
                    className={`min-h-20 touch-none rounded-lg border border-dashed border-outline-variant bg-surface-container-low p-2 transition-colors ${draggedBreakId ? 'border-primary bg-primary/5' : ''}`}
                  >
                    <p className="mb-1.5 text-[10px] font-extrabold uppercase tracking-wide text-on-surface-variant">After P{afterPeriod}</p>
                    <div className="space-y-1.5">
                      {slotBreaks.map(item => (
                        <div
                          key={item.id}
                          draggable
                          onDragStart={() => setDraggedBreakId(item.id)}
                          onDragEnd={() => setDraggedBreakId(null)}
                          onPointerDown={event => {
                            event.preventDefault();
                            setDraggedBreakId(item.id);
                          }}
                          onPointerUp={finishBreakPointer}
                          onPointerCancel={() => setDraggedBreakId(null)}
                          className={`cursor-move touch-none select-none rounded-md bg-white px-2 py-1.5 text-center text-[11px] font-extrabold shadow-sm ring-1 ring-outline-variant/50 ${draggedBreakId === item.id ? 'scale-105 ring-primary' : ''} ${breakTone(item)}`}
                        >
                          {item.label}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <section className="bg-white rounded-xl border border-outline-variant/40 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[940px] text-left text-[12px] md:min-w-[1260px] md:text-base">
            <thead className="bg-primary text-on-primary">
              <tr>
                <th className="px-3 py-2 md:px-4 md:py-3">Day</th>
                {data.days[0]?.periods.map((_, index) => (
                  <Fragment key={`period-group-${index}`}>
                    <th key={`period-${index}`} className="px-3 py-2 text-center md:px-4 md:py-3">P{index + 1}</th>
                    {breaksAfter(index + 1).map(item => (
                      <th key={`break-head-${item.id}`} className="w-16 px-1 py-2 text-center text-[10px] uppercase tracking-wide md:w-20 md:px-2 md:py-3 md:text-[11px]">
                        {item.label}
                      </th>
                    ))}
                  </Fragment>
                ))}
                {editable && <th className="px-4 py-3">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {data.days.map((day, dayIndex) => (
                <tr key={day.id}>
                  <td className="px-4 py-3 font-bold text-primary">{day.label}</td>
                  {day.periods.map((period, index) => {
                    const periodBreaks = breaksAfter(index + 1);
                    return (
                      <Fragment key={`${day.id}-period-group-${index}`}>
                        <td key={`${day.id}-${index}`} className="px-3 py-3 text-center align-middle">
                          {editable ? (
                            <input value={period} onChange={event => updatePeriod(day.id, index, event.target.value)} className="w-full min-w-28 bg-transparent px-3 py-2 text-center text-label-md font-bold outline-none focus:rounded-md focus:bg-white focus:ring-2 focus:ring-primary/30" />
                          ) : (
                            <span className="block px-3 py-2 text-center text-label-md font-bold">{period}</span>
                          )}
                        </td>
                        {periodBreaks.map(item => dayIndex === 0 && (
                          <td key={`${day.id}-break-${item.id}`} rowSpan={data.days.length} className="w-20 px-2 py-3 align-middle text-center">
                            <span
                              className={`mx-auto flex min-h-40 items-center justify-center px-1 py-3 text-[11px] font-extrabold uppercase tracking-wide ${breakTone(item)}`}
                              style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
                            >
                              {item.label}
                            </span>
                          </td>
                        ))}
                      </Fragment>
                    );
                  })}
                  {editable && (
                    <td className="px-4 py-3">
                      <button onClick={() => removeDay(day.id)} className="px-3 py-2 rounded-lg bg-error-container text-error font-bold">Delete</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {editable && (
        <section className="bg-white rounded-xl border border-outline-variant/40 shadow-sm p-stack-md">
          <div className="mb-4 flex items-center justify-start gap-3">
            <h2 className="font-headline-md text-headline-md text-primary">Subject Teacher Assignment</h2>
            <button onClick={saveSubjectTeachers} title="Save subject teachers" aria-label="Save subject teachers" className="inline-flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-primary text-on-primary font-bold sm:w-auto sm:px-4">
              <span className="material-symbols-outlined text-[18px]">save</span>
              <span className="hidden sm:inline">Save</span>
            </button>
          </div>
          <div className="overflow-x-auto rounded-xl border border-outline-variant">
            <table className="w-full min-w-[320px] table-fixed text-left md:min-w-[640px]">
              <thead className="bg-primary text-on-primary">
                <tr>
                  <th className="w-[38%] px-3 py-3 md:px-4">Subject Name</th>
                  <th className="px-3 py-3 md:px-4">Teacher Name</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30">
                {uniqueSubjects.map(subject => (
                  <tr key={subject}>
                    <td className="px-3 py-3 font-bold text-on-surface md:px-4">{subject}</td>
                    <td className="px-3 py-3 md:px-4">
                      <select
                        value={subjectTeachers[subject] ?? ''}
                        onChange={event => updateSubjectTeacher(subject, event.target.value)}
                        className="w-full rounded-lg border border-outline-variant bg-surface-container px-2 py-2 text-label-md md:px-4 md:py-2.5"
                      >
                        <option value="">Select teacher</option>
                        {teacherOptions.map(teacher => <option key={teacher} value={teacher}>{teacher}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
                {uniqueSubjects.length === 0 && (
                  <tr>
                    <td colSpan={2} className="px-4 py-6 text-center text-on-surface-variant">No timetable subjects available for assignment.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
