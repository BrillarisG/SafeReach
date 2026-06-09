'use client';

import Link from 'next/link';
import { useState } from 'react';

const classes = [
  {name:'Mathematics – Grade 10A',students:34,room:'Room 201',time:'Mon/Wed/Fri 08:00–09:00',attendance:'94%'},
  {name:'Mathematics – Grade 10B',students:32,room:'Room 202',time:'Tue/Thu 09:00–10:30',attendance:'91%'},
  {name:'Mathematics – Grade 9A',students:36,room:'Room 201',time:'Mon/Wed 11:00–12:00',attendance:'88%'},
];
const activities = [
  {icon:'how_to_reg',text:'Marked attendance for Grade 10A',time:'2 hours ago',color:'text-green-600'},
  {icon:'warning',text:'Filed incident report for Aryan Shah',time:'Yesterday',color:'text-orange-500'},
  {icon:'chat',text:'Sent message to parent of Priya Nair',time:'2 days ago',color:'text-blue-500'},
  {icon:'description',text:'Submitted Term 2 progress report',time:'May 25',color:'text-primary'},
];

export default function AdminTeacherProfilePage() {
  const [tab, setTab] = useState<'profile'|'classes'|'activity'>('profile');
  return (
    <div className="p-container-padding-mobile md:p-container-padding-desktop">
      <div className="flex items-center gap-2 text-label-md text-on-surface-variant mb-stack-lg">
        <Link href="/admin/teachers" className="hover:text-primary transition-colors">Staff Management</Link>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <span className="text-on-surface font-bold">Mr. James Anderson</span>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-outline-variant/30 p-stack-lg mb-stack-lg">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="w-24 h-24 rounded-2xl bg-primary-container shrink-0 overflow-hidden border-4 border-surface">
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDLSCL9Z2UGJtNqqj6dhDAKZ8ZmaRLjMB5EE1TpMHXaIKk14RlUMcSHaj1xx7kFEghEL2f14jmeiC6-MdAePM0ALpJGCYwAgrPWGdsXVuN70kyw1OXgJ3O6Kru3u_nfRvli96DJSiLLzdX4TeYj9l7kQuAM2y61f0ia7iOoXPJVnu4HSOCcKNvEf9wwezX_2n5gpAPKeRMBb2WnBMEhF-67nyddkoe5hngcof2T8aOqNUul3bIS03i-QeaQstiOAhlKNiGweLfhsYXN" alt="Teacher" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="font-headline-lg text-headline-lg text-on-surface">Mr. James Anderson</h1>
                <p className="text-body-md text-on-surface-variant">Senior Mathematics Teacher</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="px-2.5 py-1 rounded-full text-label-sm bg-green-100 text-green-700 font-bold">Active</span>
                  <span className="px-2.5 py-1 rounded-full text-label-sm bg-primary/10 text-primary">EMP-10024</span>
                  <span className="px-2.5 py-1 rounded-full text-label-sm bg-surface-container text-on-surface-variant">Science Dept.</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-4 py-2 border border-outline-variant rounded-lg text-label-md hover:bg-surface-container transition-colors"><span className="material-symbols-outlined text-[18px]">chat</span>Message</button>
                <button className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg text-label-md hover:bg-primary-container transition-colors"><span className="material-symbols-outlined text-[18px]">edit</span>Edit Profile</button>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-outline-variant/30">
          {[{label:'Total Students',value:'102',icon:'groups'},{label:'Classes',value:'3',icon:'class'},{label:'Attendance Rate',value:'91%',icon:'how_to_reg'},{label:'Years of Service',value:'8 yrs',icon:'workspace_premium'}].map(s=>(
            <div key={s.label} className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center"><span className="material-symbols-outlined text-primary text-[20px]">{s.icon}</span></div><div><p className="font-headline-md text-headline-md text-on-surface">{s.value}</p><p className="text-label-sm text-on-surface-variant">{s.label}</p></div></div>
          ))}
        </div>
      </div>
      <div className="flex gap-1 mb-stack-lg bg-surface-container p-1 rounded-xl w-fit">
        {(['profile','classes','activity'] as const).map(t=>(
          <button key={t} onClick={()=>setTab(t)} className={`px-4 py-2 rounded-lg text-label-md capitalize transition-all ${tab===t?'bg-white text-primary font-bold shadow-sm':'text-on-surface-variant hover:text-on-surface'}`}>{t}</button>
        ))}
      </div>
      {tab==='profile' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-outline-variant/30 p-stack-md">
            <h3 className="font-headline-md text-on-surface mb-4">Contact Information</h3>
            <div className="space-y-3">
              {[{icon:'mail',label:'Email',value:'j.anderson@safereach.school'},{icon:'phone',label:'Phone',value:'+91 98765 43210'},{icon:'location_on',label:'Address',value:'42, Sunrise Colony, Mumbai – 400001'},{icon:'cake',label:'Date of Birth',value:'March 14, 1985'},{icon:'badge',label:'Joined',value:'June 2017'}].map(i=>(
                <div key={i.label} className="flex items-start gap-3"><span className="material-symbols-outlined text-outline text-[20px] mt-0.5">{i.icon}</span><div><p className="text-label-sm text-on-surface-variant">{i.label}</p><p className="text-body-md text-on-surface">{i.value}</p></div></div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-outline-variant/30 p-stack-md">
            <h3 className="font-headline-md text-on-surface mb-4">Qualifications &amp; Skills</h3>
            <div className="space-y-3">
              {[{icon:'school',label:'Education',value:'M.Sc Mathematics, Delhi University'},{icon:'workspace_premium',label:'Certifications',value:'B.Ed, National Teaching Award 2022'},{icon:'translate',label:'Languages',value:'English, Hindi, Marathi'},{icon:'interests',label:'Specialization',value:'Algebra, Calculus, Statistics'}].map(i=>(
                <div key={i.label} className="flex items-start gap-3"><span className="material-symbols-outlined text-outline text-[20px] mt-0.5">{i.icon}</span><div><p className="text-label-sm text-on-surface-variant">{i.label}</p><p className="text-body-md text-on-surface">{i.value}</p></div></div>
              ))}
            </div>
          </div>
        </div>
      )}
      {tab==='classes' && (
        <div className="space-y-3">
          {classes.map(c=>(
            <div key={c.name} className="bg-white rounded-xl shadow-sm border border-outline-variant/30 p-stack-md flex flex-col md:flex-row md:items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary-container flex items-center justify-center shrink-0"><span className="material-symbols-outlined text-primary">class</span></div>
              <div className="flex-1"><h4 className="font-label-md font-bold text-on-surface">{c.name}</h4><div className="flex flex-wrap gap-3 mt-1 text-label-sm text-on-surface-variant"><span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">groups</span>{c.students} students</span><span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">location_on</span>{c.room}</span><span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">schedule</span>{c.time}</span></div></div>
              <div className="flex items-center gap-3"><div className="text-right"><p className="text-label-sm text-on-surface-variant">Avg Attendance</p><p className="font-bold text-green-600 font-label-md">{c.attendance}</p></div><button className="text-primary hover:bg-primary-container p-2 rounded-lg transition-colors"><span className="material-symbols-outlined text-[18px]">open_in_new</span></button></div>
            </div>
          ))}
        </div>
      )}
      {tab==='activity' && (
        <div className="bg-white rounded-xl shadow-sm border border-outline-variant/30 p-stack-md">
          <h3 className="font-headline-md text-on-surface mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {activities.map((a,i)=>(
              <div key={i} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center shrink-0"><span className={`material-symbols-outlined text-[18px] ${a.color}`}>{a.icon}</span></div>
                <div className="flex-1 pt-0.5"><p className="text-body-md text-on-surface">{a.text}</p><p className="text-label-sm text-on-surface-variant">{a.time}</p></div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
