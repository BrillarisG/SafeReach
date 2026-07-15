'use client';

import Link from '@/src/next-link';
import { useEffect, useMemo, useState } from 'react';
import { downloadTextFile } from '@/lib/downloadFile';

type TeacherStudent = {
  name: string;
  sub: string;
  id: string;
  grade: string;
  status: string;
  stCls: string;
  guardian: string;
  gSub: string;
  activity: string;
  img: string;
  alert?: boolean;
  parentSmsEnabled?: boolean;
};

type StudentFormState = {
  name: string;
  guardian: string;
  phone: string;
  note: string;
  status: 'At School' | 'In Transit' | 'Missing Scan' | 'Teacher Updated';
  parentSmsEnabled: boolean;
};

const STORAGE_KEY = 'safereach_teacher_students_grade_4b';
const assignedClass = 'Grade 4-B';
const fallbackImage = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAWO8HpwwBhmeoajB7xWCMFKNJe3sw2BzJjZseSxmUMujJcYruCpH-zH5un-iKCmQ-Ys0Vgs3FqNTMYzOqsICx5AonWuC-QkildK8bDQ6NnDXJA1EKLuX6P4rjcRkY6ATnb8VQapagNpTBA8gIC2g4gwKfxil7G9-ynMmGALAh43c10wCR9D985t1MvUMfAHeZyNrFZanObrllIiGCBVFRDBYOZ2aVLOqYCu4Gc2SgEPOrv4WvLxL1s_d_60yhwdOBVu-uXPY7Csh7G';

const teacherStudentSeed: TeacherStudent[] = [
  { name: 'Liam Sanders', sub: 'Emergency: Severe Nut Allergy', id: '#STU-2024-001', grade: assignedClass, status: 'At School', stCls: 'bg-secondary-container/10 text-secondary border-secondary/20', guardian: '+1 (555) 012-3456', gSub: 'Mother: Sarah S.', activity: '08:15 AM - Scanned Gate 2', img: fallbackImage },
  { name: 'Emma Wilson', sub: 'Bus Route: Blue-04', id: '#STU-2024-042', grade: assignedClass, status: 'At School', stCls: 'bg-secondary-container/10 text-secondary border-secondary/20', guardian: '+1 (555) 019-8765', gSub: 'Father: David W.', activity: '08:42 AM - Boarded Bus', img: fallbackImage },
  { name: 'Noah Miller', sub: 'Unscheduled Absence', id: '#STU-2024-118', grade: assignedClass, status: 'Missing Scan', stCls: 'bg-error-container/20 text-error border-error/20', guardian: '+1 (555) 021-4433', gSub: 'Mother: Elena M.', activity: '08:30 AM - Expected Scan Missed', img: fallbackImage, alert: true },
];

const emptyForm: StudentFormState = {
  name: '',
  guardian: '',
  phone: '',
  note: '',
  status: 'At School',
  parentSmsEnabled: true,
};

function statusClass(status: StudentFormState['status']) {
  if (status === 'Missing Scan') return 'bg-error-container/20 text-error border-error/20';
  if (status === 'In Transit') return 'bg-blue-100 text-blue-700 border-blue-200';
  if (status === 'Teacher Updated') return 'bg-primary/10 text-primary border-primary/20';
  return 'bg-secondary-container/10 text-secondary border-secondary/20';
}

function safeReadStudents() {
  if (typeof window === 'undefined') return teacherStudentSeed;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]') as TeacherStudent[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : teacherStudentSeed;
  } catch {
    return teacherStudentSeed;
  }
}

function buildStudent(form: StudentFormState, id?: string): TeacherStudent {
  const studentId = id ?? `#STU-${Date.now().toString().slice(-6)}`;
  return {
    name: form.name.trim(),
    sub: form.note.trim() || 'Added by class incharge',
    id: studentId,
    grade: assignedClass,
    status: form.status,
    stCls: statusClass(form.status),
    guardian: form.phone.trim() || '+1 (555) 000-0000',
    gSub: form.guardian.trim() ? `Guardian: ${form.guardian.trim()}` : 'Guardian: Pending',
    activity: id ? 'Record edited by class incharge teacher' : 'New record created by class incharge teacher',
    img: fallbackImage,
    alert: form.status === 'Missing Scan',
    parentSmsEnabled: form.parentSmsEnabled,
  };
}

function formFromStudent(student: TeacherStudent): StudentFormState {
  return {
    name: student.name,
    guardian: student.gSub.replace(/^Guardian:\s*/, '').replace(/^(Mother|Father):\s*/, ''),
    phone: student.guardian,
    note: student.sub,
    status: (['At School', 'In Transit', 'Missing Scan', 'Teacher Updated'].includes(student.status) ? student.status : 'Teacher Updated') as StudentFormState['status'],
    parentSmsEnabled: student.parentSmsEnabled ?? true,
  };
}

type TeacherStudentsPageProps = {
  mode?: 'full' | 'dashboard' | 'add';
};

export default function TeacherStudentsPage({ mode = 'full' }: TeacherStudentsPageProps = {}) {
  const dashboardMode = mode === 'dashboard';
  const addMode = mode === 'add';
  const [teacherStudents, setTeacherStudents] = useState<TeacherStudent[]>(teacherStudentSeed);
  const [formState, setFormState] = useState<StudentFormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notice, setNotice] = useState('Only assigned class students can be added, edited, or removed in this frontend demo.');

  useEffect(() => {
    setTeacherStudents(safeReadStudents());
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(teacherStudents));
  }, [teacherStudents]);

  const stats = useMemo(() => ({
    students: teacherStudents.length,
    alerts: teacherStudents.filter(student => student.alert).length,
  }), [teacherStudents]);

  function updateForm(key: keyof StudentFormState, value: string) {
    setFormState(current => ({ ...current, [key]: value }));
  }

  function resetForm() {
    setFormState(emptyForm);
    setEditingId(null);
  }

  function downloadTemplate() {
    downloadTextFile(
      'safereach-teacher-student-template.csv',
      'student_name,student_id,class_name,section,roll_no,attendance_status,guardian_name,guardian_phone\n',
      'text/csv'
    );
  }

  function saveStudent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!formState.name.trim()) return;
    if (editingId) {
      setTeacherStudents(current => current.map(student => student.id === editingId ? buildStudent(formState, editingId) : student));
      setNotice(`${formState.name.trim()} updated in ${assignedClass}.`);
    } else {
      setTeacherStudents(current => [buildStudent(formState), ...current]);
      setNotice(`${formState.name.trim()} added to ${assignedClass}.`);
    }
    resetForm();
  }

  function startEdit(student: TeacherStudent) {
    setEditingId(student.id);
    setFormState(formFromStudent(student));
    setNotice(`Editing ${student.name}. Save changes or cancel to return to add mode.`);
  }

  function removeStudent(student: TeacherStudent) {
    if (!window.confirm(`Remove ${student.name} from ${assignedClass}?`)) return;
    setTeacherStudents(current => current.filter(item => item.id !== student.id));
    if (editingId === student.id) resetForm();
    setNotice(`${student.name} removed from the frontend class list.`);
  }

  function simulateUpload() {
    setNotice('Excel upload is a frontend placeholder. Use Add Student for demo records until backend import APIs are created.');
  }

  return (
    <div className="p-container-padding-mobile md:p-container-padding-desktop flex flex-col gap-stack-lg">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-stack-md">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-primary">{addMode ? 'Add Student to Assigned Class' : 'Student Records Management'}</h2>
          <p className="text-on-surface-variant font-body-md">Manage assigned {assignedClass} students and their live tracking status.</p>
        </div>
        {!addMode && (
        <div className="flex items-center justify-end gap-2 sm:gap-3">
          <button onClick={downloadTemplate} title="Download Template" aria-label="Download Template" className="h-10 w-10 sm:h-auto sm:w-auto sm:px-5 sm:py-3 border border-outline text-on-surface font-label-md rounded-lg flex items-center justify-center gap-2 hover:bg-surface-container-high transition-all">
            <span className="material-symbols-outlined">download</span>
            <span className="hidden sm:inline">Download Template</span>
          </button>
          <button onClick={simulateUpload} title="Upload Excel" aria-label="Upload Excel" className="h-10 w-10 sm:h-auto sm:w-auto sm:px-5 sm:py-3 bg-secondary text-on-secondary font-label-md rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-md">
            <span className="material-symbols-outlined">upload_file</span>
            <span className="hidden sm:inline">Upload Excel</span>
          </button>
        </div>
        )}
      </div>

      {!addMode && (
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-stack-md">
        {[
          { icon: 'group', bg: 'bg-primary-container/10', c: 'text-primary', label: 'Assigned Class', value: assignedClass },
          { icon: 'school', bg: 'bg-secondary-container/20', c: 'text-secondary', label: 'Students', value: String(stats.students) },
          { icon: 'edit_note', bg: 'bg-tertiary-fixed/40', c: 'text-tertiary-fixed-dim', label: 'Access', value: 'Incharge / Assistant' },
          { icon: 'warning', bg: 'bg-error-container/40', c: 'text-error', label: 'Alerts/Missing', value: String(stats.alerts), border: true },
        ].map(stat => (
          <div key={stat.label} className={`bg-surface p-3 md:p-stack-md rounded-xl border border-outline-variant shadow-sm flex items-center gap-2 md:gap-stack-md min-w-0 ${stat.border ? 'border-l-4 border-l-error' : ''}`}>
            <div className={`w-9 h-9 md:w-12 md:h-12 rounded-full ${stat.bg} flex items-center justify-center ${stat.c} shrink-0`}>
              <span className="material-symbols-outlined text-[19px] md:text-[24px]">{stat.icon}</span>
            </div>
            <div className="min-w-0">
              <p className="text-on-surface-variant text-[10px] md:text-label-sm uppercase tracking-wider truncate">{stat.label}</p>
              <p className={`text-base md:text-2xl font-bold leading-tight truncate ${stat.border ? 'text-error' : ''}`}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
      )}

      {!dashboardMode && (
      <form onSubmit={saveStudent} className="bg-surface rounded-xl border border-outline-variant shadow-sm p-stack-md">
        <div className="flex flex-col gap-stack-md">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-stack-sm">
            <div className="max-w-3xl">
              <h3 className="font-headline-md text-headline-md text-primary">{editingId ? 'Edit Assigned Student' : 'Add Student to Assigned Class'}</h3>
              <p className="text-label-md text-on-surface-variant">Only the class incharge or assistant incharge teacher can manage students in {assignedClass} in this frontend flow.</p>
            </div>
            {editingId && (
              <button type="button" onClick={resetForm} className="self-start px-4 py-2 rounded-lg border border-outline text-on-surface hover:bg-surface-container">
                Cancel Edit
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[1.2fr_1fr_1fr_1fr_auto] gap-4 items-end">
            <label className="flex flex-col gap-1">
              <span className="text-label-sm font-bold text-on-surface-variant">Student name</span>
              <input value={formState.name} onChange={event => updateForm('name', event.target.value)} required className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-lg" placeholder="Student name" />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-label-sm font-bold text-on-surface-variant">Guardian name</span>
              <input value={formState.guardian} onChange={event => updateForm('guardian', event.target.value)} className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-lg" placeholder="Guardian name" />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-label-sm font-bold text-on-surface-variant">Guardian phone</span>
              <input value={formState.phone} onChange={event => updateForm('phone', event.target.value)} className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-lg" placeholder="Guardian phone" />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-label-sm font-bold text-on-surface-variant">Status</span>
              <select value={formState.status} onChange={event => updateForm('status', event.target.value)} className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-lg">
                <option>At School</option>
                <option>In Transit</option>
                <option>Missing Scan</option>
                <option>Teacher Updated</option>
              </select>
            </label>
            <button type="submit" className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-primary text-on-primary rounded-lg font-bold hover:opacity-90 min-w-[116px]">
              <span className="material-symbols-outlined text-[20px]">{editingId ? 'save' : 'person_add'}</span>
              {editingId ? 'Save' : 'Add'}
            </button>
          </div>
          <label className="flex flex-col gap-1">
            <span className="text-label-sm font-bold text-on-surface-variant">Student note / medical or transport detail</span>
            <input value={formState.note} onChange={event => updateForm('note', event.target.value)} className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-lg" placeholder="Example: Bus Route Blue-04 or allergy note" />
          </label>
          <div className="bg-primary/5 border border-primary/15 rounded-lg px-4 py-3 text-label-md text-primary font-bold">
            {notice}
          </div>
        </div>
      </form>
      )}

      {!addMode && (
      <div className="bg-surface rounded-xl border border-outline-variant shadow-sm overflow-hidden flex flex-col">
        <div className="p-stack-md flex flex-col md:flex-row md:items-center justify-between gap-stack-md border-b border-outline-variant">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">filter_list</span>
              <select className="pl-10 pr-8 py-2 bg-surface-container-low border border-outline-variant rounded-lg font-label-md focus:ring-primary focus:border-primary appearance-none">
                <option>{assignedClass}</option>
                <option>Assigned Class Only</option>
              </select>
            </div>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">location_on</span>
              <select className="pl-10 pr-8 py-2 bg-surface-container-low border border-outline-variant rounded-lg font-label-md focus:ring-primary focus:border-primary appearance-none">
                <option>All Status</option>
                <option>At School</option>
                <option>Missing Scan</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/teacher/students/add" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-on-primary font-bold hover:opacity-90">
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              Add
            </Link>
            <button className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-lg"><span className="material-symbols-outlined">view_column</span></button>
            <button className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-lg"><span className="material-symbols-outlined">print</span></button>
          </div>
        </div>
        <div className="student-table-container overflow-x-auto">
          <table className="w-full min-w-[760px] text-left border-collapse">
            <thead className="bg-surface-container-low sticky top-0">
              <tr>
                <th className="p-4 w-12"><input className="rounded text-primary focus:ring-primary" type="checkbox" /></th>
                {['Student Name', 'Student ID', 'Tracking Status', 'Actions'].map(header => (
                  <th key={header} className="p-4 font-label-md text-label-sm text-on-surface-variant uppercase tracking-wider">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {teacherStudents.map(student => (
                <tr key={student.id} className={`hover:bg-surface-container-lowest transition-colors group ${student.alert ? 'border-l-4 border-l-error' : ''}`}>
                  <td className="p-4"><input className="rounded text-primary focus:ring-primary" type="checkbox" /></td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img alt={student.name} className="w-10 h-10 rounded-full bg-surface-container" src={student.img} />
                      <div>
                        <p className="font-bold text-on-surface">{student.name}</p>
                        <p className={`text-xs ${student.alert ? 'text-error font-bold' : 'text-on-surface-variant'}`}>{student.sub}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-on-surface-variant font-label-md">{student.id}</td>
                  <td className="p-4">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${student.stCls}`}>
                      <span className="w-2 h-2 rounded-full bg-current"></span>
                      <span className="text-xs font-bold uppercase tracking-tighter">{student.status}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-start md:justify-end gap-2">
                      <Link href={`/teacher/students/edit?id=${encodeURIComponent(student.id)}`} className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-primary/10 text-primary font-bold hover:bg-primary/15">
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                        Edit
                      </Link>
                      <button type="button" onClick={() => removeStudent(student)} className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-error-container text-error font-bold hover:opacity-90">
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-stack-md flex flex-col md:flex-row md:items-center justify-between gap-3 border-t border-outline-variant bg-surface">
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
      )}
    </div>
  );
}

