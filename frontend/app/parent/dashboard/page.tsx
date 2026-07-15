'use client';

import { useEffect, useState } from 'react';
import { readDailyIds, writeDailyIds } from '@/lib/dailyActionLocks';
import { travelStatusClass, travelStatusIcon, travelStatusLabel, useStudentTravelState } from '@/lib/studentTravel';

export default function ParentDashboardPage() {
  const { parentChildren, actions } = useStudentTravelState();
  const currentParentName = 'Sarah Thompson';
  const currentParentChildIds = ['st-leo-thompson', 'st-maya-thompson'];
  const dashboardChildren = parentChildren.filter(child =>
    child.parentName === currentParentName || currentParentChildIds.includes(child.id)
  );
  const [readySentIds, setReadySentIds] = useState<string[]>([]);
  const [reachedHomeIds, setReachedHomeIds] = useState<string[]>([]);
  const canSendToSchool = (childStatus: string) => childStatus !== 'to_school' && childStatus !== 'going_home';
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
    function resetIfNewDay() {
      const today = new Date().toISOString().slice(0, 10);
      const storageKey = 'safereach-parent-protocol-reset-date';
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

  useEffect(() => {
    writeDailyIds('safereach_parent_ready_to_school', readySentIds);
  }, [readySentIds]);

  useEffect(() => {
    writeDailyIds('safereach_parent_reached_home', reachedHomeIds);
  }, [reachedHomeIds]);

  function beginEdit(index: number) {
    setEditingIndex(index);
    setEditText(protocols[index]);
  }

  function saveEdit() {
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

  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 2500);
  }

  const travelTimingGroups = dashboardChildren.reduce<Array<{
    key: string;
    status: string;
    location: string;
    updatedAt: string;
    children: typeof dashboardChildren;
  }>>((groups, child) => {
    const key = `${child.status}|${child.location}|${child.updatedAt}`;
    const existing = groups.find(group => group.key === key);
    if (existing) {
      existing.children.push(child);
    } else {
      groups.push({
        key,
        status: child.status,
        location: child.location,
        updatedAt: child.updatedAt,
        children: [child],
      });
    }
    return groups;
  }, []);

  return (
    <div className="px-container-padding-mobile md:px-container-padding-desktop py-stack-lg">
      <section className="mb-stack-lg">
        <h3 className="font-headline-lg text-headline-lg text-on-background mb-2">Welcome back, Sarah.</h3>
        <p className="font-body-lg text-body-lg text-on-surface-variant">Your children are currently loaded from stored SafeReach records.</p>
      </section>
      {notice && <div className="mb-4 bg-green-50 border border-green-100 text-green-700 px-4 py-3 rounded-lg font-label-md">{notice}</div>}
      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-12">
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {dashboardChildren.map((child, i) => (
            <div key={child.id} className={`glass-card rounded-xl p-stack-md flex flex-col gap-4 relative overflow-hidden group ${child.status === 'at_home' ? 'ring-2 ring-yellow-200 bg-yellow-50/30' : ''}`}>
              <div className={`absolute top-0 left-0 w-1 h-full ${i % 2 === 0 ? 'bg-secondary' : 'bg-primary'}`}></div>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-primary-container text-primary flex items-center justify-center font-bold">{child.avatar}</div>
                  <div><h4 className="font-headline-md text-[18px] font-bold">{child.name}</h4><p className="text-label-sm text-on-surface-variant">{child.className} - Section {child.section}</p></div>
                </div>
                <span className={`${travelStatusClass(child.status)} px-3 py-1 rounded-full text-label-sm font-bold flex items-center gap-1`}>
                  <span className="material-symbols-outlined text-[14px]">{travelStatusIcon(child.status)}</span>{travelStatusLabel(child.status, 'parent')}
                </span>
              </div>
              {child.absenceReasonRequested && (
                <div className="rounded-lg bg-error-container/40 p-3 text-label-sm text-error font-bold">
                  Absent SMS sent. Reply with reason in Messages.
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={readySentIds.includes(child.id) || !canSendToSchool(child.status)}
                  onClick={() => {
                    actions.readyToSend(child.id);
                    setReadySentIds(current => Array.from(new Set([...current, child.id])));
                    showNotice(`${child.name} is now Tracking to School.`);
                  }}
                  className={`px-2 py-2 font-bold text-label-sm sm:text-label-md rounded-lg transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap ${readySentIds.includes(child.id) || !canSendToSchool(child.status) ? 'bg-surface-container text-on-surface-variant cursor-not-allowed' : 'bg-secondary text-on-secondary hover:opacity-90'}`}
                >
                  <span className="material-symbols-outlined text-[16px] sm:text-[18px]">directions_walk</span>
                  Ready to Send
                </button>
                <button
                  type="button"
                  disabled={reachedHomeIds.includes(child.id) || child.status !== 'going_home'}
                  onClick={() => {
                    actions.markReachedHome(child.id);
                    setReachedHomeIds(current => Array.from(new Set([...current, child.id])));
                    showNotice(`${child.name} marked SafeReach at home.`);
                  }}
                  className={`px-2 py-2 font-bold text-label-sm sm:text-label-md rounded-lg transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap ${child.status === 'going_home' && !reachedHomeIds.includes(child.id) ? 'bg-primary text-on-primary hover:opacity-90' : 'bg-surface-container text-on-surface-variant cursor-not-allowed'}`}
                >
                  <span className="material-symbols-outlined text-[16px] sm:text-[18px]">home_pin</span>
                  Reached Home
                </button>
              </div>
            </div>
          ))}
          {dashboardChildren.length === 0 && (
            <div className="md:col-span-2 glass-card rounded-xl p-stack-md text-on-surface-variant">
              No child records are assigned to this parent account.
            </div>
          )}
          <section className="md:col-span-2 glass-card rounded-xl p-stack-md border-l-4 border-secondary">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-secondary">schedule</span>
              <h4 className="text-headline-md text-[18px] font-bold">Travel Timing</h4>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {travelTimingGroups.map(group => (
                <div key={group.key} className="rounded-lg bg-surface-container p-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-label-md font-bold text-on-background">
                        {group.children.map(child => child.name.split(' ')[0]).join(', ')}
                      </p>
                      <p className="text-label-sm text-on-surface-variant">
                        {group.location} - updated {group.updatedAt}.
                      </p>
                    </div>
                    <span className={`${travelStatusClass(group.status)} w-fit px-3 py-1 rounded-full text-label-sm font-bold flex items-center gap-1`}>
                      <span className="material-symbols-outlined text-[14px]">{travelStatusIcon(group.status)}</span>
                      {travelStatusLabel(group.status, 'parent')}
                    </span>
                  </div>
                  {group.status === 'at_home' && (
                    <p className="mt-2 text-label-sm text-yellow-700 font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">alarm</span>
                      Send reminder alarm is automatically active for {group.children.length > 1 ? 'these children' : 'this child'}.
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="hidden glass-card rounded-xl p-stack-md">
              <div className="flex items-center justify-between mb-4"><h4 className="text-headline-md text-[18px] font-bold">Billing &amp; Fees</h4><span className="material-symbols-outlined text-primary">payments</span></div>
              <div className="space-y-3"><div className="flex justify-between items-center"><span className="text-label-md text-on-surface-variant">Lunch Balance</span><span className="font-bold text-on-background">$42.50</span></div><div className="flex justify-between items-center"><span className="text-label-md text-on-surface-variant">Field Trip: Zoo</span><span className="font-bold text-error">Unpaid</span></div></div>
              <button className="w-full mt-4 py-2 bg-primary text-white font-bold rounded-lg text-label-md active:scale-95 transition-transform">Add Funds</button>
            </div>
          </div>
        </div>
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card rounded-xl p-stack-md border-l-4 border-primary">
            <div className="flex items-center gap-2 mb-4"><span className="material-symbols-outlined text-primary">verified_user</span><h4 className="text-headline-md text-[18px] font-bold">Safety Protocols</h4></div>
            <div className="space-y-3">
              {protocols.map((item, index) => (
                <div key={`${item}-${index}`} className="flex items-center gap-2 p-2 bg-surface-container rounded-lg">
                  <input
                    type="checkbox"
                    checked={checkedProtocols.includes(index)}
                    onChange={e => setCheckedProtocols(current => e.target.checked ? [...current, index] : current.filter(itemIndex => itemIndex !== index))}
                    className="w-5 h-5 rounded text-primary"
                  />
                  <span className={`text-label-md text-on-background flex-1 ${submittedProtocols.includes(index) ? 'line-through text-on-surface-variant' : ''}`}>{item}</span>
                  <button onClick={() => beginEdit(index)} className="p-1 rounded hover:bg-primary/10 text-primary" title="Edit protocol"><span className="material-symbols-outlined text-[18px]">edit</span></button>
                  <button onClick={() => deleteProtocol(index)} className="p-1 rounded hover:bg-error-container text-error" title="Delete protocol"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                </div>
              ))}
            </div>
            {editingIndex !== null && (
              <div className="mt-4 flex gap-2">
                <input className="flex-1 bg-white border border-outline-variant rounded-lg px-3 py-2 text-label-md" value={editText} onChange={e => setEditText(e.target.value)} />
                <button onClick={saveEdit} className="px-3 py-2 bg-primary text-on-primary rounded-lg font-bold">Save</button>
              </div>
            )}
            <div className="mt-4 flex gap-2">
              <input className="flex-1 bg-white border border-outline-variant rounded-lg px-3 py-2 text-label-md" value={newProtocol} onChange={e => setNewProtocol(e.target.value)} placeholder="Add new safety protocol" />
              <button onClick={addProtocol} className="px-3 py-2 bg-secondary text-on-secondary rounded-lg font-bold">Add</button>
            </div>
            <button onClick={submitProtocols} className="mt-4 w-full py-2 bg-primary text-on-primary rounded-lg font-bold">Submit Checked Protocols</button>
          </div>
          <div className="glass-card rounded-xl p-stack-md">
            <h4 className="text-headline-md text-[18px] font-bold mb-4">Notification Feed</h4>
            <div className="space-y-4">
              {[
                { bg: 'bg-primary/10', icon: 'school', c: 'text-primary', title: 'Class Update', msg: 'Maya is marked present for Period 1.', time: '8:42 AM' },
                { bg: 'bg-error/10', icon: 'report', c: 'text-error', title: 'Security Alert', msg: 'Scheduled drill at Main Campus at 11:00 AM.', time: '7:30 AM' },
                { bg: 'bg-secondary/10', icon: 'description', c: 'text-secondary', title: 'Result Ready', msg: 'Term result is available in Results.', time: 'Yesterday' },
              ].map((n, i) => (
                <div key={i} className="flex gap-3"><div className={`w-8 h-8 ${n.bg} rounded-full flex items-center justify-center flex-shrink-0`}><span className={`material-symbols-outlined ${n.c} text-[18px]`}>{n.icon}</span></div><div><p className="text-label-md font-bold">{n.title}</p><p className="text-label-sm text-on-surface-variant">{n.msg}</p><p className="text-[10px] text-outline mt-1 uppercase tracking-widest">{n.time}</p></div></div>
              ))}
            </div>
            <button onClick={() => showNotice('Full notification history is displayed in Messages and Attendance pages.')} className="w-full mt-6 py-2 text-primary font-bold text-label-sm border border-primary/20 rounded-lg hover:bg-primary/5 transition-colors">View All History</button>
          </div>
        </div>
      </div>
    </div>
  );
}
