'use client';

import { useEffect, useState } from 'react';
import TeacherStudentsPage, { TeacherStudentDashboardSummary } from '../students/page';

const teacherDayTimetables = [
  { label: 'Day-1', classes: ['Class 4-B', 'Class 7-A', '-', 'Class 6-A', 'Class 4-B', 'Class 8-B', '-'] },
  { label: 'Day-2', classes: ['Class 7-A', 'Class 2-B', '-', 'Class 6-A', 'Class 7-A', 'Class 5-B', '-'] },
  { label: 'Day-3', classes: ['Class 8-B', '-', 'Class 4-B', 'Class 7-A', 'Class 6-A', '-', 'Class 4-B'] },
];

export default function TeacherDashboardPage() {
  const [protocols, setProtocols] = useState([
    'Morning roll-call synchronized',
    'Dismissal badges prepared',
    'Emergency contact logs synced',
  ]);
  const [checkedProtocols, setCheckedProtocols] = useState<number[]>([]);
  const [submittedProtocols, setSubmittedProtocols] = useState<number[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [newProtocol, setNewProtocol] = useState('');
  const [dayIndex, setDayIndex] = useState(0);
  const activeDay = teacherDayTimetables[dayIndex];

  useEffect(() => {
    function resetIfNewDay() {
      const today = new Date().toISOString().slice(0, 10);
      const storageKey = 'safereach-teacher-protocol-reset-date';
      if (window.localStorage.getItem(storageKey) !== today) {
        setCheckedProtocols([]);
        setSubmittedProtocols([]);
        window.localStorage.setItem(storageKey, today);
      }
    }

    resetIfNewDay();
    const timer = window.setInterval(resetIfNewDay, 60 * 1000);
    return () => window.clearInterval(timer);
  }, []);

  function beginEdit(index: number) {
    setEditingIndex(index);
    setEditText(protocols[index]);
  }

  function saveProtocol() {
    if (editingIndex === null || editText.trim() === '') return;
    setProtocols(current => current.map((item, index) => index === editingIndex ? editText.trim() : item));
    setEditingIndex(null);
    setEditText('');
  }

  function submitProtocols() {
    setSubmittedProtocols(checkedProtocols);
  }

  function addProtocol() {
    if (!newProtocol.trim()) return;
    setProtocols(current => [...current, newProtocol.trim()]);
    setNewProtocol('');
  }

  function deleteProtocol(index: number) {
    if (!window.confirm(`Delete safety protocol "${protocols[index]}"?`)) return;
    setProtocols(current => current.filter((_, i) => i !== index));
    setCheckedProtocols(current => current.filter(i => i !== index).map(i => i > index ? i - 1 : i));
    setSubmittedProtocols(current => current.filter(i => i !== index).map(i => i > index ? i - 1 : i));
  }

  function previousDay() {
    setDayIndex(current => (current === 0 ? teacherDayTimetables.length - 1 : current - 1));
  }

  function nextDay() {
    setDayIndex(current => (current + 1) % teacherDayTimetables.length);
  }

  return (
    <div className="p-container-padding-mobile md:p-container-padding-desktop pb-6">
      <section className="grid grid-cols-1 gap-gutter items-start">
        <div className="min-w-0 flex flex-col gap-gutter">
          <TeacherStudentDashboardSummary />
          <div className="mt-4 grid grid-cols-1 items-start gap-3 md:mt-6 md:gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(320px,520px)]">
            <div className="mx-auto w-full max-w-[360px] overflow-hidden rounded-xl border border-outline-variant bg-surface p-stack-md shadow-sm xl:mx-0">
              <div className="flex items-center justify-between gap-3 mb-4">
                <button type="button" onClick={previousDay} className="h-10 w-10 rounded-full bg-surface-container text-primary flex items-center justify-center hover:bg-primary/10" aria-label="Previous day">
                  <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div className="text-center">
                  <h3 className="font-headline-md text-headline-md text-primary">Teacher Timetable</h3>
                  <p className="text-label-md text-on-surface-variant">{activeDay.label} allocation for Sarah Jenkins</p>
                </div>
                <button type="button" onClick={nextDay} className="h-10 w-10 rounded-full bg-surface-container text-primary flex items-center justify-center hover:bg-primary/10" aria-label="Next day">
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
              <div className="overflow-hidden rounded-xl border border-outline-variant">
                <table className="w-full table-fixed border-collapse text-center">
                  <thead className="bg-primary text-on-primary">
                    <tr>
                      <th className="w-16 px-2 py-3 font-bold border-r border-white/20">Hour</th>
                      <th className="px-2 py-3 font-bold">Class</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeDay.classes.map((className, index) => (
                      <tr key={`${activeDay.label}-${index}`} className={index % 2 === 0 ? 'bg-primary/5' : 'bg-surface'}>
                        <td className="px-2 py-3 font-bold text-primary border-r border-outline-variant">{index + 1}</td>
                        <td className={`px-2 py-3 font-label-md whitespace-nowrap ${className === '-' ? 'text-on-surface-variant' : 'text-on-surface font-bold'}`}>{className}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-surface-container-high rounded-xl p-stack-md md:p-stack-lg shadow-sm w-full">
              <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-primary">verified_user</span>
                <h3 className="font-headline-md text-headline-md text-primary">Safety Protocols</h3>
              </div>
              <div className="flex flex-col gap-3">
                {protocols.map((item, i) => (
                  <div key={`${item}-${i}`} className="flex items-center gap-3 p-3 bg-surface-container-lowest rounded-lg border border-outline-variant">
                    <input
                      checked={checkedProtocols.includes(i)}
                      onChange={e => setCheckedProtocols(current => e.target.checked ? [...current, i] : current.filter(itemIndex => itemIndex !== i))}
                      className="w-5 h-5 rounded border-outline text-primary focus:ring-primary"
                      type="checkbox"
                    />
                    <span className={`font-label-md text-label-md text-on-surface flex-1 ${submittedProtocols.includes(i) ? 'line-through text-on-surface-variant' : ''}`}>{item}</span>
                    <button onClick={() => beginEdit(i)} className="p-1 rounded hover:bg-primary/10 text-primary" title="Edit protocol"><span className="material-symbols-outlined text-[18px]">edit</span></button>
                    <button onClick={() => deleteProtocol(i)} className="p-1 rounded hover:bg-error-container text-error" title="Delete protocol"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                  </div>
                ))}
              </div>
              {editingIndex !== null && (
                <div className="mt-4 flex gap-2">
                  <input className="flex-1 bg-white border border-outline-variant rounded-lg px-3 py-2 text-label-md min-w-0" value={editText} onChange={e => setEditText(e.target.value)} />
                  <button onClick={saveProtocol} className="px-3 py-2 bg-primary text-on-primary rounded-lg font-bold">Save</button>
                </div>
              )}
              <div className="mt-4 flex gap-2">
                <input className="flex-1 min-w-0 bg-white border border-outline-variant rounded-lg px-3 py-2 text-label-md" value={newProtocol} onChange={e => setNewProtocol(e.target.value)} placeholder="Add new safety protocol" />
                <button onClick={addProtocol} className="px-3 py-2 bg-secondary text-on-secondary rounded-lg font-bold">Add</button>
              </div>
              <button onClick={submitProtocols} className="mt-4 w-full py-2 bg-primary text-on-primary rounded-lg font-bold">Submit Checked Protocols</button>
              <div className="mt-6 p-4 bg-tertiary-fixed text-on-tertiary-fixed rounded-lg text-label-sm flex items-start gap-2">
                <span className="material-symbols-outlined text-[18px]">info</span>
                <span>Remember to verify all ID badges before hand-off to unauthorized guardians.</span>
              </div>
            </div>
          </div>
          <TeacherStudentsPage mode="dashboard" />
        </div>
      </section>
    </div>
  );
}
