'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

const teachers = [
  {name:'Elena Smith',id:'GT-8821',assignment:'Grade 4 - Orion',backup:'Marcus Kane',status:'On Duty',stCls:'bg-secondary/10 text-secondary',stIcon:'',pulse:true,alert:false,img:'https://lh3.googleusercontent.com/aida-public/AB6AXuBwpHjk_InZRgzb9jb2RFTXzQbtUCvUUj3x-z3-Qs-V_6Wzt3fFbG6sUCTkttcpm1LhHDOTM6PlLxAqHQOh0d4Pz8Z8RiaArrD0zFwhWBFE5O2-deTWv6Z48oahdJU-VXQuyBC0Fn7paWCbRX2oOOiJlEefr6gLh_-2yHLnb9ypaPqXZYxxUCt3z_CM58UhkHUdVDlaNsjO9TSfSWvD2-18lHMKIc3dEm3XPDBH3N7K1uxBZ4ysPRgFS4zVf7ZFttxEz3tdO0xXGzDK'},
  {name:'Julian Thorne',id:'GT-9102',assignment:'Bus Route 12-A',backup:'Sarah Lee',status:'In Transit',stCls:'bg-secondary-fixed text-on-secondary-fixed-variant',stIcon:'directions_bus',pulse:false,alert:false,img:'https://lh3.googleusercontent.com/aida-public/AB6AXuB1ov_3zYe06Rtg60RxGPoGp_htRwBA5u3sR-Bz-OnmNNZidF9axj_STVf-XbXy_C3kA6gpp6VxvRNLQdZ0_N9yVWJBQM2u6VlERDfz4DHpHaklWtfoavlHhu-qKHYPfjQVBENL5wvjG00KS4dS_utsBevv7ijPrWH-va3BiRcff_w0IuhyHv0gSg9NHhshdURLSPCIK39hICWJr8529E74xLM8Fef6ZSj4HtE8e-vXqgcfhcmW4gSRSxIb8o9vpe63l-fMTwBrD99f'},
  {name:'Clara White',id:'GT-6610',assignment:'Grade 2 - Aurora',backup:'Robert Hayes',status:'Sick Leave',stCls:'bg-error-container text-on-error-container',stIcon:'medical_services',pulse:false,alert:true,img:'https://lh3.googleusercontent.com/aida-public/AB6AXuCHsEZrA2N27uGzDQSGm6Mqi3ZmTxJKZLAH3mAwbSmTAzB87KungF3Zc2mau8IOX4IQXhpARdTpILbuVBT-9ueZ_bmTdL2Z1l5fiFyHP8ye3rt4y3qeTtTJOTup2aIoGj_XOpj6WHxbVf231AdJVvkozVIl0Y1DfgRUnCkCvd3kU5nhij9t3gErVuwv9sThdoFS0q07bWbOYwPx_-Sia9dfadpr9ggKVOuC0z5DN1-iDJwVv2IFPf_CusjwDn8xhuv3Ns9onQqJKk5I'},
  {name:'David Ng',id:'GT-7729',assignment:'Science Lab 3',backup:'Aria Miller',status:'On Duty',stCls:'bg-secondary/10 text-secondary',stIcon:'',pulse:true,alert:false,img:'https://lh3.googleusercontent.com/aida-public/AB6AXuDIb_uiWTCP8bZM9V9fghjWCG8bZyri2QFSTeohENELGljkUk_0sQ9oXKHl2tk0ZR-9HX6D2zZhnVi6Xw--msK1hbBkQ8TnnJRZcrzFRlp0Vf0Xsb1LsWnbyuBD8u3zdHUvMJQqNvkbatcVnDG0-1xWRBKnK6f0_lEGQPALCbWObo_goEZ4hcwWRNVfDqphb8Z33-tCjZAd8GHl4sfyp3luuN3htkbCTNC8u3BNySrYmN7_i3oAch72rStmBPpZzILx597UEVdciMBh'},
];

export default function AdminTeachersPage() {
  const [setupItems, setSetupItems] = useState([
    { className: 'Class 4', section: 'A', incharge: 'Elena Smith' },
    { className: 'Class 4', section: 'B', incharge: 'David Ng' },
    { className: 'Class 6', section: 'A', incharge: 'Clara White' },
  ]);
  const [teacherList, setTeacherList] = useState(teachers);
  const [draftClass, setDraftClass] = useState('Class 1');
  const [draftSection, setDraftSection] = useState('A');
  const [draftTeacher, setDraftTeacher] = useState(teachers[0].name);
  const [newTeacherName, setNewTeacherName] = useState('');
  const [newTeacherEmail, setNewTeacherEmail] = useState('');
  const [newTeacherPassword, setNewTeacherPassword] = useState('');

  const unassignedCount = useMemo(() => setupItems.filter(item => item.incharge === 'Not assigned').length, [setupItems]);

  function addTeacher(event: React.FormEvent) {
    event.preventDefault();
    if (!newTeacherName.trim()) return;
    const teacher = {
      name: newTeacherName.trim(),
      id: `GT-${Math.floor(1000 + Math.random() * 8999)}`,
      assignment: 'Awaiting class assignment',
      backup: 'School Admin',
      status: 'On Duty',
      stCls: 'bg-secondary/10 text-secondary',
      stIcon: '',
      pulse: true,
      alert: false,
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBwpHjk_InZRgzb9jb2RFTXzQbtUCvUUj3x-z3-Qs-V_6Wzt3fFbG6sUCTkttcpm1LhHDOTM6PlLxAqHQOh0d4Pz8Z8RiaArrD0zFwhWBFE5O2-deTWv6Z48oahdJU-VXQuyBC0Fn7paWCbRX2oOOiJlEefr6gLh_-2yHLnb9ypaPqXZYxxUCt3z_CM58UhkHUdVDlaNsjO9TSfSWvD2-18lHMKIc3dEm3XPDBH3N7K1uxBZ4ysPRgFS4zVf7ZFttxEz3tdO0xXGzDK',
    };
    setTeacherList(current => [teacher, ...current]);
    setDraftTeacher(teacher.name);
    setNewTeacherName('');
    setNewTeacherEmail('');
    setNewTeacherPassword('');
  }

  function saveClassSection(event: React.FormEvent) {
    event.preventDefault();
    setSetupItems(current => {
      const exists = current.some(item => item.className === draftClass && item.section === draftSection);
      if (exists) {
        return current.map(item => item.className === draftClass && item.section === draftSection ? { ...item, incharge: draftTeacher } : item);
      }
      return [...current, { className: draftClass, section: draftSection, incharge: draftTeacher }];
    });
  }

  return (
    <div className="p-container-padding-mobile md:p-container-padding-desktop">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-stack-lg gap-stack-md">
        <div><h1 className="text-headline-lg font-headline-lg text-primary">Staff Directory</h1><p className="text-body-md text-on-surface-variant">Manage teacher assignments, availability, and safety protocols.</p></div>
        <a href="#add-teacher" className="bg-primary text-on-primary h-[48px] px-stack-lg rounded-lg font-bold flex items-center gap-stack-sm hover:shadow-lg transition-shadow"><span className="material-symbols-outlined">person_add</span>Add New Teacher</a>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter mb-stack-lg">
        {[{label:'Total Staff',value:String(teacherList.length),sub:'+2 this week',border:'border-primary',icon:'groups',iconCls:'text-primary-container bg-primary/10'},{label:'Active Duty',value:String(teacherList.filter(t => t.status === 'On Duty').length),sub:'Available',border:'border-secondary',icon:'check_circle',iconCls:'text-secondary bg-secondary/10'},{label:'On Leave',value:String(teacherList.filter(t => t.status.includes('Leave')).length),sub:'Scheduled',border:'border-tertiary-fixed-dim',icon:'event_busy',iconCls:'text-tertiary bg-tertiary/10'},{label:'Unassigned Classes',value:String(unassignedCount),sub:'Action Required',border:'border-error',icon:'warning',iconCls:'text-error bg-error/10',alert:unassignedCount>0}].map(c=>(
          <div key={c.label} className={`bg-surface-container-lowest p-stack-md rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.12)] border-l-4 ${c.border}`}>
            <div className="flex justify-between items-start"><span className={`material-symbols-outlined p-2 ${c.iconCls} rounded-lg`}>{c.icon}</span><span className={`text-label-sm font-bold ${c.alert?'text-error':'text-on-surface-variant'}`}>{c.sub}</span></div>
            <div className="mt-stack-sm"><p className="text-label-md text-on-surface-variant">{c.label}</p><h3 className={`text-headline-md font-bold ${c.alert?'text-error':'text-primary'}`}>{c.value}</h3></div>
          </div>
        ))}
      </div>
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-gutter mb-stack-lg">
        <form id="add-teacher" onSubmit={addTeacher} className="bg-white rounded-xl border border-outline-variant/50 shadow-sm p-stack-md">
          <h2 className="font-headline-md text-headline-md text-primary mb-2">Add Teacher Login</h2>
          <p className="text-label-md text-on-surface-variant mb-4">School admin can create teacher details and password before assigning a class section.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input value={newTeacherName} onChange={e => setNewTeacherName(e.target.value)} required className="px-4 py-3 bg-surface-container border border-outline-variant rounded-lg" placeholder="Teacher name" />
            <input value={newTeacherEmail} onChange={e => setNewTeacherEmail(e.target.value)} type="email" className="px-4 py-3 bg-surface-container border border-outline-variant rounded-lg" placeholder="Teacher email" />
            <input value={newTeacherPassword} onChange={e => setNewTeacherPassword(e.target.value)} type="password" minLength={8} className="px-4 py-3 bg-surface-container border border-outline-variant rounded-lg" placeholder="Password" />
          </div>
          <button type="submit" className="mt-4 inline-flex items-center gap-2 px-5 py-3 bg-primary text-on-primary rounded-lg font-bold hover:opacity-90">
            <span className="material-symbols-outlined text-[20px]">person_add</span>
            Save Teacher
          </button>
        </form>

        <form onSubmit={saveClassSection} className="bg-white rounded-xl border border-outline-variant/50 shadow-sm p-stack-md">
          <h2 className="font-headline-md text-headline-md text-primary mb-2">Create Class / Section Incharge</h2>
          <p className="text-label-md text-on-surface-variant mb-4">Select an existing teacher from the listbox to assign as class-section incharge.</p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <select value={draftClass} onChange={e => setDraftClass(e.target.value)} className="px-4 py-3 bg-surface-container border border-outline-variant rounded-lg">
              {Array.from({ length: 12 }, (_, index) => `Class ${index + 1}`).map(item => <option key={item}>{item}</option>)}
            </select>
            <select value={draftSection} onChange={e => setDraftSection(e.target.value)} className="px-4 py-3 bg-surface-container border border-outline-variant rounded-lg">
              {['A', 'B', 'C', 'D'].map(item => <option key={item}>{item}</option>)}
            </select>
            <select value={draftTeacher} onChange={e => setDraftTeacher(e.target.value)} className="md:col-span-2 px-4 py-3 bg-surface-container border border-outline-variant rounded-lg">
              {teacherList.map(teacher => <option key={teacher.id} value={teacher.name}>{teacher.name}</option>)}
            </select>
          </div>
          <button type="submit" className="mt-4 inline-flex items-center gap-2 px-5 py-3 bg-secondary text-on-secondary rounded-lg font-bold hover:opacity-90">
            <span className="material-symbols-outlined text-[20px]">assignment_ind</span>
            Save Assignment
          </button>
        </form>
      </section>

      <section className="bg-white rounded-xl border border-outline-variant/50 shadow-sm p-stack-md mb-stack-lg">
        <h2 className="font-headline-md text-headline-md text-primary mb-4">Class Section Assignments</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {setupItems.map(item => (
            <div key={`${item.className}-${item.section}`} className="rounded-xl border border-outline-variant p-4 bg-surface-container-low">
              <p className="font-bold text-primary">{item.className} - Section {item.section}</p>
              <p className="text-label-md text-on-surface-variant">Incharge: <span className="font-bold text-on-surface">{item.incharge}</span></p>
            </div>
          ))}
        </div>
      </section>
      <div className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.12)] overflow-hidden">
        <div className="p-stack-md border-b border-surface-container flex flex-wrap gap-stack-md justify-between items-center">
          <div className="flex gap-stack-sm overflow-x-auto pb-2 sm:pb-0">
            <button className="px-4 py-1.5 bg-primary-container text-on-primary-container rounded-full text-label-md font-bold">All Staff</button>
            {['On Duty','In Transit','On Leave'].map(f=><button key={f} className="px-4 py-1.5 bg-surface-container-high text-on-surface-variant rounded-full text-label-md hover:bg-surface-variant">{f}</button>)}
          </div>
          <div className="flex items-center gap-stack-sm"><span className="text-label-sm text-on-surface-variant">Auto-Backup:</span><div className="w-12 h-6 bg-secondary rounded-full relative cursor-pointer"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div></div><span className="text-label-sm font-bold text-secondary">ENABLED</span></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low">
              <tr>{['Staff Member','Primary Assignment','Backup','Current Status','Actions'].map(h=><th key={h} className="p-stack-md font-label-md text-on-surface-variant">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {teacherList.map(t=>(
                <tr key={t.id} className={`${t.alert?'bg-error/5 hover:bg-error/10 border-l-4 border-error':'hover:bg-surface-bright'} transition-colors group`}>
                  <td className="p-stack-md"><div className="flex items-center gap-stack-md"><div className={`w-10 h-10 rounded-full overflow-hidden border-2 ${t.alert?'border-error/50':'border-primary/20'}`}><img alt={t.name} src={t.img} className="w-full h-full object-cover" /></div><div><p className="font-bold text-on-surface">{t.name}</p><p className={`text-label-sm ${t.alert?'text-error font-bold':'text-on-surface-variant'}`}>{t.alert?'EMERGENCY LEAVE':`ID: ${t.id}`}</p></div></div></td>
                  <td className="p-stack-md"><span className={`px-2 py-1 ${t.alert?'bg-surface-container-high text-on-surface-variant opacity-50':'bg-primary/5 text-primary border border-primary/20'} rounded text-label-sm font-bold`}>{t.assignment}</span></td>
                  <td className="p-stack-md"><div className="flex items-center gap-2"><div className={`w-6 h-6 rounded-full ${t.alert?'bg-primary-container text-white':'bg-surface-container-high'} flex items-center justify-center text-[10px]`}>{t.backup.split(' ').map(w=>w[0]).join('')}</div><span className={`text-body-md ${t.alert?'font-bold text-primary':''}`}>{t.backup}</span></div></td>
                  <td className="p-stack-md"><span className={`px-3 py-1 ${t.stCls} rounded-full text-label-sm font-bold flex items-center w-fit gap-1`}>{t.stIcon?<span className="material-symbols-outlined text-[14px]">{t.stIcon}</span>:t.pulse&&<span className="w-2 h-2 bg-secondary rounded-full animate-pulse"></span>}{t.status}</span></td>
                  <td className="p-stack-md text-right">{t.alert?<button className="bg-primary-container text-white px-3 py-1 rounded text-label-sm hover:bg-primary transition-colors">Reassign</button>:<Link href="/admin/teachers/profile" className="text-primary hover:bg-primary-container p-1.5 rounded-lg transition-colors inline-flex"><span className="material-symbols-outlined text-[18px]">open_in_new</span></Link>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-stack-md bg-surface-container-low flex justify-between items-center border-t border-surface-container">
          <span className="text-label-md text-on-surface-variant">Showing 1-10 of 124 teachers</span>
          <div className="flex gap-2">
            <button className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant hover:bg-surface-container-high"><span className="material-symbols-outlined text-sm">chevron_left</span></button>
            <button className="w-8 h-8 flex items-center justify-center rounded bg-primary text-on-primary font-bold text-label-md">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant hover:bg-surface-container-high text-label-md">2</button>
            <button className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant hover:bg-surface-container-high text-label-md">3</button>
            <button className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant hover:bg-surface-container-high"><span className="material-symbols-outlined text-sm">chevron_right</span></button>
          </div>
        </div>
      </div>
    </div>
  );
}
