'use client';

import { Fragment, useEffect, useMemo, useState } from 'react';
import Link from '@/src/next-link';
import { type TimetableBreak, type TimetableData } from '@/lib/timetable';
import { useBackendBootstrap } from '@/lib/backendData';

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

export default function TimetableManager({ mode, editMode = false }: { mode: 'admin' | 'teacher' | 'parent'; editMode?: boolean }) {
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
      className: bootstrap.timetable.className,
      section: bootstrap.timetable.section,
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
  }, [bootstrap, selectedChild]);

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
    return <div className="p-container-padding-mobile md:p-container-padding-desktop text-primary font-bold">Loading stored timetable data...</div>;
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
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-primary">Class Timetable</h1>
          </div>
          {mode === 'parent' ? (
            <select value={selectedChild} onChange={event => setSelectedChild(event.target.value)} className="px-4 py-3 rounded-lg bg-surface-container border border-outline-variant">
              {bootstrap.students.map(student => (
                <option key={student.id}>{student.full_name} - {student.class_name}-{student.section_name}</option>
              ))}
            </select>
          ) : editMode ? (
            <div className="flex flex-wrap gap-2">
              <Link href={viewHref} className="px-4 py-2 rounded-lg border border-outline text-on-surface font-bold">View</Link>
              <button onClick={addDay} className="px-4 py-2 rounded-lg bg-secondary text-on-secondary font-bold">Add Day</button>
              <button onClick={addPeriodColumn} className="px-4 py-2 rounded-lg bg-primary text-on-primary font-bold">Add Period</button>
              <button onClick={removePeriodColumn} className="px-4 py-2 rounded-lg border border-error text-error font-bold">Delete Period</button>
            </div>
          ) : (
            <Link href={editHref} className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-on-primary font-bold">
              <span className="material-symbols-outlined text-[18px]">edit</span>
              Edit
            </Link>
          )}
        </div>
        {notice && <p className="mt-4 rounded-lg bg-primary/5 border border-primary/15 px-4 py-3 text-primary font-bold">{notice}</p>}
      </section>

      {editable && (
        <section className="bg-white rounded-xl border border-outline-variant/40 shadow-sm p-stack-md">
          <h2 className="font-headline-md text-headline-md text-primary mb-4">Break Labels and Timing</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.breaks.map(item => (
              <label key={item.id} className="space-y-2">
                <span className="block text-label-md font-bold text-on-surface-variant">{item.id === 'interval1' ? 'Interval 1' : item.id === 'interval2' ? 'Interval 2' : 'Lunch'}</span>
                <input value={item.label} onChange={event => updateBreakLabel(item.id, event.target.value)} className="w-full px-4 py-3 rounded-lg bg-surface-container border border-outline-variant" />
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
                    onDragOver={event => event.preventDefault()}
                    onDrop={() => {
                      if (draggedBreakId) moveBreak(draggedBreakId, afterPeriod);
                      setDraggedBreakId(null);
                    }}
                    className="min-h-20 rounded-lg border border-dashed border-outline-variant bg-surface-container-low p-2"
                  >
                    <p className="mb-1.5 text-[10px] font-extrabold uppercase tracking-wide text-on-surface-variant">After P{afterPeriod}</p>
                    <div className="space-y-1.5">
                      {slotBreaks.map(item => (
                        <div
                          key={item.id}
                          draggable
                          onDragStart={() => setDraggedBreakId(item.id)}
                          onDragEnd={() => setDraggedBreakId(null)}
                          className={`cursor-move rounded-md bg-white px-2 py-1.5 text-center text-[11px] font-extrabold shadow-sm ring-1 ring-outline-variant/50 ${breakTone(item)}`}
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
          <table className="w-full min-w-[1260px] text-left">
            <thead className="bg-primary text-on-primary">
              <tr>
                <th className="px-4 py-3">Day</th>
                {data.days[0]?.periods.map((_, index) => (
                  <Fragment key={`period-group-${index}`}>
                    <th key={`period-${index}`} className="px-4 py-3 text-center">P{index + 1}</th>
                    {breaksAfter(index + 1).map(item => (
                      <th key={`break-head-${item.id}`} className="w-20 px-2 py-3 text-center text-[11px] uppercase tracking-wide">
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
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="font-headline-md text-headline-md text-primary">Subject Teacher Assignment</h2>
              <p className="text-label-md text-on-surface-variant">Subjects are generated automatically from the timetable without duplicates. Assigning a teacher updates the teacher timetable allocation flow.</p>
            </div>
            <button onClick={saveSubjectTeachers} className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-on-primary font-bold">
              <span className="material-symbols-outlined text-[18px]">save</span>
              Save
            </button>
          </div>
          <div className="overflow-x-auto rounded-xl border border-outline-variant">
            <table className="w-full min-w-[640px] text-left">
              <thead className="bg-primary text-on-primary">
                <tr>
                  <th className="px-4 py-3">Subject Name</th>
                  <th className="px-4 py-3">Teacher Name</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30">
                {uniqueSubjects.map(subject => (
                  <tr key={subject}>
                    <td className="px-4 py-3 font-bold text-on-surface">{subject}</td>
                    <td className="px-4 py-3">
                      <select
                        value={subjectTeachers[subject] ?? ''}
                        onChange={event => updateSubjectTeacher(subject, event.target.value)}
                        className="w-full rounded-lg border border-outline-variant bg-surface-container px-4 py-2.5 text-label-md"
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
