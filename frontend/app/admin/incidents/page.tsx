'use client';

import { useMemo, useState } from 'react';

type IncidentStatus = 'Pending' | 'Accepted' | 'Rejected';

const incidentSeed = [
  { id: 'INC-2025-001', time: '08:10 AM', minutesAgo: 12, student: 'Aryan Shah', grade: '10-A', type: 'Medical Emergency', level: 'Critical', priority: 'Immediate', status: 'Pending' as IncidentStatus, handler: 'Dr. Meera Patel' },
  { id: 'INC-2025-002', time: '08:25 AM', minutesAgo: 26, student: 'Priya Nair', grade: '9-B', type: 'Bullying', level: 'High', priority: 'High', status: 'Pending' as IncidentStatus, handler: 'Mr. Rajan Kumar' },
  { id: 'INC-2025-003', time: '09:05 AM', minutesAgo: 55, student: 'Rohan Verma', grade: '8-C', type: 'Minor Injury', level: 'Low', priority: 'Normal', status: 'Accepted' as IncidentStatus, handler: 'Nurse Sheetal' },
  { id: 'INC-2025-004', time: '09:12 AM', minutesAgo: 62, student: 'Sneha Reddy', grade: '11-A', type: 'Unauthorized Absence', level: 'Medium', priority: 'Medium', status: 'Pending' as IncidentStatus, handler: 'Ms. Anita Roy' },
  { id: 'INC-2025-005', time: '10:20 AM', minutesAgo: 130, student: 'Karan Mehta', grade: '7-B', type: 'Behavioural Issue', level: 'Medium', priority: 'Medium', status: 'Rejected' as IncidentStatus, handler: 'Mr. David Lee' },
  { id: 'INC-2025-006', time: '10:42 AM', minutesAgo: 152, student: 'Aisha Begum', grade: '12-A', type: 'Medical Emergency', level: 'High', priority: 'High', status: 'Accepted' as IncidentStatus, handler: 'Dr. Meera Patel' },
  { id: 'INC-2025-007', time: '11:05 AM', minutesAgo: 175, student: 'Dev Sharma', grade: '6-C', type: 'Property Damage', level: 'Low', priority: 'Normal', status: 'Pending' as IncidentStatus, handler: 'Mr. Rajan Kumar' },
];

const levelRank: Record<string, number> = { Critical: 1, High: 2, Medium: 3, Low: 4 };
const levelColor: Record<string, string> = {
  Critical: 'bg-red-100 text-red-700',
  High: 'bg-orange-100 text-orange-700',
  Medium: 'bg-yellow-100 text-yellow-700',
  Low: 'bg-green-100 text-green-700',
};
const statusColor: Record<IncidentStatus, string> = {
  Pending: 'bg-blue-100 text-blue-700',
  Accepted: 'bg-green-100 text-green-700',
  Rejected: 'bg-red-100 text-red-700',
};

export default function AdminIncidentsPage() {
  const [incidents, setIncidents] = useState(incidentSeed);
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState('All');
  const [status, setStatus] = useState('All');

  const filtered = useMemo(() => {
    return incidents
      .filter(item => {
        const searchMatch = `${item.student} ${item.id} ${item.type}`.toLowerCase().includes(search.toLowerCase());
        const levelMatch = level === 'All' || item.level === level;
        const statusMatch = status === 'All' || item.status === status;
        return searchMatch && levelMatch && statusMatch;
      })
      .sort((a, b) => levelRank[a.level] - levelRank[b.level] || a.minutesAgo - b.minutesAgo);
  }, [incidents, level, search, status]);

  function updateStatus(id: string, nextStatus: IncidentStatus) {
    setIncidents(current => current.map(item => item.id === id ? { ...item, status: nextStatus } : item));
  }

  return (
    <div className="p-container-padding-mobile md:p-container-padding-desktop">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-stack-lg gap-4">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-primary">Incident Logs</h1>
          <p className="text-body-md text-on-surface-variant">Ordered first by safety level priority, then by latest reported time.</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-lg font-label-md hover:bg-primary-container transition-colors shadow-sm">
          <span className="material-symbols-outlined text-[18px]">add</span>Report New Incident
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-stack-lg">
        {[
          { label: 'Total Incidents', value: incidents.length, icon: 'folder_open', c: 'text-primary', bg: 'bg-primary/5 border-primary/20' },
          { label: 'Pending Action', value: incidents.filter(i => i.status === 'Pending').length, icon: 'pending', c: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
          { label: 'Accepted', value: incidents.filter(i => i.status === 'Accepted').length, icon: 'check_circle', c: 'text-green-600', bg: 'bg-green-50 border-green-100' },
          { label: 'Critical/High', value: incidents.filter(i => ['Critical', 'High'].includes(i.level)).length, icon: 'emergency', c: 'text-error', bg: 'bg-red-50 border-red-100' },
        ].map(card => (
          <div key={card.label} className={`${card.bg} p-stack-md rounded-xl border`}>
            <div className="flex items-center justify-between mb-2"><p className="text-label-md text-on-surface-variant">{card.label}</p><span className={`material-symbols-outlined text-[20px] ${card.c}`}>{card.icon}</span></div>
            <p className={`font-headline-md text-headline-md ${card.c}`}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-outline-variant/30 p-4 mb-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
          <input className="w-full pl-10 pr-4 py-2.5 bg-surface-container rounded-lg border border-outline-variant focus:border-primary focus:ring-0 text-body-md outline-none" placeholder="Search by student, type, or incident ID..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="bg-surface-container border border-outline-variant rounded-lg px-4 py-2.5 text-label-md focus:ring-2 focus:ring-primary focus:outline-none" value={level} onChange={e => setLevel(e.target.value)}>
          <option value="All">All Levels</option>{['Critical', 'High', 'Medium', 'Low'].map(item => <option key={item}>{item}</option>)}
        </select>
        <select className="bg-surface-container border border-outline-variant rounded-lg px-4 py-2.5 text-label-md focus:ring-2 focus:ring-primary focus:outline-none" value={status} onChange={e => setStatus(e.target.value)}>
          <option value="All">All Statuses</option>{(['Pending', 'Accepted', 'Rejected'] as const).map(item => <option key={item}>{item}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-outline-variant/30 max-w-full">
        <div className="w-full max-w-full overflow-x-auto pb-3">
          <table className="w-full min-w-[1320px]">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant">
                {['Priority','Time','Incident ID','Student','Type','Level','Status','Handler','Action'].map(h => <th key={h} className="text-left px-4 py-3 font-label-md text-label-md text-on-surface-variant whitespace-nowrap">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {filtered.map((inc, idx) => (
                <tr key={inc.id} className={`border-b border-outline-variant/30 hover:bg-surface-container/40 transition-colors ${idx % 2 !== 0 ? 'bg-surface-container/10' : ''}`}>
                  <td className="px-4 py-3"><span className={`px-2.5 py-1 rounded-full text-label-sm font-bold whitespace-nowrap ${inc.level === 'Critical' ? 'bg-error text-on-error' : 'bg-surface-container text-primary'}`}>{inc.priority}</span></td>
                  <td className="px-4 py-3 text-body-md text-on-surface font-bold whitespace-nowrap">{inc.time}</td>
                  <td className="px-4 py-3 font-label-md text-primary font-bold whitespace-nowrap">{inc.id}</td>
                  <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-primary font-bold text-label-sm shrink-0">{inc.student[0]}</div><div><p className="font-label-md text-label-md whitespace-nowrap">{inc.student}</p><p className="text-label-sm text-on-surface-variant">Grade {inc.grade}</p></div></div></td>
                  <td className="px-4 py-3 text-body-md whitespace-nowrap">{inc.type}</td>
                  <td className="px-4 py-3"><span className={`px-2.5 py-1 rounded-full text-label-sm font-bold whitespace-nowrap ${levelColor[inc.level]}`}>{inc.level}</span></td>
                  <td className="px-4 py-3"><span className={`px-2.5 py-1 rounded-full text-label-sm font-bold whitespace-nowrap ${statusColor[inc.status]}`}>{inc.status}</span></td>
                  <td className="px-4 py-3 text-body-md text-on-surface-variant whitespace-nowrap">{inc.handler}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateStatus(inc.id, 'Accepted')} className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-label-sm font-bold hover:opacity-90">Accept</button>
                      <button onClick={() => updateStatus(inc.id, 'Rejected')} className="px-3 py-1.5 rounded-lg border border-error text-error text-label-sm font-bold hover:bg-error-container">Reject</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
