'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

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

function readStudents() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]') as TeacherStudent[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : teacherStudentSeed;
  } catch {
    return teacherStudentSeed;
  }
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

function buildStudent(form: StudentFormState, existing: TeacherStudent): TeacherStudent {
  return {
    ...existing,
    name: form.name.trim(),
    sub: form.note.trim() || 'Updated by class incharge',
    status: form.status,
    stCls: statusClass(form.status),
    guardian: form.phone.trim() || '+1 (555) 000-0000',
    gSub: form.guardian.trim() ? `Guardian: ${form.guardian.trim()}` : 'Guardian: Pending',
    activity: 'Record edited from teacher student edit page',
    alert: form.status === 'Missing Scan',
    parentSmsEnabled: form.parentSmsEnabled,
  };
}

function TeacherStudentEditContent() {
  const router = useRouter();
  const params = useSearchParams();
  const studentId = params.get('id') ?? '';
  const [students, setStudents] = useState<TeacherStudent[]>(teacherStudentSeed);
  const [formState, setFormState] = useState<StudentFormState>(emptyForm);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const loaded = readStudents();
    setStudents(loaded);
    const student = loaded.find(item => item.id === studentId);
    if (student) {
      setFormState(formFromStudent(student));
      setNotice(`Editing ${student.name} in ${assignedClass}.`);
    } else {
      setNotice('Student record was not found. Return to My Students and select a valid student.');
    }
  }, [studentId]);

  const student = students.find(item => item.id === studentId);

  function updateForm(key: keyof StudentFormState, value: string) {
    setFormState(current => ({ ...current, [key]: value }));
  }

  function updateSmsEnabled(enabled: boolean) {
    setFormState(current => ({ ...current, parentSmsEnabled: enabled }));
  }

  function saveStudent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!student || !formState.name.trim()) return;
    const updated = students.map(item => item.id === student.id ? buildStudent(formState, student) : item);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setNotice(`${formState.name.trim()} updated successfully.`);
    router.push('/teacher/students');
  }

  return (
    <div className="p-container-padding-mobile md:p-container-padding-desktop flex flex-col gap-stack-lg">
      <nav className="flex flex-wrap items-center gap-2 text-label-md text-on-surface-variant">
        <Link href="/teacher/students" className="hover:text-primary">My Students</Link>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <span className="font-bold text-primary">Edit Student</span>
      </nav>

      <section className="bg-white rounded-xl border border-outline-variant/50 shadow-sm p-stack-md">
        <div className="mb-5">
          <h1 className="font-headline-lg text-headline-lg text-primary">Edit Assigned Student</h1>
          <p className="text-body-md text-on-surface-variant">Teacher login can edit students assigned to {assignedClass} only in this frontend demo.</p>
        </div>
        {notice && <div className="mb-5 rounded-lg bg-primary/5 border border-primary/15 px-4 py-3 text-primary font-bold">{notice}</div>}

        {student ? (
          <form onSubmit={saveStudent} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <label className="space-y-1.5">
                <span className="text-label-sm font-bold text-on-surface-variant">Student ID</span>
                <input value={student.id} disabled className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface-container text-on-surface-variant" />
              </label>
              <label className="space-y-1.5">
                <span className="text-label-sm font-bold text-on-surface-variant">Student Name</span>
                <input value={formState.name} onChange={event => updateForm('name', event.target.value)} required className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface-container" />
              </label>
              <label className="space-y-1.5">
                <span className="text-label-sm font-bold text-on-surface-variant">Guardian Name</span>
                <input value={formState.guardian} onChange={event => updateForm('guardian', event.target.value)} className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface-container" />
              </label>
              <label className="space-y-1.5">
                <span className="text-label-sm font-bold text-on-surface-variant">Guardian Phone</span>
                <input value={formState.phone} onChange={event => updateForm('phone', event.target.value)} className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface-container" />
              </label>
              <label className="space-y-1.5">
                <span className="text-label-sm font-bold text-on-surface-variant">Tracking Status</span>
                <select value={formState.status} onChange={event => updateForm('status', event.target.value)} className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface-container">
                  <option>At School</option>
                  <option>In Transit</option>
                  <option>Missing Scan</option>
                  <option>Teacher Updated</option>
                </select>
              </label>
              <label className="space-y-1.5 md:col-span-2 xl:col-span-3">
                <span className="text-label-sm font-bold text-on-surface-variant">Student note / medical or transport detail</span>
                <input value={formState.note} onChange={event => updateForm('note', event.target.value)} className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface-container" />
              </label>
            </div>
            <div className="rounded-xl border border-outline-variant/50 bg-surface-container-low p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary mt-0.5">sms</span>
                <div>
                  <h2 className="font-bold text-primary">Parent SMS Alerts</h2>
                  <p className="text-label-md text-on-surface-variant">Enable SMS status updates for this student's parent when attendance, absent, reached, or go-out status changes.</p>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={formState.parentSmsEnabled}
                onClick={() => updateSmsEnabled(!formState.parentSmsEnabled)}
                className={`relative inline-flex h-9 w-20 shrink-0 items-center rounded-full px-1 transition-colors ${formState.parentSmsEnabled ? 'bg-secondary' : 'bg-outline-variant'}`}
              >
                <span className={`h-7 w-7 rounded-full bg-white shadow transition-transform ${formState.parentSmsEnabled ? 'translate-x-11' : 'translate-x-0'}`}></span>
                <span className={`absolute text-[10px] font-bold ${formState.parentSmsEnabled ? 'left-3 text-on-secondary' : 'right-3 text-on-surface-variant'}`}>
                  {formState.parentSmsEnabled ? 'ON' : 'OFF'}
                </span>
              </button>
            </div>
            <div className="flex flex-wrap gap-3">
              <button type="submit" className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-primary text-on-primary font-bold">
                <span className="material-symbols-outlined text-[20px]">save</span>
                Save Student
              </button>
              <Link href="/teacher/students" className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border border-outline-variant font-bold text-on-surface">
                Cancel
              </Link>
            </div>
          </form>
        ) : (
          <Link href="/teacher/students" className="inline-flex w-fit items-center gap-2 px-5 py-3 rounded-lg bg-primary text-on-primary font-bold">
            Back to My Students
          </Link>
        )}
      </section>
    </div>
  );
}

export default function TeacherStudentEditPage() {
  return (
    <Suspense fallback={<div className="p-container-padding-mobile md:p-container-padding-desktop text-primary font-bold">Loading student edit page...</div>}>
      <TeacherStudentEditContent />
    </Suspense>
  );
}
