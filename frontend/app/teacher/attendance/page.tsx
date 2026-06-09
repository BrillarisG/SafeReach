'use client';

import { useState } from 'react';

type AttendanceStatus = 'present' | 'absent' | 'late';
const students = [
  {id:1,name:'Aarav Sharma',roll:'01'},{id:2,name:'Ananya Patel',roll:'02'},{id:3,name:'Arjun Nair',roll:'03'},
  {id:4,name:'Dev Mehta',roll:'04'},{id:5,name:'Dhruv Verma',roll:'05'},{id:6,name:'Ishaan Roy',roll:'06'},
  {id:7,name:'Kavya Reddy',roll:'07'},{id:8,name:'Kritika Singh',roll:'08'},{id:9,name:'Manav Joshi',roll:'09'},
  {id:10,name:'Meera Pillai',roll:'10'},{id:11,name:'Nisha Kapoor',roll:'11'},{id:12,name:'Pranav Kumar',roll:'12'},
  {id:13,name:'Priya Desai',roll:'13'},{id:14,name:'Riya Shah',roll:'14'},{id:15,name:'Rohan Gupta',roll:'15'},
  {id:16,name:'Shreya Iyer',roll:'16'},{id:17,name:'Siddharth Bose',roll:'17'},{id:18,name:'Tanvi Kulkarni',roll:'18'},
];
const btnCls = (cur: AttendanceStatus, tgt: AttendanceStatus) => {
  const base = 'px-3 py-1 rounded-lg text-label-sm font-bold transition-all border ';
  if (cur === tgt) { if (tgt==='present') return base+'bg-green-500 text-white border-green-500'; if (tgt==='absent') return base+'bg-error text-white border-error'; return base+'bg-yellow-400 text-white border-yellow-400'; }
  return base+'bg-surface-container text-on-surface-variant border-outline-variant hover:bg-surface-container-high';
};

export default function TeacherAttendancePage() {
  const [att, setAtt] = useState<Record<number,AttendanceStatus>>(Object.fromEntries(students.map(s=>[s.id,'present'])));
  const [saved, setSaved] = useState(false);
  const mark = (id: number, s: AttendanceStatus) => { setAtt(p=>({...p,[id]:s})); setSaved(false); };
  const markAll = (s: AttendanceStatus) => { setAtt(Object.fromEntries(students.map(st=>[st.id,s]))); setSaved(false); };
  const present = Object.values(att).filter(s=>s==='present').length;
  const absent = Object.values(att).filter(s=>s==='absent').length;
  const late = Object.values(att).filter(s=>s==='late').length;
  return (
    <div className="p-container-padding-mobile md:p-container-padding-desktop">
      <div className="flex flex-col md:flex-row gap-3 mb-stack-lg">
        <select className="bg-white border border-outline-variant rounded-lg px-4 py-2.5 text-label-md focus:ring-2 focus:ring-primary focus:outline-none flex-1"><option>Class 10-A (Mathematics)</option><option>Class 9-B (Mathematics)</option><option>Class 10-B (Mathematics)</option></select>
        <input type="date" defaultValue="2025-05-28" className="bg-white border border-outline-variant rounded-lg px-4 py-2.5 text-label-md focus:ring-2 focus:ring-primary focus:outline-none" />
        <select className="bg-white border border-outline-variant rounded-lg px-4 py-2.5 text-label-md focus:ring-2 focus:ring-primary focus:outline-none"><option>Period 1 – 08:00 AM</option><option>Period 2 – 09:00 AM</option><option>Period 3 – 10:00 AM</option></select>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-stack-lg">
        <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-center"><p className="font-headline-lg text-headline-lg text-green-600">{present}</p><p className="text-label-md text-green-700">Present</p></div>
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-center"><p className="font-headline-lg text-headline-lg text-error">{absent}</p><p className="text-label-md text-red-700">Absent</p></div>
        <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 text-center"><p className="font-headline-lg text-headline-lg text-yellow-600">{late}</p><p className="text-label-md text-yellow-700">Late</p></div>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="text-label-md text-on-surface-variant self-center">Mark All:</span>
        <button onClick={()=>markAll('present')} className="px-4 py-1.5 rounded-lg text-label-md bg-green-500 text-white hover:bg-green-600 transition-colors">Present</button>
        <button onClick={()=>markAll('absent')} className="px-4 py-1.5 rounded-lg text-label-md bg-error text-white hover:opacity-90">Absent</button>
        <button onClick={()=>markAll('late')} className="px-4 py-1.5 rounded-lg text-label-md bg-yellow-400 text-white hover:bg-yellow-500">Late</button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden mb-stack-lg">
        {students.map((s,idx)=>(
          <div key={s.id} className={`flex items-center gap-4 px-4 py-3 border-b border-outline-variant/20 ${idx%2!==0?'bg-surface-container/10':''}`}>
            <span className="text-label-sm text-on-surface-variant w-8 text-center">{s.roll}</span>
            <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center text-primary font-bold text-label-md shrink-0">{s.name[0]}</div>
            <p className="flex-1 font-label-md text-label-md text-on-surface">{s.name}</p>
            <div className="flex gap-1.5">
              <button onClick={()=>mark(s.id,'present')} className={btnCls(att[s.id],'present')}>P</button>
              <button onClick={()=>mark(s.id,'absent')} className={btnCls(att[s.id],'absent')}>A</button>
              <button onClick={()=>mark(s.id,'late')} className={btnCls(att[s.id],'late')}>L</button>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-3">
        {saved && <span className="flex items-center gap-1 text-green-600 text-label-md"><span className="material-symbols-outlined text-[18px]">check_circle</span>Saved successfully!</span>}
        <button onClick={()=>setSaved(true)} className="flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-xl font-label-md hover:bg-primary-container transition-colors shadow-sm"><span className="material-symbols-outlined text-[18px]">save</span>Submit Attendance</button>
      </div>
    </div>
  );
}
