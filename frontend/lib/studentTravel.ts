'use client';

import { useEffect, useMemo, useState } from 'react';
import { type BackendStudent, useBackendBootstrap } from '@/lib/backendData';

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
  return baseRecords.map(seed => ({ ...seed, ...(stored.get(seed.id) ?? {}) }));
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
    updatedAt: 'DB stored record',
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
    reached_home: 'bg-primary/10 text-primary',
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
    readyToSend(studentId: string) {
      const updated = updateOne(studentId, {
        status: 'to_school',
        attendance: 'pending',
        location: 'Tracking to school',
        absenceReason: '',
        absenceReasonRequested: false,
        absenceSmsSentAt: '',
      });
      const record = updated.find(item => item.id === studentId);
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
      setRecords(updated);
    },
    markPresent(studentId: string) {
      setRecords(updateOneWithSms(studentId, 'present', {
        status: 'present',
        attendance: 'present',
        location: 'SafeReach at school',
        absenceReasonRequested: false,
      }));
    },
    markLate(studentId: string) {
      setRecords(updateOneWithSms(studentId, 'late', {
        status: 'present',
        attendance: 'late',
        location: 'SafeReach at school - late arrival',
        absenceReasonRequested: false,
      }));
    },
    markReachedSchool(studentId: string) {
      setRecords(updateOneWithSms(studentId, 'reached_school', {
        status: 'reached_school',
        attendance: 'pending',
        location: 'Reached school campus',
        absenceReasonRequested: false,
      }));
    },
    markAbsent(studentId: string) {
      setRecords(updateOneWithSms(studentId, 'absent', {
        status: 'absent',
        attendance: 'absent',
        location: 'Not reached school',
        absenceReasonRequested: true,
        absenceSmsSentAt: nowLabel(),
      }));
    },
    submitAbsenceReason(studentId: string, reason: string) {
      setRecords(updateOne(studentId, {
        absenceReason: reason.trim(),
        absenceReasonRequested: false,
      }));
    },
    markLeavingSchool(studentIds: string[]) {
      setRecords(updateRecords(records =>
        records.map(record => {
          if (!studentIds.includes(record.id)) return record;
          const sms = createSmsLog(record, 'going_home');
          appendDb3RealtimeEvent(record, {
            table: 'teacher_events',
            actor: 'teacher',
            event: 'Student Out of School',
            status: 'going_home',
            detail: `${record.name} is Tracking to Home.`,
          });
          appendDb3RealtimeEvent(record, {
            table: 'students_status',
            actor: 'system',
            event: 'Student travel status update',
            status: 'going_home',
            detail: 'Teacher submitted go-out attendance.',
          });
          return {
            ...record,
            status: 'going_home',
            location: 'Tracking to home',
            smsHistory: [sms, ...(record.smsHistory ?? [])].slice(0, 20),
            updatedAt: sms.sentAt,
          };
        })
      ));
    },
    markReachedHome(studentId: string) {
      setRecords(updateOneWithSms(studentId, 'reached_home', {
        status: 'reached_home',
        location: 'SafeReach at home',
      }));
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
