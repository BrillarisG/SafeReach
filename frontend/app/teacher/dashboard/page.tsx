'use client';

import { useEffect, useState } from 'react';
import { useStudentTravelState } from '@/lib/studentTravel';

export default function TeacherDashboardPage() {
  const { counts } = useStudentTravelState();
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

  return (
    <div className="p-container-padding-mobile md:p-container-padding-desktop flex flex-col gap-gutter pb-6">
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        <div className="lg:col-span-8 bg-surface-container-lowest rounded-xl p-stack-lg shadow-[0_4px_12px_rgba(0,0,0,0.08)] border-l-4 border-secondary">
          <div className="flex justify-between items-start mb-6"><div><h2 className="font-headline-lg text-headline-lg text-primary">Class 4-B Snapshot</h2><p className="text-body-md text-on-surface-variant">Real-time attendance &amp; transit status</p></div><span className="bg-secondary-fixed text-on-secondary-fixed px-3 py-1 rounded-full font-label-sm text-label-sm flex items-center gap-1"><span className="material-symbols-outlined text-[16px]" style={{fontVariationSettings:"'FILL' 1"}}>check_circle</span>All Secured</span></div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              [String(counts.present), 'Present / Reached', 'text-primary'],
              [String(counts.toSchool), 'To School', 'text-secondary'],
              [String(counts.absent), 'Absent', 'text-error'],
              [String(counts.goingHome), 'Going Home', 'text-yellow-600'],
              [String(counts.reachedHome), 'Reached Home', 'text-green-700'],
            ].map(([n,l,c])=>(
              <div key={l} className="bg-surface-container rounded-lg p-4 flex flex-col items-center justify-center text-center"><span className={`text-[32px] font-bold ${c}`}>{n}</span><span className="font-label-sm text-label-sm text-outline">{l}</span></div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-4 bg-primary text-on-primary rounded-xl p-stack-lg shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="font-headline-md text-headline-md mb-2">My Profile</h3>
            <div className="flex items-center gap-4 mb-4"><div className="bg-on-primary text-primary px-3 py-1 rounded-full font-label-sm text-label-sm">Active Duty</div><div className="text-on-primary-container font-label-sm text-label-sm">Shift Ends: 4:30 PM</div></div>
            <button className="w-full bg-on-primary text-primary py-2 rounded-lg font-bold hover:bg-primary-fixed transition-colors active:scale-95">Edit Availability</button>
            <button className="w-full mt-2 border border-on-primary-container text-on-primary py-2 rounded-lg font-label-md text-label-md hover:bg-primary-container transition-colors">Update Credentials</button>
          </div>
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-primary-container rounded-full opacity-50 blur-2xl"></div>
        </div>
      </section>
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl p-stack-lg shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
          <div className="flex justify-between items-center mb-6"><h3 className="font-headline-md text-headline-md text-primary">Class Summary</h3><button className="text-secondary font-label-md text-label-md flex items-center gap-1">Open Report<span className="material-symbols-outlined text-[18px]">arrow_forward</span></button></div>
          <div className="space-y-4">
            {[{time:'01',period:'ITEM',title:'Attendance review',sub:'Today attendance has been marked for most students.',tag:'Ready',tagCls:'bg-secondary-container text-on-secondary-container'},
              {time:'02',period:'ITEM',title:'Incident follow-up',sub:'Open incident reports are ready for admin review.',tag:'Ready',tagCls:'bg-primary/10 text-primary'},
              {time:'03',period:'ITEM',title:'Parent communication',sub:'Recent parent messages are waiting in the inbox.',tag:'Planned',tagCls:'text-outline'}
            ].map((item,i)=>(
              <div key={i} className="flex items-center gap-4 p-4 bg-surface rounded-lg hover:shadow-sm transition-shadow">
                <div className={`${i===0?'bg-primary-fixed text-primary':'bg-surface-container text-outline'} p-2 rounded-lg flex flex-col items-center min-w-[60px]`}><span className="font-bold">{item.time}</span><span className="text-[10px] uppercase font-bold">{item.period}</span></div>
                <div className="flex-1"><h4 className="font-bold text-on-surface">{item.title}</h4><p className="text-label-sm text-on-surface-variant">{item.sub}</p></div>
                <span className={`${item.tagCls} px-2 py-1 rounded-md text-[10px] font-bold uppercase`}>{item.tag}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-surface-container-high rounded-xl p-stack-lg shadow-sm">
          <div className="flex items-center gap-2 mb-6"><span className="material-symbols-outlined text-primary">verified_user</span><h3 className="font-headline-md text-headline-md text-primary">Safety Protocols</h3></div>
          <div className="flex flex-col gap-3">
            {protocols.map((item,i)=>(
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
              <input className="flex-1 bg-white border border-outline-variant rounded-lg px-3 py-2 text-label-md" value={editText} onChange={e => setEditText(e.target.value)} />
              <button onClick={saveProtocol} className="px-3 py-2 bg-primary text-on-primary rounded-lg font-bold">Save</button>
            </div>
          )}
          <div className="mt-4 flex gap-2">
            <input className="flex-1 bg-white border border-outline-variant rounded-lg px-3 py-2 text-label-md" value={newProtocol} onChange={e => setNewProtocol(e.target.value)} placeholder="Add new safety protocol" />
            <button onClick={addProtocol} className="px-3 py-2 bg-secondary text-on-secondary rounded-lg font-bold">Add</button>
          </div>
          <button onClick={submitProtocols} className="mt-4 w-full py-2 bg-primary text-on-primary rounded-lg font-bold">Submit Checked Protocols</button>
          <div className="mt-6 p-4 bg-tertiary-fixed text-on-tertiary-fixed rounded-lg text-label-sm flex items-start gap-2"><span className="material-symbols-outlined text-[18px]">info</span><span>Remember to verify all ID badges before hand-off to unauthorized guardians.</span></div>
        </div>
      </section>
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        <div className="lg:col-span-5 bg-surface-container-lowest rounded-xl p-stack-lg shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
          <div className="flex justify-between items-center mb-6"><h3 className="font-headline-md text-headline-md text-primary">Parent Messages</h3><span className="bg-error-container text-on-error-container px-2 py-0.5 rounded-full text-[10px] font-bold">2 NEW</span></div>
          <div className="space-y-1">
            {[{name:'Mrs. Thompson',time:'10:24 AM',msg:"Leo will be picked up early at 2 PM today for a dental appointment...",img:'https://lh3.googleusercontent.com/aida-public/AB6AXuBDExmow3wT2aJL6aa-v6UfVQO-6eH1C6Y7iLHJ3BMwe8jWSyzy40NnjcngsISOToELvKp0zMaP9HyofsAvhSGPVOHn3jAZxsJ9PyNwVtSBwd--S_LkVSKNphilH0U1kcpiNQoQF-S-qZ1GtgZcBIm2mdXBSdj62IAMKXr7mImqbCcEbJTUZqsBUHFGMjW4Pnmt5ukDGJBco40MVVkY5gT6S4UuEcJ8TVolM9mS0kX9e-HeuDQv6e9vNmaNa69t7guHz28QXwHbDwIa',border:true},
              {name:'Mr. David Chen',time:'09:15 AM',msg:"Is the field trip form due tomorrow or Friday? Thanks!",img:'https://lh3.googleusercontent.com/aida-public/AB6AXuCl98q68TRihg-CxjoH9IzLVlkz3cuXk0pTjKzeXjtZmFekCmATuefAOEMjah5PyCfR_WHInaH-CFEfK6BVkTOdio8yQm9xlwvQWiPzE9WXlI-RZ6fUy6pNavF5AU_IQexvGMBmKqhNa6_o84qJ9g8CzexBAW_iFE1nYwm_TRkjZmjzolQzX9BopnGvI6W_BU6UqMHXBpPU4SBkOyQiuQhcBQSUcszAJOqNn3wADstzpE52nzRi91Bkxbxk9aiC8gaaabuxwSqxrRhp',border:false}
            ].map((m,i)=>(
              <div key={i} className={`p-3 hover:bg-surface-container rounded-lg cursor-pointer transition-colors flex items-center gap-4 ${m.border?'bg-surface-container-low border-l-4 border-primary':''}`}>
                <div className="h-10 w-10 rounded-full bg-outline-variant flex items-center justify-center overflow-hidden"><img alt={m.name} className="w-full h-full object-cover" src={m.img} /></div>
                <div className="flex-1 overflow-hidden"><div className="flex justify-between"><span className="font-bold text-on-surface">{m.name}</span><span className="text-[10px] text-outline">{m.time}</span></div><p className="text-label-sm text-on-surface-variant truncate">{m.msg}</p></div>
              </div>
            ))}
            <button className="w-full mt-4 py-2 bg-secondary text-on-secondary rounded-lg font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-colors"><span className="material-symbols-outlined text-[20px]">send</span>Message All Parents</button>
          </div>
        </div>
        <div className="lg:col-span-7 bg-surface-container-lowest rounded-xl p-stack-lg shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
          <h3 className="font-headline-md text-headline-md text-primary mb-6">Live Activity Log</h3>
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
            {[{bg:'bg-secondary',icon:'directions_bus',text:'Student: <b>Marcus J.</b> boarded <b>Bus 102</b>',time:'2 minutes ago • Automated Scan'},
              {bg:'bg-tertiary-container',icon:'priority_high',text:'Alert: <b>Chloe W.</b> absence not verified by parent.',time:'15 minutes ago • System Generated'},
              {bg:'bg-primary',icon:'login',text:'<b>Success:</b> Morning attendance submission complete.',time:'1 hour ago • Admin Sarah Jenkins'},
              {bg:'bg-secondary',icon:'group',text:'<b>New Note:</b> Extra snacks needed for Class 4-B party Friday.',time:'2 hours ago • Admin Office'},
            ].map((a,i)=>(
              <div key={i} className="flex gap-4 items-start relative">
                <div className={`${a.bg} p-1 rounded-full text-white z-10`}><span className="material-symbols-outlined text-[16px]">{a.icon}</span></div>
                <div className="flex-1 border-b border-surface-variant pb-3"><p className="text-body-md" dangerouslySetInnerHTML={{__html:a.text}}></p><p className="text-label-sm text-outline">{a.time}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
