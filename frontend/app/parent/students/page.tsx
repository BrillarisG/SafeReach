'use client';

import Link from 'next/link';

const children = [
  {id:1,name:'Aarav Mehta',grade:'Grade 8 – Section A',roll:'STU-0042',teacher:'Mr. James Anderson',status:'In School',statusColor:'bg-green-100 text-green-700',location:'Science Lab – Building B',attendance:'94%',avatar:'AM',activities:[{icon:'how_to_reg',text:'Marked Present – Period 1',time:'8:05 AM',c:'text-green-600'},{icon:'science',text:'Science Lab session started',time:'10:00 AM',c:'text-blue-500'},{icon:'lunch_dining',text:'Lunch break – Cafeteria',time:'12:30 PM',c:'text-orange-500'}]},
  {id:2,name:'Diya Mehta',grade:'Grade 5 – Section C',roll:'STU-0091',teacher:'Ms. Anita Roy',status:'In Class',statusColor:'bg-blue-100 text-blue-700',location:'Classroom 301 – Wing C',attendance:'97%',avatar:'DM',activities:[{icon:'how_to_reg',text:'Marked Present – Period 1',time:'8:05 AM',c:'text-green-600'},{icon:'menu_book',text:'English class – Room 301',time:'9:00 AM',c:'text-primary'},{icon:'how_to_reg',text:'Marked Present – Period 3',time:'11:00 AM',c:'text-green-600'}]},
];

export default function ParentStudentsPage() {
  return (
    <div className="px-container-padding-mobile md:px-container-padding-desktop py-stack-lg space-y-stack-lg">
      {children.map(child=>(
        <div key={child.id} className="bg-white rounded-2xl shadow-sm border border-outline-variant/30 overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-primary-container p-stack-md text-on-primary">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-on-primary font-bold text-headline-md border-2 border-white/30">{child.avatar}</div>
              <div className="flex-1"><h3 className="font-headline-md text-headline-md">{child.name}</h3><p className="text-on-primary/80 text-label-md">{child.grade}</p><div className="flex flex-wrap gap-2 mt-1"><span className="px-2 py-0.5 rounded-full text-label-sm bg-white/20 text-on-primary">{child.roll}</span><span className={`px-2 py-0.5 rounded-full text-label-sm font-bold ${child.statusColor}`}>{child.status}</span></div></div>
              <div className="hidden md:block text-right"><p className="text-on-primary/70 text-label-sm">Attendance</p><p className="font-headline-md text-headline-md">{child.attendance}</p></div>
            </div>
          </div>
          <div className="p-stack-md">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-surface-container/50 rounded-xl p-3"><p className="text-label-sm text-on-surface-variant mb-1">Current Location</p><div className="flex items-center gap-2"><span className="material-symbols-outlined text-green-600 text-[20px]">location_on</span><p className="text-label-md font-bold text-on-surface">{child.location}</p></div><p className="text-label-sm text-on-surface-variant mt-1">Last updated: just now</p></div>
              <div className="bg-surface-container/50 rounded-xl p-3"><p className="text-label-sm text-on-surface-variant mb-1">Class Teacher</p><div className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-[20px]">person</span><p className="text-label-md font-bold text-on-surface">{child.teacher}</p></div></div>
              <div className="bg-surface-container/50 rounded-xl p-3"><p className="text-label-sm text-on-surface-variant mb-2">Quick Actions</p><div className="flex gap-2"><Link href="/parent/messages" className="flex-1 py-1.5 text-label-sm bg-primary text-on-primary rounded-lg hover:bg-primary-container transition-colors text-center">Message Teacher</Link><Link href="/parent/children/records" className="flex-1 py-1.5 text-label-sm border border-outline-variant rounded-lg hover:bg-surface-container transition-colors text-center">View Records</Link></div></div>
            </div>
            <div><p className="text-label-md font-bold text-on-surface-variant mb-2">Today&apos;s Activity</p><div className="space-y-2">{child.activities.map((a,i)=>(
              <div key={i} className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center shrink-0"><span className={`material-symbols-outlined text-[16px] ${a.c}`}>{a.icon}</span></div><p className="text-label-md text-on-surface flex-1">{a.text}</p><p className="text-label-sm text-on-surface-variant shrink-0">{a.time}</p></div>
            ))}</div></div>
          </div>
        </div>
      ))}
    </div>
  );
}
