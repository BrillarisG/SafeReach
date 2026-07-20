'use client';

import { useEffect, useState } from 'react';
import { apiBaseUrl } from './runtimeConfig';

const API_BASE = apiBaseUrl;

export type BackendStudent = {
  id: string;
  student_code: string;
  full_name: string;
  roll_no: string;
  class_name: string;
  section_name: string;
  guardian_name: string;
  parent_phone: string;
  sms_enabled: boolean;
  travel_status: string;
  attendance_status: string;
  travel_updated_at?: string;
};

export type BackendTeacher = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  employee_code: string;
  subject: string;
  qualification: string;
  status: string;
  assignments: Array<{ className: string; sectionName: string; assignmentType: string; subject: string }>;
};

export type BackendClass = {
  id: string;
  class_name: string;
  sort_order: number;
  sections: Array<{ id: string; name: string; room: string }>;
};

export type BackendReport = {
  id: string;
  report_title: string;
  safety_score: number;
  alert_count: number;
  attendance_percent: string;
  report_text: string;
  class_name?: string | null;
  section_name?: string | null;
};

export type BackendIncident = {
  id: string;
  incident_code: string;
  incident_type: string;
  level: string;
  priority: string;
  status: string;
  handler_name: string;
  student_name: string;
  class_name: string;
  section_name: string;
  detail: string;
};

export type BackendAttendance = {
  id: string;
  student_id: string;
  student_name: string;
  attendance_date: string;
  session: string;
  status: string;
  locked: boolean;
};

export type BackendApiTest = {
  id: string;
  test_name: string;
  service_name: string;
  status: string;
  detail: string;
  created_at: string;
};

export type BackendBootstrap = {
  schools: Array<{ id: string; name: string; code: string; status: string }>;
  classes: BackendClass[];
  teachers: BackendTeacher[];
  students: BackendStudent[];
  attendance: BackendAttendance[];
  reports: BackendReport[];
  incidents: BackendIncident[];
  apiTests: BackendApiTest[];
  timetable: {
    className: string;
    section: string;
    breaks: Array<{ id: string; label: string; afterPeriod: number; tone: string }>;
    days: Array<{ id: string; label: string; periods: string[] }>;
  };
};

const emptyBootstrap: BackendBootstrap = {
  schools: [],
  classes: [],
  teachers: [],
  students: [],
  attendance: [],
  reports: [],
  incidents: [],
  apiTests: [],
  timetable: { className: '', section: '', breaks: [], days: [] },
};

export function useBackendBootstrap() {
  const [data, setData] = useState<BackendBootstrap>(emptyBootstrap);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    fetch(`${API_BASE}/bootstrap`, { cache: 'no-store' })
      .then(async response => {
        const payload = await response.json().catch(() => null);
        if (!response.ok) {
          const message = payload && typeof payload.message === 'string'
            ? payload.message
            : `Backend returned ${response.status}`;
          throw new Error(message);
        }
        return payload as BackendBootstrap;
      })
      .then(payload => {
        if (!active) return;
        setData(payload);
        setError('');
      })
      .catch(reason => {
        if (!active) return;
        setData(emptyBootstrap);
        setError(reason instanceof Error ? reason.message : 'Backend data unavailable');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return { data, loading, error };
}

export function statusLabel(status: string) {
  return status.split('_').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
}
