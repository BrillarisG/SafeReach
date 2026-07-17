'use client';

import { useEffect, useState } from 'react';
import { readDailyIds, writeDailyIds } from '@/lib/dailyActionLocks';
import { travelStatusClass, travelStatusIcon, travelStatusLabel, useStudentTravelState } from '@/lib/studentTravel';

const teacherSchedule = [
  ['1', '4-B', 'Mathematics'],
  ['2', '7-A', 'Science'],
  ['3', '-', 'Free time'],
  ['4', '6-A', 'Mathematics'],
  ['5', '4-B', 'Science'],
  ['6', '8-B', 'Statistics'],
];

export default function ParentDashboardPage() {
  const { parentChildren, actions } = useStudentTravelState();
  const currentParentName = 'Sarah Thompson';
  const currentParentChildIds = ['st-leo-thompson', 'st-maya-thompson'];
  const dashboardChildren = parentChildren.filter(child =>
    child.parentName === currentParentName || currentParentChildIds.includes(child.id)
  );
  const [readySentIds, setReadySentIds] = useState<string[]>([]);
  const [reachedHomeIds, setReachedHomeIds] = useState<string[]>([]);
  const [protocols, setProtocols] = useState([
    'Verify pickup person before handover',
    'Keep emergency contact number updated',
    'Confirm absence reason before 9:30 AM',
  ]);
  const [checkedProtocols, setCheckedProtocols] = useState<number[]>([]);
  const [submittedProtocols, setSubmittedProtocols] = useState<number[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [newProtocol, setNewProtocol] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    setReadySentIds(readDailyIds('safereach_parent_ready_to_school'));
    setReachedHomeIds(readDailyIds('safereach_parent_reached_home'));
  }, []);

  useEffect(() => writeDailyIds('safereach_parent_ready_to_school', readySentIds), [readySentIds]);
  useEffect(() => writeDailyIds('safereach_parent_reached_home', reachedHomeIds), [reachedHomeIds]);

  const canSendToSchool = (status: string) => status !== 'to_school' && status !== 'going_home';
  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 2500);
  };

  function deleteProtocol(index: number) {
    if (!window.confirm(`Delete safety protocol "${protocols[index]}"?`)) return;
    setProtocols(current => current.filter((_, itemIndex) => itemIndex !== index));
    setCheckedProtocols(current => current.filter(itemIndex => itemIndex !== index).map(itemIndex => itemIndex > index ? itemIndex - 1 : itemIndex));
    setSubmittedProtocols(current => current.filter(itemIndex => itemIndex !== index).map(itemIndex => itemIndex > index ? itemIndex - 1 : itemIndex));
  }

  function saveProtocolEdit() {
    if (editingIndex === null || !editText.trim()) return;
    setProtocols(current => current.map((item, index) => index === editingIndex ? editText.trim() : item));
    setEditingIndex(null);
    setEditText('');
  }

  return (
    <div className="px-container-padding-mobile md:px-container-padding-desktop py-stack-lg">
      <section className="mb-stack-lg">
        <h3 className="font-headline-lg text-headline-lg text-on-background mb-2">Sarah Thompson</h3>
        <p className="font-body-lg text-body-lg text-on-surface-variant">Your children are currently loaded from stored SafeReach records.</p>
      </section>
      {notice && <div className="mb-4 rounded-lg border border-green-100 bg-green-50 px-4 py-3 font-label-md text-green-700">{notice}</div>}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <section className="glass-card rounded-xl p-stack-md xl:col-span-5">
          <div className="mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-primary">calendar_month</span><h4 className="text-headline-md text-[18px] font-bold">Teacher Timetable</h4></div>
          <p className="mb-3 text-label-sm text-on-surface-variant">Mr. James Anderson - today&apos;s class allocation</p>
          <div className="overflow-hidden rounded-lg border border-outline-variant">
            <table className="w-full table-fixed text-left text-label-sm">
              <colgroup><col className="w-16" /><col className="w-24" /><col /></colgroup>
              <thead className="bg-primary text-on-primary"><tr><th className="px-3 py-2">Hour</th><th className="px-3 py-2">Class</th><th className="px-3 py-2">Subject</th></tr></thead>
              <tbody>{teacherSchedule.map(([hour, className, subject]) => <tr key={hour} className="border-t border-outline-variant even:bg-surface-container"><td className="px-3 py-2 font-bold">{hour}</td><td className="truncate px-3 py-2 font-bold">{className}</td><td className="truncate px-3 py-2">{subject}</td></tr>)}</tbody>
            </table>
          </div>
        </section>

        <section className="glass-card rounded-xl border-l-4 border-primary p-stack-md xl:col-span-7">
          <div className="mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-primary">verified_user</span><h4 className="text-headline-md text-[18px] font-bold">Safety Protocols</h4></div>
          <div className="space-y-3">
            {protocols.map((item, index) => <div key={`${item}-${index}`} className="flex items-center gap-2 rounded-lg bg-surface-container p-2"><input type="checkbox" checked={checkedProtocols.includes(index)} onChange={event => setCheckedProtocols(current => event.target.checked ? [...current, index] : current.filter(itemIndex => itemIndex !== index))} className="h-5 w-5 rounded text-primary" /><span className={`flex-1 text-label-md text-on-background ${submittedProtocols.includes(index) ? 'text-on-surface-variant line-through' : ''}`}>{item}</span><button onClick={() => { setEditingIndex(index); setEditText(item); }} className="rounded p-1 text-primary hover:bg-primary/10" title="Edit protocol"><span className="material-symbols-outlined text-[18px]">edit</span></button><button onClick={() => deleteProtocol(index)} className="rounded p-1 text-error hover:bg-error-container" title="Delete protocol"><span className="material-symbols-outlined text-[18px]">delete</span></button></div>)}
          </div>
          {editingIndex !== null && <div className="mt-4 flex gap-2"><input className="flex-1 rounded-lg border border-outline-variant bg-white px-3 py-2 text-label-md" value={editText} onChange={event => setEditText(event.target.value)} /><button onClick={saveProtocolEdit} className="rounded-lg bg-primary px-3 py-2 font-bold text-on-primary">Save</button></div>}
          <div className="mt-4 flex gap-2"><input className="flex-1 rounded-lg border border-outline-variant bg-white px-3 py-2 text-label-md" value={newProtocol} onChange={event => setNewProtocol(event.target.value)} placeholder="Add new safety protocol" /><button onClick={() => { if (!newProtocol.trim()) return; setProtocols(current => [...current, newProtocol.trim()]); setNewProtocol(''); }} className="rounded-lg bg-secondary px-3 py-2 font-bold text-on-secondary">Add</button></div>
          <button onClick={() => setSubmittedProtocols(checkedProtocols)} className="mt-4 w-full rounded-lg bg-primary py-2 font-bold text-on-primary">Submit Checked Protocols</button>
        </section>

        <section className="glass-card overflow-hidden rounded-xl xl:col-span-12">
          <div className="flex items-center justify-between gap-3 border-b border-outline-variant p-stack-md"><div><h4 className="text-headline-md text-[18px] font-bold">Student Records</h4><p className="text-label-sm text-on-surface-variant">All children assigned to this parent account</p></div><span className="rounded-full bg-primary-container px-3 py-1 text-label-sm font-bold text-primary">{dashboardChildren.length} students</span></div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead className="bg-surface-container text-label-sm text-on-surface-variant"><tr><th className="px-4 py-3">Student</th><th className="px-4 py-3">Class</th><th className="px-4 py-3">Travel Status</th><th className="px-4 py-3">Actions</th></tr></thead>
              <tbody>{dashboardChildren.map(child => <tr key={child.id} className="border-t border-outline-variant"><td className="px-4 py-3"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-container font-bold text-primary">{child.avatar}</div><div><p className="font-bold text-on-background">{child.name}</p>{child.absenceReasonRequested && <p className="text-label-sm text-error">Absence reason needed</p>}</div></div></td><td className="px-4 py-3 text-label-md">{child.className} - {child.section}</td><td className="px-4 py-3"><span className={`${travelStatusClass(child.status)} flex w-fit items-center gap-1 rounded-full px-3 py-1 text-label-sm font-bold`}><span className="material-symbols-outlined text-[14px]">{travelStatusIcon(child.status)}</span>{travelStatusLabel(child.status, 'parent')}</span></td><td className="px-4 py-3"><div className="flex gap-2"><button type="button" disabled={readySentIds.includes(child.id) || !canSendToSchool(child.status)} onClick={() => { actions.readyToSend(child.id); setReadySentIds(current => Array.from(new Set([...current, child.id]))); showNotice(`${child.name} is now Tracking to School.`); }} className={`whitespace-nowrap rounded-lg px-3 py-2 text-label-sm font-bold ${readySentIds.includes(child.id) || !canSendToSchool(child.status) ? 'cursor-not-allowed bg-surface-container text-on-surface-variant' : 'bg-secondary text-on-secondary'}`}>Ready to Send</button><button type="button" disabled={reachedHomeIds.includes(child.id) || child.status !== 'going_home'} onClick={() => { actions.markReachedHome(child.id); setReachedHomeIds(current => Array.from(new Set([...current, child.id]))); showNotice(`${child.name} marked SafeReach at home.`); }} className={`whitespace-nowrap rounded-lg px-3 py-2 text-label-sm font-bold ${child.status === 'going_home' && !reachedHomeIds.includes(child.id) ? 'bg-primary text-on-primary' : 'cursor-not-allowed bg-surface-container text-on-surface-variant'}`}>Reached Home</button></div></td></tr>)}{dashboardChildren.length === 0 && <tr><td colSpan={4} className="px-4 py-6 text-center text-on-surface-variant">No child records are assigned to this parent account.</td></tr>}</tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
