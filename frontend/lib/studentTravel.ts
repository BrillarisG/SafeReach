'use client';

import { useEffect, useMemo, useState } from 'react';

export type StudentTravelStatus =
  | 'at_home'
  | 'to_school'
  | 'reached_school'
  | 'present'
  | 'absent'
  | 'going_home'
  | 'reached_home';

export type AttendanceMark = 'pending' | 'present' | 'absent' | 'late';

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
  updatedAt: string;
};

export const TRAVEL_STORAGE_KEY = 'safereach_student_travel_attendance';
const TRAVEL_EVENT = 'safereach-travel-state-updated';

const nowLabel = () => new Date().toLocaleString();

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
    updatedAt: 'Demo start',
  },
];

function normalizeRecords(records: StudentTravelRecord[]) {
  const stored = new Map(records.map(record => [record.id, record]));
  return seedTravelRecords.map(seed => ({ ...seed, ...(stored.get(seed.id) ?? {}) }));
}

export function readTravelRecords() {
  if (typeof window === 'undefined') return seedTravelRecords;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(TRAVEL_STORAGE_KEY) ?? '[]') as StudentTravelRecord[];
    return normalizeRecords(Array.isArray(parsed) ? parsed : []);
  } catch {
    return seedTravelRecords;
  }
}

function writeTravelRecords(records: StudentTravelRecord[]) {
  window.localStorage.setItem(TRAVEL_STORAGE_KEY, JSON.stringify(records));
  window.dispatchEvent(new Event(TRAVEL_EVENT));
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

export function travelStatusLabel(status: StudentTravelStatus, audience: 'parent' | 'teacher' = 'parent') {
  if (audience === 'teacher' && status === 'present') return 'Present';
  const labels: Record<StudentTravelStatus, string> = {
    at_home: 'At Home',
    to_school: 'Out of Home to School',
    reached_school: 'Reached School',
    present: 'Reached School',
    absent: 'Absent',
    going_home: 'Going Home',
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
  const [records, setRecords] = useState<StudentTravelRecord[]>(seedTravelRecords);

  useEffect(() => {
    setRecords(readTravelRecords());
    const refresh = () => setRecords(readTravelRecords());
    window.addEventListener('storage', refresh);
    window.addEventListener(TRAVEL_EVENT, refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener(TRAVEL_EVENT, refresh);
    };
  }, []);

  const actions = useMemo(() => ({
    readyToSend(studentId: string) {
      setRecords(updateOne(studentId, {
        status: 'to_school',
        attendance: 'pending',
        location: 'On the way to school',
        absenceReason: '',
        absenceReasonRequested: false,
        absenceSmsSentAt: '',
      }));
    },
    markPresent(studentId: string) {
      setRecords(updateOne(studentId, {
        status: 'present',
        attendance: 'present',
        location: 'Reached school campus',
        absenceReasonRequested: false,
      }));
    },
    markLate(studentId: string) {
      setRecords(updateOne(studentId, {
        status: 'present',
        attendance: 'late',
        location: 'Reached school campus late',
        absenceReasonRequested: false,
      }));
    },
    markAbsent(studentId: string) {
      setRecords(updateOne(studentId, {
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
        records.map(record => studentIds.includes(record.id)
          ? { ...record, status: 'going_home', location: 'Left school and going home', updatedAt: nowLabel() }
          : record
        )
      ));
    },
    markReachedHome(studentId: string) {
      setRecords(updateOne(studentId, {
        status: 'reached_home',
        location: 'Reached home',
      }));
    },
    resetDemo() {
      writeTravelRecords(seedTravelRecords);
      setRecords(seedTravelRecords);
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
    actions,
  };
}
