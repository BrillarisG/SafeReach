'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { travelStatusClass, travelStatusIcon, travelStatusLabel, useStudentTravelState } from '@/lib/studentTravel';

export default function ParentDashboardPage() {
  const { parentChildren, actions } = useStudentTravelState();
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
    setProtocols(current => current.filter((_, i) => i !== index));
    setCheckedProtocols(current => current.filter(i => i !== index).map(i => i > index ? i - 1 : i));
    setSubmittedProtocols(current => current.filter(i => i !== index).map(i => i > index ? i - 1 : i));
  }

  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 2500);
  }

  return (
    <div className="px-container-padding-mobile md:px-container-padding-desktop py-stack-lg">
      <section className="mb-stack-lg">
        <h3 className="font-headline-lg text-headline-lg text-on-background mb-2">Welcome back, Sarah.</h3>
        <p className="font-body-lg text-body-lg text-on-surface-variant">Your children are currently in safe zones. Dashboard cards use frontend demo data only.</p>
      </section>
      {notice && <div className="mb-4 bg-green-50 border border-green-100 text-green-700 px-4 py-3 rounded-lg font-label-md">{notice}</div>}
      <div className="bento-grid flex flex-col lg:grid lg:grid-cols-12">
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {parentChildren.map((child, i) => (
            <div key={child.id} className="glass-card rounded-xl p-stack-md flex flex-col gap-4 relative overflow-hidden group">
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
              <div className="bg-surface-container rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2"><span className="material-symbols-outlined text-primary text-[18px]">location_on</span><span className="text-label-md font-bold">Travel Status</span></div>
                <p className="text-label-sm text-on-surface-variant">{child.location} - updated {child.updatedAt} from frontend demo records.</p>
                {child.absenceReasonRequested && (
                  <p className="mt-2 text-label-sm text-error font-bold">Absent SMS sent. Reply with reason in Messages.</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Link href="/parent/children/records" className="py-2 text-center text-primary font-bold text-label-md border border-primary/20 rounded-lg hover:bg-primary/5 transition-colors">View Records</Link>
                <Link href="/parent/messages" className="py-2 text-center bg-primary text-on-primary font-bold text-label-md rounded-lg hover:opacity-90 transition-colors">Message Teacher</Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    actions.readyToSend(child.id);
                    showNotice(`${child.name} marked Out of Home to School.`);
                  }}
                  className="py-2 bg-secondary text-on-secondary font-bold text-label-md rounded-lg hover:opacity-90 transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">directions_walk</span>
                  Ready to Send
                </button>
                <button
                  type="button"
                  disabled={child.status !== 'going_home'}
                  onClick={() => {
                    actions.markReachedHome(child.id);
                    showNotice(`${child.name} confirmed Reached Home.`);
                  }}
                  className={`py-2 font-bold text-label-md rounded-lg transition-colors flex items-center justify-center gap-2 ${child.status === 'going_home' ? 'bg-primary text-on-primary hover:opacity-90' : 'bg-surface-container text-on-surface-variant cursor-not-allowed'}`}
                >
                  <span className="material-symbols-outlined text-[18px]">home_pin</span>
                  Reached Home
                </button>
              </div>
            </div>
          ))}
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="hidden glass-card rounded-xl p-stack-md">
              <div className="flex items-center justify-between mb-4"><h4 className="text-headline-md text-[18px] font-bold">Billing &amp; Fees</h4><span className="material-symbols-outlined text-primary">payments</span></div>
              <div className="space-y-3"><div className="flex justify-between items-center"><span className="text-label-md text-on-surface-variant">Lunch Balance</span><span className="font-bold text-on-background">$42.50</span></div><div className="flex justify-between items-center"><span className="text-label-md text-on-surface-variant">Field Trip: Zoo</span><span className="font-bold text-error">Unpaid</span></div></div>
              <button className="w-full mt-4 py-2 bg-primary text-white font-bold rounded-lg text-label-md active:scale-95 transition-transform">Add Funds</button>
            </div>
            <div className="glass-card rounded-xl p-stack-md flex flex-col md:col-span-2">
              <h4 className="text-headline-md text-[18px] font-bold mb-4">Quick Message</h4>
              <div className="flex-1 space-y-2 mb-4"><select className="w-full bg-surface-container border-none rounded-lg text-label-md py-2 px-3"><option>Select Teacher</option><option>Mr. Harrison (Math)</option><option>Ms. Clark (Science)</option></select><textarea className="w-full bg-surface-container border-none rounded-lg text-label-md py-2 px-3 h-20 resize-none focus:ring-primary" placeholder="Write a message..."></textarea></div>
              <button className="w-full py-2 bg-secondary text-white font-bold rounded-lg text-label-md flex items-center justify-center gap-2 hover:bg-on-secondary-container transition-colors"><span className="material-symbols-outlined text-[18px]">send</span>Send Message</button>
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
                { bg: 'bg-secondary/10', icon: 'description', c: 'text-secondary', title: 'Report Ready', msg: 'Term report is available in Reports.', time: 'Yesterday' },
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
