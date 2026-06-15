'use client';

import { useEffect, useMemo, useState } from 'react';
import { readDailyIds, writeDailyIds } from '@/lib/dailyActionLocks';
import { travelStatusClass, travelStatusIcon, travelStatusLabel, useStudentTravelState } from '@/lib/studentTravel';

type AttendanceStatus = 'present' | 'absent' | 'late' | 'reached_school';

const btnCls = (cur: AttendanceStatus, tgt: AttendanceStatus) => {
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

  const filteredAttendanceStudents = classStudents.filter(student => matchesSearch(student, attendanceSearch));
  const filteredLeaveStudents = classStudents.filter(student => matchesSearch(student, leaveSearch));
  const filteredSmsLogs = smsLogs.filter(log => {
    const value = smsSearch.trim().toLowerCase();
    if (!value) return true;
    return [log.sentAt, log.studentName, log.parentName, log.phone, log.message].some(item => item.toLowerCase().includes(value));
  });
  const filteredLeaveIds = filteredLeaveStudents.map(student => student.id);
  const allFilteredLeaveSelected = filteredLeaveIds.length > 0 && filteredLeaveIds.every(id => leaveIds.includes(id));
  const submittedSet = useMemo(() => new Set(submittedIds), [submittedIds]);

  function currentAttendance(studentId: string): AttendanceStatus {
    const student = classStudents.find(item => item.id === studentId);
    if (student?.attendance === 'absent') return 'absent';
    if (student?.attendance === 'late') return 'late';
    if (student?.status === 'reached_school') return 'reached_school';
    return 'present';
  }

  function mark(studentId: string, status: AttendanceStatus) {
    const student = classStudents.find(item => item.id === studentId);
    const current = currentAttendance(studentId);
    const isSubmitted = submittedSet.has(studentId);
    const canUpdateSubmittedLate = isSubmitted && current === 'late' && (status === 'present' || status === 'absent');
    if (isSubmitted && !canUpdateSubmittedLate) return;
    if (status === 'present') actions.markPresent(studentId);
    if (status === 'absent') actions.markAbsent(studentId);
    if (status === 'late') actions.markLate(studentId);
    if (status === 'reached_school') actions.markReachedSchool(studentId);
    if (student) {
      const label = status === 'reached_school' ? 'Reached School' : status.charAt(0).toUpperCase() + status.slice(1);
      setLastSmsNotice(`SMS sent to ${student.parentName} (${student.parentPhone}): ${student.name} - ${label}.`);
    }
    if (canUpdateSubmittedLate) {
      setSubmittedIds(currentIds => currentIds.filter(id => id !== studentId));
    }
    setSaved(false);
  }

  function markAll(status: AttendanceStatus) {
    filteredAttendanceStudents.forEach(student => mark(student.id, status));
    setSaved(false);
  }

  function toggleLeave(studentId: string, checked: boolean) {
    if (leaveSubmittedIds.includes(studentId)) return;
    setLeaveIds(current => checked ? [...current, studentId] : current.filter(id => id !== studentId));
    setLeaveSaved(false);
  }

  function submitLeave() {
    const selectedStudents = classStudents.filter(student => leaveIds.includes(student.id));
    actions.markLeavingSchool(leaveIds);
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

  function isAttendanceButtonDisabled(studentId: string, target: AttendanceStatus) {
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

  function rowStatusClass(student: typeof classStudents[number], index: number) {
    if (student.status === 'going_home') return 'bg-yellow-50 border-l-4 border-yellow-400';
    if (student.status === 'to_school') return 'bg-blue-50 border-l-4 border-blue-400';
    if (student.status === 'absent') return 'bg-red-50 border-l-4 border-error';
    if (student.status === 'reached_home' || student.status === 'present' || student.status === 'reached_school') return index % 2 !== 0 ? 'bg-surface-container/10' : '';
    return index % 2 !== 0 ? 'bg-surface-container/10' : '';
  }

  return (
    <div className="p-container-padding-mobile md:p-container-padding-desktop">
      <div className="flex flex-col md:flex-row gap-3 mb-stack-lg">
        <select className="bg-white border border-outline-variant rounded-lg px-4 py-2.5 text-label-md focus:ring-2 focus:ring-primary focus:outline-none flex-1">
          <option>Class 4-B - Morning Travel Attendance</option>
          <option>Class 4-B - Dismissal Travel Attendance</option>
        </select>
        <input type="date" defaultValue="2026-06-10" className="bg-white border border-outline-variant rounded-lg px-4 py-2.5 text-label-md focus:ring-2 focus:ring-primary focus:outline-none" />
        <select className="bg-white border border-outline-variant rounded-lg px-4 py-2.5 text-label-md focus:ring-2 focus:ring-primary focus:outline-none">
          <option>Morning Arrival</option>
          <option>Go Out Attendance</option>
        </select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-stack-lg">
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-center"><p className="font-headline-lg text-headline-lg text-blue-600">{counts.toSchool}</p><p className="text-label-md text-blue-700">Tracking to School</p></div>
        <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-center"><p className="font-headline-lg text-headline-lg text-green-600">{counts.present}</p><p className="text-label-md text-green-700">Present</p></div>
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-center"><p className="font-headline-lg text-headline-lg text-error">{counts.absent}</p><p className="text-label-md text-red-700">Absent</p></div>
        <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 text-center"><p className="font-headline-lg text-headline-lg text-yellow-600">{counts.goingHome}</p><p className="text-label-md text-yellow-700">Tracking to Home</p></div>
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-center"><p className="font-headline-lg text-headline-lg text-primary">{counts.reachedHome}</p><p className="text-label-md text-primary">SafeReach Home</p></div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
        <label className="relative w-full md:max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
          <input
            value={attendanceSearch}
            onChange={event => setAttendanceSearch(event.target.value)}
            className="w-full pl-10 pr-3 py-2.5 bg-white border border-outline-variant rounded-lg text-label-md focus:ring-2 focus:ring-primary focus:outline-none"
            placeholder="Search attendance students..."
          />
        </label>
        <span className="text-label-sm text-on-surface-variant">{filteredAttendanceStudents.length} visible students</span>
      </div>

      <section className="bg-white rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden mb-stack-lg">
        <div className="p-stack-md border-b border-outline-variant/30 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <h2 className="font-headline-md text-headline-md text-primary">Morning Attendance and Travel Status</h2>
            <p className="text-label-md text-on-surface-variant">Primary and assistant incharge can submit attendance. Present/Absent lock until the next 8:00 AM reset; Late can still become Present or Absent.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {saved && <span className="flex items-center gap-1 text-green-600 text-label-md"><span className="material-symbols-outlined text-[18px]">check_circle</span>Attendance submitted.</span>}
            <button onClick={submitAttendance} className="flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-xl font-label-md hover:bg-primary-container transition-colors shadow-sm">
              <span className="material-symbols-outlined text-[18px]">save</span>
              Submit Attendance
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1120px] text-left">
            <thead className="bg-surface-container-low text-label-md text-on-surface-variant">
              <tr>{['Roll', 'Student', 'Travel Status', 'Parent SMS / Reason', 'Attendance'].map(head => <th key={head} className="px-4 py-3 font-bold">{head}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {filteredAttendanceStudents.map((student, idx) => (
                <tr key={student.id} className={rowStatusClass(student, idx)}>
                  <td className="px-4 py-3 text-label-sm text-on-surface-variant">{student.roll}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center text-primary font-bold text-label-md shrink-0">{student.avatar}</div>
                      <div>
                        <p className="font-bold text-on-surface">{student.name}</p>
                        <p className="text-xs text-on-surface-variant">{student.className} - Section {student.section}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`${travelStatusClass(student.status)} px-3 py-1 rounded-full text-label-sm font-bold inline-flex items-center gap-1`}>
                      <span className="material-symbols-outlined text-[14px]">{travelStatusIcon(student.status)}</span>
                      {travelStatusLabel(student.status, 'teacher')}
                    </span>
                    <p className="text-xs text-on-surface-variant mt-1">{student.location}</p>
                  </td>
                  <td className="px-4 py-3 text-label-md">
                    {student.smsHistory?.[0] ? (
                      <div>
                        <p className="font-bold text-blue-700">SMS sent {student.smsHistory[0].sentAt}</p>
                        <p className="text-xs text-on-surface-variant max-w-xs truncate">{student.smsHistory[0].message}</p>
                        {student.absenceReason && <p className="text-xs text-green-700 font-bold mt-1">Reason: {student.absenceReason}</p>}
                        {student.absenceReasonRequested && !student.absenceReason && <p className="text-xs text-error font-bold mt-1">Absence reason pending.</p>}
                      </div>
                    ) : (
                      <span className="text-on-surface-variant">No SMS sent yet</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {([
                        ['present', 'P', 'Mark present and send parent SMS'],
                        ['absent', 'A', 'Mark absent and send parent SMS'],
                        ['late', 'L', 'Mark late and send parent SMS'],
                        ['reached_school', 'R', 'Mark reached school and send parent SMS'],
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
                    {submittedSet.has(student.id) && (
                      <p className="mt-2 text-[11px] font-bold text-green-700">
                        {currentAttendance(student.id) === 'late' ? 'Submitted late - can update to P/A' : 'Submitted and locked'}
                      </p>
                    )}
                  </td>
                </tr>
              ))}
              {filteredAttendanceStudents.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-on-surface-variant">No attendance students match this search.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden mb-stack-lg">
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

      <section className="bg-white rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden mb-stack-lg">
        <div className="p-stack-md border-b border-outline-variant/30">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div>
              <h2 className="font-headline-md text-headline-md text-primary">Go Out Attendance</h2>
              <p className="text-label-md text-on-surface-variant">Select students leaving school and submit. Parent cards will show Going Home and enable Reached Home confirmation.</p>
            </div>
            <label className="relative w-full lg:w-80">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
              <input
                value={leaveSearch}
                onChange={event => setLeaveSearch(event.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-surface-container border border-outline-variant rounded-lg text-label-md focus:ring-2 focus:ring-primary focus:outline-none"
                placeholder="Search go out students..."
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
        <div className="divide-y divide-outline-variant/20">
          {filteredLeaveStudents.map(student => (
            <label key={student.id} className="flex items-center gap-4 px-4 py-3 hover:bg-surface-container-low cursor-pointer">
              <input
                type="checkbox"
                checked={leaveIds.includes(student.id)}
                disabled={leaveSubmittedIds.includes(student.id)}
                onChange={event => toggleLeave(student.id, event.target.checked)}
                className="w-5 h-5 rounded text-primary disabled:opacity-40"
              />
              <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center text-primary font-bold text-label-md shrink-0">{student.avatar}</div>
              <div className="flex-1">
                <p className="font-bold text-on-surface">{student.name}</p>
                <p className="text-xs text-on-surface-variant">{student.parentName} - {student.parentPhone}</p>
              </div>
              <span className={`${travelStatusClass(student.status)} px-3 py-1 rounded-full text-label-sm font-bold`}>{travelStatusLabel(student.status, 'teacher')}</span>
              {leaveSubmittedIds.includes(student.id) && <span className="text-xs font-bold text-green-700">Submitted today</span>}
            </label>
          ))}
          {filteredLeaveStudents.length === 0 && (
            <div className="px-4 py-6 text-center text-on-surface-variant">No go out students match this search.</div>
          )}
        </div>
        <div className="p-stack-md flex justify-end gap-3 border-t border-outline-variant/30">
          {leaveSaved && <span className="flex items-center gap-1 text-green-600 text-label-md"><span className="material-symbols-outlined text-[18px]">check_circle</span>Go out attendance submitted.</span>}
          <button onClick={submitLeave} disabled={leaveIds.length === 0} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-label-md shadow-sm ${leaveIds.length > 0 ? 'bg-secondary text-on-secondary hover:opacity-90' : 'bg-surface-container text-on-surface-variant cursor-not-allowed'}`}>
            <span className="material-symbols-outlined text-[18px]">logout</span>
            Submit Leave School
          </button>
        </div>
      </section>
    </div>
  );
}
