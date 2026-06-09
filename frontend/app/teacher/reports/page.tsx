'use client';

import { useState } from 'react';

const pastReports = [
  {id:'RPT-T-011',title:'Monthly Class Summary – May 2025',type:'Class',date:'May 28, 2025',status:'Submitted'},
  {id:'RPT-T-010',title:'Incident Report – Aryan Shah',type:'Incident',date:'May 22, 2025',status:'Reviewed'},
  {id:'RPT-T-009',title:'April Attendance Overview',type:'Attendance',date:'May 1, 2025',status:'Submitted'},
  {id:'RPT-T-008',title:'Behavioural Note – Karan Mehta',type:'Incident',date:'Apr 28, 2025',status:'Reviewed'},
];

export default function TeacherReportsPage() {
  const [incidentType, setIncidentType] = useState('');
  const [severity, setSeverity] = useState('');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(()=>setSubmitted(false),3000);
    setDescription(''); setIncidentType(''); setSeverity('');
  }

  return (
    <div className="p-container-padding-mobile md:p-container-padding-desktop space-y-stack-lg">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[{label:'Class Avg Score',value:'76%',icon:'school',c:'text-primary',bg:'bg-primary/5 border-primary/20'},{label:'Attendance Rate',value:'91%',icon:'how_to_reg',c:'text-green-600',bg:'bg-green-50 border-green-100'},{label:'Incidents Filed',value:'3',icon:'warning',c:'text-orange-600',bg:'bg-orange-50 border-orange-100'},{label:'Reports Submitted',value:'11',icon:'description',c:'text-secondary',bg:'bg-secondary/5 border-secondary/20'}].map(c=>(
          <div key={c.label} className={`p-4 rounded-xl border ${c.bg}`}><div className="flex items-center justify-between mb-2"><p className="text-label-sm text-on-surface-variant">{c.label}</p><span className={`material-symbols-outlined text-[20px] ${c.c}`}>{c.icon}</span></div><p className={`font-headline-md text-headline-md ${c.c}`}>{c.value}</p></div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-stack-lg">
        <div className="bg-white rounded-xl shadow-sm border border-outline-variant/30 p-stack-md">
          <div className="flex items-center gap-2 mb-4"><span className="material-symbols-outlined text-error">report</span><h3 className="font-headline-md text-on-surface">File an Incident Report</h3></div>
          {submitted && <div className="mb-4 flex items-center gap-2 bg-green-50 border border-green-100 px-4 py-3 rounded-lg text-green-700"><span className="material-symbols-outlined text-[18px]">check_circle</span>Report submitted successfully!</div>}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div><label className="text-label-md text-on-surface-variant block mb-1">Student Name</label><select className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2.5 text-body-md focus:ring-2 focus:ring-primary focus:outline-none"><option value="">Select student...</option><option>Aarav Sharma</option><option>Ananya Patel</option><option>Arjun Nair</option></select></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-label-md text-on-surface-variant block mb-1">Incident Type</label><select required className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2.5 text-body-md focus:ring-2 focus:ring-primary focus:outline-none" value={incidentType} onChange={e=>setIncidentType(e.target.value)}><option value="">Select type…</option>{['Medical','Behavioural','Bullying','Injury','Absence','Other'].map(t=><option key={t}>{t}</option>)}</select></div>
              <div><label className="text-label-md text-on-surface-variant block mb-1">Severity</label><select required className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2.5 text-body-md focus:ring-2 focus:ring-primary focus:outline-none" value={severity} onChange={e=>setSeverity(e.target.value)}><option value="">Select…</option>{['Low','Medium','High','Critical'].map(s=><option key={s}>{s}</option>)}</select></div>
            </div>
            <div><label className="text-label-md text-on-surface-variant block mb-1">Date &amp; Time</label><input type="datetime-local" defaultValue="2025-05-28T10:00" className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2.5 text-body-md focus:ring-2 focus:ring-primary focus:outline-none" /></div>
            <div><label className="text-label-md text-on-surface-variant block mb-1">Description</label><textarea required rows={3} className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2.5 text-body-md focus:ring-2 focus:ring-primary focus:outline-none resize-none" placeholder="Describe the incident in detail…" value={description} onChange={e=>setDescription(e.target.value)} /></div>
            <button type="submit" className="w-full bg-error text-on-error py-3 rounded-lg font-label-md hover:opacity-90 transition-opacity flex items-center justify-center gap-2"><span className="material-symbols-outlined text-[18px]">send</span>Submit Incident Report</button>
          </form>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden">
          <div className="px-4 py-3 border-b border-outline-variant flex items-center justify-between"><h3 className="font-headline-md text-on-surface">Past Reports</h3><button className="text-primary text-label-md hover:underline">See All</button></div>
          <div className="divide-y divide-outline-variant/20">
            {pastReports.map(r=>(
              <div key={r.id} className="px-4 py-3 flex items-center gap-3 hover:bg-surface-container/30 transition-colors">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${r.type==='Incident'?'bg-orange-100':'bg-primary/10'}`}><span className={`material-symbols-outlined text-[18px] ${r.type==='Incident'?'text-orange-600':'text-primary'}`}>{r.type==='Incident'?'warning':'description'}</span></div>
                <div className="flex-1 min-w-0"><p className="font-label-md text-label-md text-on-surface truncate">{r.title}</p><p className="text-label-sm text-on-surface-variant">{r.date}</p></div>
                <span className={`px-2 py-1 rounded-full text-label-sm font-bold shrink-0 ${r.status==='Reviewed'?'bg-green-100 text-green-700':'bg-blue-100 text-blue-700'}`}>{r.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
