'use client';

import { useEffect, useMemo, useState } from 'react';
import { type BackendStudent, useBackendBootstrap } from '@/lib/backendData';
import { apiBaseUrl } from './runtimeConfig';

export type StudentTravelStatus =
  | 'at_home'
  | 'to_school'
  | 'reached_school'
  | 'present'
  | 'absent'
  | 'going_home'
  | 'reached_home';

export type AttendanceMark = 'pending' | 'present' | 'absent' | 'late';
export type TeacherSmsStatus = 'present' | 'absent' | 'late' | 'reached_school' | 'going_home' | 'reached_home';

export type StudentSmsLog = {
  id: string;
  status: TeacherSmsStatus;
  message: string;
  phone: string;
  sentAt: string;
  sentBy: string;
};

export type Db3RealtimeEvent = {
  id: string;
  table: 'students_status' | 'teacher_events' | 'parent_events' | 'travel_events' | 'sms_events';
  studentId: string;
  studentName: string;
  actor: 'parent' | 'teacher' | 'system';
  event: string;
  status: StudentTravelStatus | AttendanceMark | TeacherSmsStatus;
  detail: string;
  createdAt: string;
};

export type StudentTravelRecord = {
  id: string;
  name: string;
  roll: string;
  className: string;
  section: string;
  parentName: string;
  parentPhone: string;
  teacherName: string;
  avatar: string;
  location: string;
  isParentChild: boolean;
  status: StudentTravelStatus;
  attendance: AttendanceMark;
  absenceReason: string;
  absenceReasonRequested: boolean;
  absenceSmsSentAt: string;
  smsHistory: StudentSmsLog[];
  updatedAt: string;
};

export const TRAVEL_STORAGE_KEY = 'safereach_student_travel_attendance';
export const DB3_REALTIME_STORAGE_KEY = 'safereach_db3_realtime_events';
const TRAVEL_EVENT = 'safereach-travel-state-updated';

const nowLabel = () => new Date().toLocaleString();
let backendBaseRecords: StudentTravelRecord[] = [];

export const seedTravelRecords: StudentTravelRecord[] = [
  {
    id: 'st-leo-thompson',
    name: 'Leo Thompson',
    roll: '01',
    className: 'Class 4',
    section: 'B',
    parentName: 'Sarah Thompson',
    parentPhone: '+1 (555) 100-2101',
    teacherName: 'Mr. James Anderson',
    avatar: 'LT',
    location: 'Home',
    isParentChild: true,
    status: 'at_home',
    attendance: 'pending',
    absenceReason: '',
    absenceReasonRequested: false,
    absenceSmsSentAt: '',
    smsHistory: [],
    updatedAt: 'Demo start',
  },
  {
    id: 'st-maya-thompson',
    name: 'Maya Thompson',
    roll: '02',
    className: 'Class 4',
    section: 'B',
    parentName: 'Sarah Thompson',
    parentPhone: '+1 (555) 100-2101',
    teacherName: 'Mr. James Anderson',
    avatar: 'MT',
    location: 'Home',
    isParentChild: true,
    status: 'at_home',
    attendance: 'pending',
    absenceReason: '',
    absenceReasonRequested: false,
    absenceSmsSentAt: '',
    smsHistory: [],
    updatedAt: 'Demo start',
  },
  {
    id: 'st-aarav-sharma',
    name: 'Aarav Sharma',
    roll: '03',
    className: 'Class 4',
    section: 'B',
    parentName: 'Nisha Sharma',
    parentPhone: '+1 (555) 100-2102',
    teacherName: 'Mr. James Anderson',
    avatar: 'AS',
    location: 'Home',
    isParentChild: false,
    status: 'at_home',
    attendance: 'pending',
    absenceReason: '',
    absenceReasonRequested: false,
    absenceSmsSentAt: '',
    smsHistory: [],
    updatedAt: 'Demo start',
  },
  {
    id: 'st-ananya-patel',
    name: 'Ananya Patel',
    roll: '04',
    className: 'Class 4',
    section: 'B',
    parentName: 'Ravi Patel',
    parentPhone: '+1 (555) 100-2103',
    teacherName: 'Mr. James Anderson',
    avatar: 'AP',
    location: 'Home',
    isParentChild: false,
    status: 'at_home',
    attendance: 'pending',
    absenceReason: '',
    absenceReasonRequested: false,
    absenceSmsSentAt: '',
    smsHistory: [],
    updatedAt: 'Demo start',
  },
  {
    id: 'st-priya-nair',
    name: 'Priya Nair',
    roll: '05',
    className: 'Class 4',
    section: 'B',
    parentName: 'Sunita Nair',
    parentPhone: '+1 (555) 100-2104',
    teacherName: 'Mr. James Anderson',
    avatar: 'PN',
    location: 'Home',
    isParentChild: false,
    status: 'at_home',
    attendance: 'pending',
    absenceReason: '',
    absenceReasonRequested: false,
    absenceSmsSentAt: '',
    smsHistory: [],
    updatedAt: 'Demo start',
  },
  {
    id: 'st-rohan-gupta',
    name: 'Rohan Gupta',
    roll: '06',
    className: 'Class 4',
    section: 'B',
    parentName: 'Meera Gupta',
    parentPhone: '+1 (555) 100-2105',
    teacherName: 'Mr. James Anderson',
    avatar: 'RG',
    location: 'Home',
    isParentChild: false,
    status: 'at_home',
    attendance: 'pending',
    absenceReason: '',
    absenceReasonRequested: false,
    absenceSmsSentAt: '',
    smsHistory: [],
    updatedAt: 'Demo start',
  },
];

function normalizeRecords(records: StudentTravelRecord[], baseRecords: StudentTravelRecord[] = backendBaseRecords) {
  const stored = new Map(records.map(record => [record.id, record]));
  return baseRecords.map(seed => {
    const saved = stored.get(seed.id);
    if (!saved) return seed;
    return {
      ...seed,
      absenceReason: saved.absenceReason,
      absenceReasonRequested: seed.absenceReasonRequested || saved.absenceReasonRequested,
      absenceSmsSentAt: saved.absenceSmsSentAt,
      smsHistory: saved.smsHistory ?? [],
    };
  });
}

function safeStatus(status: string): StudentTravelStatus {
  const allowed: StudentTravelStatus[] = ['at_home', 'to_school', 'reached_school', 'present', 'absent', 'going_home', 'reached_home'];
  return allowed.includes(status as StudentTravelStatus) ? status as StudentTravelStatus : 'at_home';
}

function safeAttendance(status: string): AttendanceMark {
  const allowed: AttendanceMark[] = ['pending', 'present', 'absent', 'late'];
  return allowed.includes(status as AttendanceMark) ? status as AttendanceMark : 'pending';
}

function locationForStatus(status: StudentTravelStatus) {
  const labels: Record<StudentTravelStatus, string> = {
    at_home: 'Home',
    to_school: 'Tracking to school',
    reached_school: 'Reached school campus',
    present: 'SafeReach at school',
    absent: 'Not reached school',
    going_home: 'Tracking to home',
    reached_home: 'SafeReach at home',
  };
  return labels[status];
}

function initials(name: string) {
  return name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase() || 'SR';
}

function backendStudentToTravelRecord(student: BackendStudent): StudentTravelRecord {
  const status = safeStatus(student.travel_status);
  return {
    id: student.id,
    name: student.full_name,
    roll: student.roll_no,
    className: student.class_name,
    section: student.section_name,
    parentName: student.guardian_name,
    parentPhone: student.parent_phone,
    teacherName: 'Stored teacher',
    avatar: initials(student.full_name),
    location: locationForStatus(status),
    isParentChild: true,
    status,
    attendance: safeAttendance(student.attendance_status),
    absenceReason: '',
    absenceReasonRequested: status === 'absent',
    absenceSmsSentAt: '',
    smsHistory: [],
    updatedAt: student.travel_updated_at || 'DB stored record',
  };
}

export function readTravelRecords(baseRecords: StudentTravelRecord[] = backendBaseRecords) {
  if (typeof window === 'undefined') return baseRecords;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(TRAVEL_STORAGE_KEY) ?? '[]') as StudentTravelRecord[];
    return normalizeRecords(Array.isArray(parsed) ? parsed : [], baseRecords);
  } catch {
    return baseRecords;
  }
}

function writeTravelRecords(records: StudentTravelRecord[]) {
  window.localStorage.setItem(TRAVEL_STORAGE_KEY, JSON.stringify(records));
  window.dispatchEvent(new Event(TRAVEL_EVENT));
}

function appendDb3RealtimeEvent(record: StudentTravelRecord, event: Omit<Db3RealtimeEvent, 'id' | 'studentId' | 'studentName' | 'createdAt'>) {
  if (typeof window === 'undefined') return;
  const createdAt = nowLabel();
  const nextEvent: Db3RealtimeEvent = {
    ...event,
    id: `${record.id}-${event.table}-${Date.now()}`,
    studentId: record.id,
    studentName: record.name,
    createdAt,
  };
  try {
    const existing = JSON.parse(window.localStorage.getItem(DB3_REALTIME_STORAGE_KEY) ?? '[]') as Db3RealtimeEvent[];
    const next = [nextEvent, ...(Array.isArray(existing) ? existing : [])].slice(0, 200);
    window.localStorage.setItem(DB3_REALTIME_STORAGE_KEY, JSON.stringify(next));
  } catch {
    window.localStorage.setItem(DB3_REALTIME_STORAGE_KEY, JSON.stringify([nextEvent]));
  }
}

function updateRecords(updater: (records: StudentTravelRecord[]) => StudentTravelRecord[]) {
  const updated = updater(readTravelRecords());
  writeTravelRecords(updated);
  return updated;
}

function updateOne(studentId: string, patch: Partial<StudentTravelRecord>) {
  return updateRecords(records =>
    records.map(record => record.id === studentId ? { ...record, ...patch, updatedAt: nowLabel() } : record)
  );
}

function smsStatusLabel(status: TeacherSmsStatus) {
  const labels: Record<TeacherSmsStatus, string> = {
    present: 'Present',
    absent: 'Absent',
    late: 'Late',
    reached_school: 'Reached School',
    going_home: 'Go Out / Going Home',
    reached_home: 'Reached Home',
  };
  return labels[status];
}

function buildSmsMessage(student: StudentTravelRecord, status: TeacherSmsStatus) {
  const base = `SafeReach: ${student.name} (${student.className}-${student.section})`;
  const messages: Record<TeacherSmsStatus, string> = {
    present: `${base} is marked Present and reached school safely. - ${student.teacherName}`,
    absent: `${base} is marked Absent today. Please send the absence reason to school. - ${student.teacherName}`,
    late: `${base} reached school Late. Attendance has been updated. - ${student.teacherName}`,
    reached_school: `${base} has Reached School. Attendance confirmation will follow. - ${student.teacherName}`,
    going_home: `${base} has left school and is Going Home. Please confirm when reached home. - ${student.teacherName}`,
    reached_home: `${base} is recorded as Reached Home. Thank you. - ${student.teacherName}`,
  };
  return messages[status];
}

function createSmsLog(student: StudentTravelRecord, status: TeacherSmsStatus): StudentSmsLog {
  const sentAt = nowLabel();
  return {
    id: `${student.id}-${status}-${Date.now()}`,
    status,
    message: buildSmsMessage(student, status),
    phone: student.parentPhone,
    sentAt,
    sentBy: student.teacherName,
  };
}

function updateOneWithSms(studentId: string, status: TeacherSmsStatus, patch: Partial<StudentTravelRecord>) {
  return updateRecords(records =>
    records.map(record => {
      if (record.id !== studentId) return record;
      const sms = createSmsLog(record, status);
      appendDb3RealtimeEvent(record, {
        table: status === 'going_home' || status === 'reached_home' ? 'travel_events' : 'teacher_events',
        actor: status === 'reached_home' ? 'parent' : 'teacher',
        event: smsStatusLabel(status),
        status,
        detail: sms.message,
      });
      appendDb3RealtimeEvent(record, {
        table: 'sms_events',
        actor: 'system',
        event: 'SMS preview generated',
        status,
        detail: sms.message,
      });
      return {
        ...record,
        ...patch,
        smsHistory: [sms, ...(record.smsHistory ?? [])].slice(0, 20),
        updatedAt: sms.sentAt,
      };
    })
  );
}

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.message || `Backend returned ${response.status}`);
  }
  return payload as T;
}

type BackendTravelPayload = {
  student_id: string;
  status: string;
  attendance_status?: string;
  event?: string;
  last_event_at?: string;
};

function applyBackendTravelPayload(records: StudentTravelRecord[], payload: BackendTravelPayload) {
  return records.map(record => {
    if (record.id !== payload.student_id) return record;
    const status = safeStatus(payload.status);
    return {
      ...record,
      status,
      attendance: safeAttendance(payload.attendance_status || record.attendance),
      location: locationForStatus(status),
      absenceReasonRequested: status === 'absent' || record.absenceReasonRequested,
      updatedAt: payload.last_event_at || nowLabel(),
    };
  });
}

function persistAndReturn(records: StudentTravelRecord[]) {
  writeTravelRecords(records);
  return records;
}

export function travelStatusLabel(status: StudentTravelStatus, audience: 'parent' | 'teacher' = 'parent') {
  if (audience === 'teacher' && status === 'present') return 'Present';
  if (audience === 'parent' && (status === 'present' || status === 'reached_school' || status === 'reached_home')) return 'SafeReach';
  if (audience === 'teacher' && status === 'reached_home') return 'SafeReach';
  const labels: Record<StudentTravelStatus, string> = {
    at_home: 'At Home',
    to_school: 'Tracking to School',
    reached_school: 'Reached School',
    present: 'Reached School',
    absent: 'Absent',
    going_home: 'Tracking to Home',
    reached_home: 'Reached Home',
  };
  return labels[status];
}

export function travelStatusIcon(status: StudentTravelStatus) {
  const icons: Record<StudentTravelStatus, string> = {
    at_home: 'home',
    to_school: 'directions_walk',
    reached_school: 'school',
    present: 'task_alt',
    absent: 'sms_failed',
    going_home: 'directions_bus',
    reached_home: 'home_pin',
  };
  return icons[status];
}

export function travelStatusClass(status: StudentTravelStatus) {
  const classes: Record<StudentTravelStatus, string> = {
    at_home: 'bg-surface-container text-on-surface-variant',
    to_school: 'bg-blue-100 text-blue-700',
    reached_school: 'bg-green-100 text-green-700',
    present: 'bg-green-100 text-green-700',
    absent: 'bg-error-container text-error',
    going_home: 'bg-yellow-100 text-yellow-700',
    reached_home: 'bg-green-100 text-green-700',
  };
  return classes[status];
}

export function useStudentTravelState() {
  const { data: backend } = useBackendBootstrap();
  const [records, setRecords] = useState<StudentTravelRecord[]>([]);

  useEffect(() => {
    backendBaseRecords = backend.students.map(backendStudentToTravelRecord);
    setRecords(readTravelRecords(backendBaseRecords));
    const refresh = () => setRecords(readTravelRecords(backendBaseRecords));
    window.addEventListener('storage', refresh);
    window.addEventListener(TRAVEL_EVENT, refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener(TRAVEL_EVENT, refresh);
    };
  }, [backend.students]);

  const actions = useMemo(() => ({
    async readyToSend(studentId: string) {
      const payload = await apiRequest<BackendTravelPayload>(`/student-travel/${encodeURIComponent(studentId)}/ready-to-school`, {
        method: 'POST',
        body: JSON.stringify({ actorUserId: null }),
      });
      let nextRecords: StudentTravelRecord[] = [];
      setRecords(current => {
        nextRecords = persistAndReturn(applyBackendTravelPayload(current, payload).map(record =>
          record.id === studentId
            ? { ...record, attendance: 'pending', absenceReason: '', absenceReasonRequested: false, absenceSmsSentAt: '' }
            : record
        ));
        return nextRecords;
      });
      const record = nextRecords.find(item => item.id === studentId);
      if (record) {
        appendDb3RealtimeEvent(record, {
          table: 'parent_events',
          actor: 'parent',
          event: 'Ready to Send',
          status: 'to_school',
          detail: `${record.name} is now Tracking to School.`,
        });
        appendDb3RealtimeEvent(record, {
          table: 'students_status',
          actor: 'system',
          event: 'Student travel status update',
          status: 'to_school',
          detail: 'Parent started school trip tracking.',
        });
      }
    },
    async markPresent(studentId: string) {
      const payload = await apiRequest<BackendTravelPayload>(`/student-travel/${encodeURIComponent(studentId)}/attendance`, {
        method: 'POST',
        body: JSON.stringify({ status: 'present', actorUserId: null }),
      });
      setRecords(current => persistAndReturn(applyBackendTravelPayload(current, payload).map(record =>
        record.id === studentId ? { ...record, absenceReasonRequested: false } : record
      )));
    },
    async markLate(studentId: string) {
      const payload = await apiRequest<BackendTravelPayload>(`/student-travel/${encodeURIComponent(studentId)}/attendance`, {
        method: 'POST',
        body: JSON.stringify({ status: 'late', actorUserId: null }),
      });
      setRecords(current => persistAndReturn(applyBackendTravelPayload(current, payload).map(record =>
        record.id === studentId ? { ...record, absenceReasonRequested: false } : record
      )));
    },
    async markReachedSchool(studentId: string) {
      const payload = await apiRequest<BackendTravelPayload>(`/student-travel/${encodeURIComponent(studentId)}/attendance`, {
        method: 'POST',
        body: JSON.stringify({ status: 'present', actorUserId: null }),
      });
      setRecords(current => persistAndReturn(applyBackendTravelPayload(current, payload).map(record =>
        record.id === studentId ? { ...record, absenceReasonRequested: false } : record
      )));
    },
    async markAbsent(studentId: string) {
      const payload = await apiRequest<BackendTravelPayload>(`/student-travel/${encodeURIComponent(studentId)}/attendance`, {
        method: 'POST',
        body: JSON.stringify({ status: 'absent', actorUserId: null }),
      });
      setRecords(current => persistAndReturn(applyBackendTravelPayload(current, payload).map(record =>
        record.id === studentId ? { ...record, absenceReasonRequested: true, absenceSmsSentAt: nowLabel() } : record
      )));
    },
    submitAbsenceReason(studentId: string, reason: string) {
      setRecords(updateOne(studentId, {
        absenceReason: reason.trim(),
        absenceReasonRequested: false,
      }));
    },
    async markLeavingSchool(studentIds: string[]) {
      const payload = await apiRequest<{ ok: boolean; records: BackendTravelPayload[] }>('/student-travel/go-out', {
        method: 'POST',
        body: JSON.stringify({ studentIds, actorUserId: null }),
      });
      setRecords(current => {
        const updated = payload.records.reduce((records, recordPayload) => applyBackendTravelPayload(records, recordPayload), current);
        return persistAndReturn(updated);
      });
    },
    async markReachedHome(studentId: string) {
      const payload = await apiRequest<BackendTravelPayload>(`/student-travel/${encodeURIComponent(studentId)}/reached-home`, {
        method: 'POST',
        body: JSON.stringify({ actorUserId: null }),
      });
      setRecords(current => persistAndReturn(applyBackendTravelPayload(current, payload)));
    },
    sendStatusSms(studentId: string, status: TeacherSmsStatus) {
      setRecords(updateOneWithSms(studentId, status, {}));
    },
    resetDemo() {
      writeTravelRecords(backendBaseRecords);
      setRecords(backendBaseRecords);
    },
  }), []);

  return {
    records,
    parentChildren: records.filter(record => record.isParentChild),
    classStudents: records,
    counts: {
      toSchool: records.filter(record => record.status === 'to_school').length,
      present: records.filter(record => record.status === 'present' || record.status === 'reached_school').length,
      absent: records.filter(record => record.status === 'absent').length,
      goingHome: records.filter(record => record.status === 'going_home').length,
      reachedHome: records.filter(record => record.status === 'reached_home').length,
    },
    smsLogs: records.flatMap(record => (record.smsHistory ?? []).map(log => ({ ...log, studentName: record.name, parentName: record.parentName })))
      .sort((a, b) => b.id.localeCompare(a.id)),
    smsStatusLabel,
    actions,
  };
}
