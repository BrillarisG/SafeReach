'use client';

import { useState } from 'react';
import { downloadTextFile } from '@/lib/downloadFile';

const teacherStudentSeed = [
  {name:'Liam Sanders',sub:'Emergency: Severe Nut Allergy',id:'#STU-2024-001',grade:'Grade 4-B',status:'At School',stCls:'bg-secondary-container/10 text-secondary border-secondary/20',guardian:'+1 (555) 012-3456',gSub:'Mother: Sarah S.',activity:'08:15 AM - Scanned Gate 2',img:'https://lh3.googleusercontent.com/aida-public/AB6AXuAWO8HpwwBhmeoajB7xWCMFKNJe3sw2BzJjZseSxmUMujJcYruCpH-zH5un-iKCmQ-Ys0Vgs3FqNTMYzOqsICx5AonWuC-QkildK8bDQ6NnDXJA1EKLuX6P4rjcRkY6ATnb8VQapagNpTBA8gIC2g4gwKfxil7G9-ynMmGALAh43c10wCR9D985t1MvUMfAHeZyNrFZanObrllIiGCBVFRDBYOZ2aVLOqYCu4Gc2SgEPOrv4WvLxL1s_d_60yhwdOBVu-uXPY7Csh7G'},
  {name:'Emma Wilson',sub:'Bus Route: Blue-04',id:'#STU-2024-042',grade:'Grade 4-B',status:'At School',stCls:'bg-secondary-container/10 text-secondary border-secondary/20',guardian:'+1 (555) 019-8765',gSub:'Father: David W.',activity:'08:42 AM - Boarded Bus',img:'https://lh3.googleusercontent.com/aida-public/AB6AXuDKYjhFHwFby-I4AxXL3_yQ4HhhNlxzg5iFsN2KblMzVL3HfYnX71sJGy_tXXJUEHW7NQpnXj4B9V537V3L_PTdk6Zk9wDBNenHcyaYLa6ZqzyOgAGnCJLaWq9ETE01p5_uu1O7IYKodtoIf84K8niIgo6yFyt1zycWYk8wfWoHHbIWAmjVKJwScRiEoOIIyoXFzR9-bBiOI4oEBEetUuP0HTVo7hzwih5H6oFpHm69_UQR1qZNARQF7iH1IOQiFo7WQxABoFBOJyWl'},
  {name:'Noah Miller',sub:'Unscheduled Absence',id:'#STU-2024-118',grade:'Grade 4-B',status:'Missing Scan',stCls:'bg-error-container/20 text-error border-error/20',guardian:'+1 (555) 021-4433',gSub:'Mother: Elena M.',activity:'08:30 AM - Expected Scan Missed',img:'https://lh3.googleusercontent.com/aida-public/AB6AXuCH8Az-PUmdL9SFLne5JMWPM6oXADroU8AQNhjXmPxN9XJe7xiZe3aWuWgoGudhVQlEKZHSAWSXQyxFrtp1I_84w5-SUpme-DgdzF3KlO7wgXEMJTJd8U0rKsETSCMgb7lRXctdWPSSVRQYD_G1VPTkYWMYH0xq0kZ_0WkO7FnQLUYxbz5LUsCqHWKuhuR3j2EP5mE4QLgC1beFM8eThcy03SKZZ7Xi3QVCtBmE4XTKpofCZvHvdx7PUFesWTxCvTkrtegWlEQuc8_j',alert:true},
];

export default function TeacherStudentsPage() {
  const [teacherStudents, setTeacherStudents] = useState(teacherStudentSeed);
  const assignedClass = 'Grade 4-B';

  function downloadTemplate() {
    downloadTextFile(
      'safereach-teacher-student-template.csv',
      'student_name,student_id,class_name,section,roll_no,attendance_status,guardian_name,guardian_phone\n',
      'text/csv'
    );
  }

  function addStudent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get('name') ?? '').trim();
    const guardian = String(form.get('guardian') ?? '').trim();
    const phone = String(form.get('phone') ?? '').trim();
    if (!name) return;
    setTeacherStudents(current => [
      {
        name,
        sub: 'Added by class incharge',
        id: `#STU-${Math.floor(1000 + Math.random() * 8999)}`,
        grade: assignedClass,
        status: 'At School',
        stCls: 'bg-secondary-container/10 text-secondary border-secondary/20',
        guardian: phone || '+1 (555) 000-0000',
        gSub: guardian || 'Guardian: Pending',
        activity: 'New record created by class incharge',
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAWO8HpwwBhmeoajB7xWCMFKNJe3sw2BzJjZseSxmUMujJcYruCpH-zH5un-iKCmQ-Ys0Vgs3FqNTMYzOqsICx5AonWuC-QkildK8bDQ6NnDXJA1EKLuX6P4rjcRkY6ATnb8VQapagNpTBA8gIC2g4gwKfxil7G9-ynMmGALAh43c10wCR9D985t1MvUMfAHeZyNrFZanObrllIiGCBVFRDBYOZ2aVLOqYCu4Gc2SgEPOrv4WvLxL1s_d_60yhwdOBVu-uXPY7Csh7G',
      },
      ...current,
    ]);
    event.currentTarget.reset();
  }

  function editStudent(studentId: string) {
    setTeacherStudents(current => current.map(student => student.id === studentId ? { ...student, status: 'Teacher Updated', activity: 'Edited by class incharge teacher', stCls: 'bg-primary/10 text-primary border-primary/20' } : student));
  }

  function removeStudent(studentId: string) {
    setTeacherStudents(current => current.filter(student => student.id !== studentId));
  }

  return (
    <div className="p-container-padding-desktop flex flex-col gap-stack-lg">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-stack-md">
        <div><h2 className="font-headline-lg text-headline-lg text-primary">Student Records Management</h2><p className="text-on-surface-variant font-body-md">Manage 2,482 registered students and their live tracking status.</p></div>
        <div className="flex items-center gap-3">
          <button onClick={downloadTemplate} className="px-5 py-3 border border-outline text-on-surface font-label-md rounded-lg flex items-center gap-2 hover:bg-surface-container-high transition-all"><span className="material-symbols-outlined">download</span>Download Template</button>
          <button className="px-5 py-3 bg-secondary text-on-secondary font-label-md rounded-lg flex items-center gap-2 hover:opacity-90 transition-all shadow-md"><span className="material-symbols-outlined">upload_file</span>Upload Excel</button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-stack-md">
        {[{icon:'group',bg:'bg-primary-container/10',c:'text-primary',label:'Assigned Class',value:assignedClass},
          {icon:'school',bg:'bg-secondary-container/20',c:'text-secondary',label:'Students',value:String(teacherStudents.length)},
          {icon:'edit_note',bg:'bg-tertiary-fixed/40',c:'text-tertiary-fixed-dim',label:'Access',value:'Incharge'},
          {icon:'warning',bg:'bg-error-container/40',c:'text-error',label:'Alerts/Missing',value:String(teacherStudents.filter(student => student.alert).length),border:true}
        ].map(s=>(
          <div key={s.label} className={`bg-surface p-stack-md rounded-xl border border-outline-variant shadow-sm flex items-center gap-stack-md ${s.border?'border-l-4 border-l-error':''}`}>
            <div className={`w-12 h-12 rounded-full ${s.bg} flex items-center justify-center ${s.c}`}><span className="material-symbols-outlined">{s.icon}</span></div>
            <div><p className="text-on-surface-variant text-label-sm uppercase tracking-wider">{s.label}</p><p className={`text-2xl font-bold ${s.border?'text-error':''}`}>{s.value}</p></div>
          </div>
        ))}
      </div>
      <form onSubmit={addStudent} className="bg-surface rounded-xl border border-outline-variant shadow-sm p-stack-md">
        <div className="flex flex-col lg:flex-row lg:items-end gap-stack-md">
          <div className="flex-1">
            <h3 className="font-headline-md text-headline-md text-primary">Add Student to Assigned Class</h3>
            <p className="text-label-md text-on-surface-variant">Only the class incharge teacher can add students to {assignedClass} in this frontend flow.</p>
          </div>
          <input name="name" required className="px-4 py-3 bg-surface-container border border-outline-variant rounded-lg" placeholder="Student name" />
          <input name="guardian" className="px-4 py-3 bg-surface-container border border-outline-variant rounded-lg" placeholder="Guardian name" />
          <input name="phone" className="px-4 py-3 bg-surface-container border border-outline-variant rounded-lg" placeholder="Guardian phone" />
          <button type="submit" className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-primary text-on-primary rounded-lg font-bold hover:opacity-90">
            <span className="material-symbols-outlined text-[20px]">person_add</span>
            Add
          </button>
        </div>
      </form>
      <div className="bg-surface rounded-xl border border-outline-variant shadow-sm overflow-hidden flex flex-col">
        <div className="p-stack-md flex flex-col md:flex-row md:items-center justify-between gap-stack-md border-b border-outline-variant">
          <div className="flex items-center gap-4">
            <div className="relative"><span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">filter_list</span><select className="pl-10 pr-8 py-2 bg-surface-container-low border-outline-variant rounded-lg font-label-md focus:ring-primary focus:border-primary appearance-none"><option>All Grades</option><option>Kindergarten</option><option>Primary (1-5)</option><option>Middle (6-8)</option></select></div>
            <div className="relative"><span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">location_on</span><select className="pl-10 pr-8 py-2 bg-surface-container-low border-outline-variant rounded-lg font-label-md focus:ring-primary focus:border-primary appearance-none"><option>All Zones</option><option>North Sector</option><option>East Sector</option></select></div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-lg"><span className="material-symbols-outlined">view_column</span></button>
            <button className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-lg"><span className="material-symbols-outlined">print</span></button>
          </div>
        </div>
        <div className="student-table-container overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low sticky top-0">
              <tr><th className="p-4 w-12"><input className="rounded text-primary focus:ring-primary" type="checkbox" /></th>{['Student Name','Student ID','Grade / Section','Tracking Status','Guardian Contact','Last Activity',''].map(h=><th key={h} className="p-4 font-label-md text-label-sm text-on-surface-variant uppercase tracking-wider">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {teacherStudents.map((s)=>(
                <tr key={s.id} className={`hover:bg-surface-container-lowest transition-colors group ${s.alert?'border-l-4 border-l-error':''}`}>
                  <td className="p-4"><input className="rounded text-primary focus:ring-primary" type="checkbox" /></td>
                  <td className="p-4"><div className="flex items-center gap-3"><img alt={s.name} className="w-10 h-10 rounded-full bg-surface-container" src={s.img} /><div><p className="font-bold text-on-surface">{s.name}</p><p className={`text-xs ${s.alert?'text-error font-bold':'text-on-surface-variant'}`}>{s.sub}</p></div></div></td>
                  <td className="p-4 text-on-surface-variant font-label-md">{s.id}</td>
                  <td className="p-4"><span className="px-2 py-1 bg-surface-container-high rounded text-xs font-bold text-on-surface">{s.grade}</span></td>
                  <td className="p-4"><div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${s.stCls}`}><span className="w-2 h-2 rounded-full bg-current"></span><span className="text-xs font-bold uppercase tracking-tighter">{s.status}</span></div></td>
                  <td className="p-4"><p className="font-label-md">{s.guardian}</p><p className="text-xs text-on-surface-variant">{s.gSub}</p></td>
                  <td className={`p-4 text-xs ${s.alert?'text-error font-bold':'text-on-surface-variant'}`}>{s.activity}</td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => editStudent(s.id)} className="px-3 py-2 rounded-lg bg-primary/10 text-primary font-bold">Edit</button>
                      <button type="button" onClick={() => removeStudent(s.id)} className="px-3 py-2 rounded-lg bg-error-container text-error font-bold">Remove</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-stack-md flex items-center justify-between border-t border-outline-variant bg-surface">
          <p className="text-label-md text-on-surface-variant">Showing assigned {assignedClass} students only</p>
          <div className="flex items-center gap-1">
            <button className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-lg opacity-30" disabled><span className="material-symbols-outlined">chevron_left</span></button>
            <button className="w-8 h-8 flex items-center justify-center bg-primary text-on-primary rounded-lg font-bold text-sm">1</button>
            <button className="w-8 h-8 flex items-center justify-center hover:bg-surface-container-high rounded-lg font-bold text-sm">2</button>
            <button className="w-8 h-8 flex items-center justify-center hover:bg-surface-container-high rounded-lg font-bold text-sm">3</button>
            <button className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-lg"><span className="material-symbols-outlined">chevron_right</span></button>
          </div>
        </div>
      </div>
    </div>
  );
}
