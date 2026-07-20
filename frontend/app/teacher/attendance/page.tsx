'use client';

import { useEffect, useMemo, useState } from 'react';
import { readDailyIds, writeDailyIds } from '@/lib/dailyActionLocks';
import { travelStatusClass, travelStatusIcon, travelStatusLabel, useStudentTravelState } from '@/lib/studentTravel';

type AttendanceStatus = 'pending' | 'present' | 'absent' | 'late' | 'reached_school';
type AttendanceAction = Exclude<AttendanceStatus, 'pending'>;
type AttendanceView = 'class' | 'out';

const btnCls = (cur: AttendanceStatus, tgt: AttendanceAction) => {
  const base = 'px-3 py-1 rounded-lg text-label-sm font-bold transition-all border ';
  if (cur === tgt) {
    if (tgt === 'present') return base + 'bg-green-500 text-white border-green-500';
    if (tgt === 'absent') return base + 'bg-error text-white border-error';
    if (tgt === 'reached_school') return base + 'bg-blue-500 text-white border-blue-500';
    return base + 'bg-yellow-400 text-white border-yellow-400';
  }
  return base + 'bg-surface-container text-on-surface-variant border-outline-variant hover:bg-surface-container-high';
};

const ATTENDANCE_LOCK_KEY = 'safereach_teacher_attendance_submitted_locks';
const ATTENDANCE_LOCK_DAY_KEY = 'safereach_teacher_attendance_lock_day';
const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

function attendanceDayKey() {
  const now = new Date();
  const reset = new Date(now);
  reset.setHours(8, 0, 0, 0);
  if (now < reset) reset.setDate(reset.getDate() - 1);
  return reset.toISOString().slice(0, 10);
}

function readSubmittedLocks() {
  if (typeof window === 'undefined') return [];
  const currentDay = attendanceDayKey();
  const storedDay = window.localStorage.getItem(ATTENDANCE_LOCK_DAY_KEY);
  if (storedDay !== currentDay) {
    window.localStorage.setItem(ATTENDANCE_LOCK_DAY_KEY, currentDay);
    window.localStorage.setItem(ATTENDANCE_LOCK_KEY, JSON.stringify([]));
    return [];
  }
  try {
    const parsed = JSON.parse(window.localStorage.getItem(ATTENDANCE_LOCK_KEY) ?? '[]') as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function updatedAtTime(value: string) {
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function morningRisk(student: ReturnType<typeof useStudentTravelState>['classStudents'][number]) {
  if (student.status === 'to_school') {
    const updatedTime = updatedAtTime(student.updatedAt);
    return updatedTime && Date.now() - updatedTime > TWO_HOURS_MS ? 'overdue' : 'traveling';
  }
  if (student.status === 'reached_school' || student.status === 'present') return 'reached';
  if (student.status === 'going_home' || student.status === 'reached_home') return 'leave';
  return 'normal';
}

function morningRiskRank(student: ReturnType<typeof useStudentTravelState>['classStudents'][number]) {
  const risk = morningRisk(student);
  if (risk === 'overdue') return 0;
  if (risk === 'traveling') return 1;
  if (risk === 'reached') return 2;
  if (risk === 'leave') return 3;
  return 4;
}

function morningRowClass(student: ReturnType<typeof useStudentTravelState>['classStudents'][number]) {
  // Absence stays red for visibility but is not an overdue travel event, so it
  // remains in the normal alphabetical section instead of moving to the top.
  if (student.status === 'absent') return 'bg-red-50 border-l-4 border-error';
  const risk = morningRisk(student);
  if (risk === 'overdue') return 'bg-red-50 border-l-4 border-error';
  if (risk === 'traveling') return 'bg-yellow-50 border-l-4 border-yellow-400';
  if (risk === 'reached') return 'bg-green-50 border-l-4 border-green-500';
  return 'bg-white';
}

function goOutRisk(student: ReturnType<typeof useStudentTravelState>['classStudents'][number]) {
  if (student.status === 'reached_home') return 'reached';
  if (student.status === 'going_home') {
    const updatedTime = updatedAtTime(student.updatedAt);
    if (updatedTime && Date.now() - updatedTime > TWO_HOURS_MS) return 'overdue';
    return 'traveling';
  }
  return 'normal';
}

function goOutRiskRank(student: ReturnType<typeof useStudentTravelState>['classStudents'][number]) {
  const risk = goOutRisk(student);
  if (risk === 'overdue') return 0;
  if (risk === 'traveling') return 1;
  if (risk === 'reached') return 2;
  return 3;
}

function goOutRowClass(student: ReturnType<typeof useStudentTravelState>['classStudents'][number]) {
  const risk = goOutRisk(student);
  if (risk === 'overdue') return 'bg-red-50 border-l-4 border-error';
  if (risk === 'traveling') return 'bg-yellow-50 border-l-4 border-yellow-400';
  if (risk === 'reached') return 'bg-green-50 border-l-4 border-green-500';
  return '';
}

function canSelectForLeave(student: ReturnType<typeof useStudentTravelState>['classStudents'][number], submittedIds: string[]) {
  if (submittedIds.includes(student.id)) return false;
  if (student.status === 'absent' || student.attendance === 'absent') return false;
  if (student.status === 'going_home' || student.status === 'reached_home') return false;
  return true;
}

export default function TeacherAttendancePage() {
  const { classStudents, counts, smsLogs, actions } = useStudentTravelState();
  const [saved, setSaved] = useState(false);
  const [submittedIds, setSubmittedIds] = useState<string[]>([]);
  const [leaveIds, setLeaveIds] = useState<string[]>([]);
  const [leaveSubmittedIds, setLeaveSubmittedIds] = useState<string[]>([]);
  const [leaveSaved, setLeaveSaved] = useState(false);
  const [lastSmsNotice, setLastSmsNotice] = useState('SMS will be sent automatically for teacher status updates.');
  const [attendanceSearch, setAttendanceSearch] = useState('');
  const [smsSearch, setSmsSearch] = useState('');
  const [leaveSearch, setLeaveSearch] = useState('');
  const [attendanceView, setAttendanceView] = useState<AttendanceView>('class');

  useEffect(() => {
    setSubmittedIds(readSubmittedLocks());
    setLeaveSubmittedIds(readDailyIds('safereach_teacher_leave_school'));
    const timer = window.setInterval(() => setSubmittedIds(readSubmittedLocks()), 60 * 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(ATTENDANCE_LOCK_KEY, JSON.stringify(submittedIds));
    window.localStorage.setItem(ATTENDANCE_LOCK_DAY_KEY, attendanceDayKey());
  }, [submittedIds]);

  useEffect(() => {
    writeDailyIds('safereach_teacher_leave_school', leaveSubmittedIds);
  }, [leaveSubmittedIds]);

  const matchesSearch = (student: typeof classStudents[number], search: string) => {
    const value = search.trim().toLowerCase();
    if (!value) return true;
    return [
      student.roll,
      student.name,
      student.className,
      student.section,
      student.parentName,
      student.parentPhone,
      student.location,
      travelStatusLabel(student.status, 'teacher'),
      student.absenceReason,
    ].some(item => item.toLowerCase().includes(value));
  };

  const filteredAttendanceStudents = classStudents
    .filter(student => matchesSearch(student, attendanceSearch))
    .slice()
    .sort((a, b) => {
      const riskDiff = morningRiskRank(a) - morningRiskRank(b);
      return riskDiff !== 0 ? riskDiff : a.name.localeCompare(b.name);
    });
  const filteredLeaveStudents = classStudents
    .filter(student => student.status !== 'absent' && student.attendance !== 'absent')
    .filter(student => matchesSearch(student, leaveSearch))
    .slice()
    .sort((a, b) => {
      const riskDiff = goOutRiskRank(a) - goOutRiskRank(b);
      return riskDiff !== 0 ? riskDiff : a.name.localeCompare(b.name);
    });
  const filteredSmsLogs = smsLogs.filter(log => {
    const value = smsSearch.trim().toLowerCase();
    if (!value) return true;
    return [log.sentAt, log.studentName, log.parentName, log.phone, log.message].some(item => item.toLowerCase().includes(value));
  });
  const filteredLeaveIds = filteredLeaveStudents.filter(student => canSelectForLeave(student, leaveSubmittedIds)).map(student => student.id);
  const allFilteredLeaveSelected = filteredLeaveIds.length > 0 && filteredLeaveIds.every(id => leaveIds.includes(id));
  const submittedSet = useMemo(() => new Set(submittedIds), [submittedIds]);

  function currentAttendance(studentId: string): AttendanceStatus {
    const student = classStudents.find(item => item.id === studentId);
    if (student?.attendance === 'absent') return 'absent';
    if (student?.attendance === 'late') return 'late';
    if (student?.attendance === 'present') return 'present';
    if (student?.status === 'reached_school') return 'reached_school';
    return 'pending';
  }

  async function mark(studentId: string, status: AttendanceAction) {
    const student = classStudents.find(item => item.id === studentId);
    const current = currentAttendance(studentId);
    const isSubmitted = submittedSet.has(studentId);
    const canUpdateSubmittedLate = isSubmitted && current === 'late' && (status === 'present' || status === 'absent');
    if (isSubmitted && !canUpdateSubmittedLate) return;
    try {
      if (status === 'present') await actions.markPresent(studentId);
      if (status === 'absent') await actions.markAbsent(studentId);
      if (status === 'late') await actions.markLate(studentId);
      if (status === 'reached_school') await actions.markReachedSchool(studentId);
    } catch (reason) {
      setLastSmsNotice(reason instanceof Error ? reason.message : 'Attendance update failed.');
      return;
    }
    if (student) {
      const label = status === 'reached_school' ? 'Reached School' : status.charAt(0).toUpperCase() + status.slice(1);
      setLastSmsNotice(`SMS sent to ${student.parentName} (${student.parentPhone}): ${student.name} - ${label}.`);
    }
    if (canUpdateSubmittedLate) {
      setSubmittedIds(currentIds => currentIds.filter(id => id !== studentId));
    }
    setSaved(false);
  }

  async function markAll(status: AttendanceAction) {
    await Promise.all(filteredAttendanceStudents.map(student => mark(student.id, status)));
    setSaved(false);
  }

  function toggleLeave(studentId: string, checked: boolean) {
    const student = classStudents.find(item => item.id === studentId);
    if (!student || !canSelectForLeave(student, leaveSubmittedIds)) return;
    setLeaveIds(current => checked ? [...current, studentId] : current.filter(id => id !== studentId));
    setLeaveSaved(false);
  }

  async function submitLeave() {
    const selectedStudents = classStudents.filter(student => leaveIds.includes(student.id));
    try {
      await actions.markLeavingSchool(leaveIds);
    } catch (reason) {
      setLastSmsNotice(reason instanceof Error ? reason.message : 'Out of school submit failed.');
      return;
    }
    setLeaveSubmittedIds(current => Array.from(new Set([...current, ...leaveIds])));
    setLastSmsNotice(`${selectedStudents.length} go-out SMS ${selectedStudents.length === 1 ? 'was' : 'were'} sent to parent phones.`);
    setLeaveIds([]);
    setLeaveSaved(true);
  }

  function toggleAllVisibleLeave(checked: boolean) {
    setLeaveIds(current => {
      if (checked) return Array.from(new Set([...current, ...filteredLeaveIds.filter(id => !leaveSubmittedIds.includes(id))]));
      return current.filter(id => !filteredLeaveIds.includes(id));
    });
    setLeaveSaved(false);
  }

  function isAttendanceButtonDisabled(studentId: string, target: AttendanceAction) {
    if (!submittedSet.has(studentId)) return false;
    const current = currentAttendance(studentId);
    return !(current === 'late' && (target === 'present' || target === 'absent'));
  }

  function submitAttendance() {
    const idsToSubmit = classStudents
      .filter(student => {
        const current = currentAttendance(student.id);
        return current === 'present' || current === 'absent' || current === 'late';
      })
      .map(student => student.id);
    setSubmittedIds(current => Array.from(new Set([...current, ...idsToSubmit])));
    setSaved(true);
  }

  return (
    <div className="p-container-padding-mobile md:p-container-padding-desktop">
      <div className="grid grid-cols-2 gap-3 mb-stack-lg">
        <button
          type="button"
          onClick={() => setAttendanceView('class')}
          className={`rounded-xl border px-4 py-3 text-left shadow-sm ${attendanceView === 'class' ? 'bg-primary text-on-primary border-primary' : 'bg-white text-on-surface border-outline-variant'}`}
        >
          <span className="material-symbols-outlined text-[20px]">how_to_reg</span>
          <span className="block mt-1 font-bold">Class Attendance</span>
        </button>
        <button
          type="button"
          onClick={() => setAttendanceView('out')}
          className={`rounded-xl border px-4 py-3 text-left shadow-sm ${attendanceView === 'out' ? 'bg-primary text-on-primary border-primary' : 'bg-white text-on-surface border-outline-variant'}`}
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          <span className="block mt-1 font-bold">Out of School Attendance</span>
        </button>
      </div>

      {attendanceView === 'class' && (
      <>
      <div className="grid grid-cols-5 md:grid-cols-5 gap-2 md:gap-4 mb-stack-lg">
        <div className="bg-blue-50 border border-blue-100 rounded-lg md:rounded-xl p-2 md:p-4 text-center"><p className="font-bold text-lg md:font-headline-lg md:text-headline-lg text-blue-600">{counts.toSchool}</p><p className="text-[10px] md:text-label-md leading-tight text-blue-700">Tracking<br className="md:hidden" /> to School</p></div>
        <div className="bg-green-50 border border-green-100 rounded-lg md:rounded-xl p-2 md:p-4 text-center"><p className="font-bold text-lg md:font-headline-lg md:text-headline-lg text-green-600">{counts.present}</p><p className="text-[10px] md:text-label-md leading-tight text-green-700">Present</p></div>
        <div className="bg-red-50 border border-red-100 rounded-lg md:rounded-xl p-2 md:p-4 text-center"><p className="font-bold text-lg md:font-headline-lg md:text-headline-lg text-error">{counts.absent}</p><p className="text-[10px] md:text-label-md leading-tight text-red-700">Absent</p></div>
        <div className="bg-yellow-50 border border-yellow-100 rounded-lg md:rounded-xl p-2 md:p-4 text-center"><p className="font-bold text-lg md:font-headline-lg md:text-headline-lg text-yellow-600">{counts.goingHome}</p><p className="text-[10px] md:text-label-md leading-tight text-yellow-700">Tracking<br className="md:hidden" /> Home</p></div>
        <div className="bg-primary/5 border border-primary/20 rounded-lg md:rounded-xl p-2 md:p-4 text-center"><p className="font-bold text-lg md:font-headline-lg md:text-headline-lg text-primary">{counts.reachedHome}</p><p className="text-[10px] md:text-label-md leading-tight text-primary">SafeReach<br className="md:hidden" /> Home</p></div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-stack-lg">
        <label className="relative w-full md:max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
          <input
            value={attendanceSearch}
            onChange={event => setAttendanceSearch(event.target.value)}
            className="w-full pl-10 pr-3 py-2.5 bg-white border border-outline-variant rounded-lg text-label-md focus:ring-2 focus:ring-primary focus:outline-none"
            placeholder="Search attendance students..."
          />
        </label>
        <input type="date" defaultValue="2026-06-10" aria-label="Attendance date" className="w-full bg-white border border-outline-variant rounded-lg px-4 py-2.5 text-label-md focus:ring-2 focus:ring-primary focus:outline-none md:w-auto" />
      </div>

      <section className="bg-white rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden mb-stack-lg">
        <div className="p-stack-md border-b border-outline-variant/30 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <h2 className="font-headline-md text-headline-md text-primary">Morning Attendance and Travel Status</h2>
            <p className="text-label-md text-on-surface-variant">Primary and assistant incharge can submit attendance. Present/Absent lock until the next 8:00 AM reset; Late can still become Present or Absent.</p>
          </div>
          <button type="button" onClick={() => markAll('present')} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-secondary px-3 py-2 text-label-sm font-bold text-on-secondary hover:opacity-90">
            <span className="material-symbols-outlined text-[18px]">done_all</span>
            Mark All Present
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] md:min-w-[900px] text-left">
            <thead className="bg-surface-container-low text-label-md text-on-surface-variant">
              <tr>{['Roll', 'Student', 'Attendance', 'Travel Status'].map(head => <th key={head} className="px-4 py-3 font-bold">{head}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {filteredAttendanceStudents.map(student => (
                <tr key={student.id} className={morningRowClass(student)}>
                  <td className="px-4 py-3 text-label-sm text-on-surface-variant">{student.roll}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center text-primary font-bold text-label-md shrink-0">{student.avatar}</div>
                      <div>
                        <p className="font-bold text-on-surface">{student.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {([
                        ['present', 'P', 'Mark present and send parent SMS'],
                        ['absent', 'A', 'Mark absent and send parent SMS'],
                        ['late', 'L', 'Mark late and send parent SMS'],
                      ] as const).map(([status, label, title]) => {
                        const disabled = isAttendanceButtonDisabled(student.id, status);
                        return (
                          <button
                            key={status}
                            title={disabled ? 'Submitted attendance is locked. Late students may still be changed to Present or Absent.' : title}
                            disabled={disabled}
                            onClick={() => mark(student.id, status)}
                            className={`${btnCls(currentAttendance(student.id), status)} ${disabled ? 'opacity-45 cursor-not-allowed hover:bg-surface-container' : ''}`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`${travelStatusClass(student.status)} px-3 py-1 rounded-full text-label-sm font-bold inline-flex items-center gap-1`}>
                      <span className="material-symbols-outlined text-[14px]">{travelStatusIcon(student.status)}</span>
                      {travelStatusLabel(student.status, 'teacher')}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredAttendanceStudents.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-6 text-center text-on-surface-variant">No attendance students match this search.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-outline-variant/30 p-stack-md">
          {saved && <span className="flex items-center gap-1 text-green-600 text-label-md"><span className="material-symbols-outlined text-[18px]">check_circle</span>Attendance submitted.</span>}
          <button onClick={submitAttendance} className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 font-label-md text-on-primary shadow-sm transition-colors hover:bg-primary-container"><span className="material-symbols-outlined text-[18px]">save</span>Submit</button>
        </div>
      </section>
      </>
      )}

      {attendanceView === 'out' && (
      <section className="bg-white rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden mb-stack-lg">
        <div className="p-stack-md border-b border-outline-variant/30">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div>
              <h2 className="font-headline-md text-headline-md text-primary">Out of School Attendance</h2>
              <p className="text-label-md text-on-surface-variant">Select students leaving school and submit. Parent cards will show Going Home and enable Reached Home confirmation.</p>
            </div>
            <label className="relative w-full lg:w-80">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
              <input
                value={leaveSearch}
                onChange={event => setLeaveSearch(event.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-surface-container border border-outline-variant rounded-lg text-label-md focus:ring-2 focus:ring-primary focus:outline-none"
                placeholder="Search out of school students..."
              />
            </label>
          </div>
          <label className="mt-4 inline-flex items-center gap-3 rounded-lg bg-primary/5 border border-primary/15 px-4 py-2 text-primary font-bold cursor-pointer">
            <input
              type="checkbox"
              checked={allFilteredLeaveSelected}
              onChange={event => toggleAllVisibleLeave(event.target.checked)}
              className="w-5 h-5 rounded text-primary"
            />
            Select all visible students ({filteredLeaveStudents.length})
          </label>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left">
            <thead className="bg-surface-container-low text-label-md text-on-surface-variant">
              <tr>
                <th className="px-4 py-3 w-16">Select</th>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {filteredLeaveStudents.map(student => {
                return (
                  <tr key={student.id} className={`hover:bg-surface-container-low ${goOutRowClass(student)}`}>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={leaveIds.includes(student.id)}
                        disabled={!canSelectForLeave(student, leaveSubmittedIds)}
                        onChange={event => toggleLeave(student.id, event.target.checked)}
                        className="w-5 h-5 rounded text-primary disabled:opacity-40"
                        aria-label={`Select ${student.name} for out of school attendance`}
                      />
                    </td>
                    <td className="px-4 py-3 font-bold text-on-surface">{student.name}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`${travelStatusClass(student.status)} px-2 md:px-3 py-1 rounded-full text-[11px] md:text-label-sm font-bold shrink-0`}>{travelStatusLabel(student.status, 'teacher')}</span>
                    </div>
                    </td>
                  </tr>
                );
              })}
              {filteredLeaveStudents.length === 0 && (
                <tr><td colSpan={3} className="px-4 py-6 text-center text-on-surface-variant">No go out students match this search.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-stack-md flex justify-end gap-3 border-t border-outline-variant/30">
          {leaveSaved && <span className="flex items-center gap-1 text-green-600 text-label-md"><span className="material-symbols-outlined text-[18px]">check_circle</span>Out of school attendance submitted.</span>}
          <button onClick={submitLeave} disabled={leaveIds.length === 0} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-label-md shadow-sm ${leaveIds.length > 0 ? 'bg-secondary text-on-secondary hover:opacity-90' : 'bg-surface-container text-on-surface-variant cursor-not-allowed'}`}>
            <span className="material-symbols-outlined text-[18px]">logout</span>
            Submit Leave School
          </button>
        </div>
      </section>
      )}

      <section className="hidden bg-white rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden mb-stack-lg">
        <div className="p-stack-md border-b border-outline-variant/30 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <h2 className="font-headline-md text-headline-md text-primary">Recent Parent SMS Log</h2>
            <p className="text-label-md text-on-surface-variant">Frontend-only SMS records generated by teacher status updates.</p>
          </div>
          <label className="relative w-full lg:w-80">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
            <input
              value={smsSearch}
              onChange={event => setSmsSearch(event.target.value)}
              className="w-full pl-10 pr-3 py-2.5 bg-surface-container border border-outline-variant rounded-lg text-label-md focus:ring-2 focus:ring-primary focus:outline-none"
              placeholder="Search SMS logs..."
            />
          </label>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead className="bg-surface-container-low text-label-md text-on-surface-variant">
              <tr>{['Time', 'Student', 'Parent', 'Phone', 'SMS Message'].map(head => <th key={head} className="px-4 py-3 font-bold">{head}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {filteredSmsLogs.slice(0, 8).map(log => (
                <tr key={log.id}>
                  <td className="px-4 py-3 text-label-sm text-on-surface-variant">{log.sentAt}</td>
                  <td className="px-4 py-3 font-bold text-on-surface">{log.studentName}</td>
                  <td className="px-4 py-3 text-label-md">{log.parentName}</td>
                  <td className="px-4 py-3 text-label-md">{log.phone}</td>
                  <td className="px-4 py-3 text-label-md">{log.message}</td>
                </tr>
              ))}
              {filteredSmsLogs.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-on-surface-variant">{smsLogs.length === 0 ? 'No SMS records yet. Mark a student status to create the first parent SMS.' : 'No SMS logs match this search.'}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
