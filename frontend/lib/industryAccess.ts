import { apiBaseUrl } from './runtimeConfig';

export type IndustryMenuKey = 'table' | 'messages' | 'attendance' | 'timetable' | 'reports';

export type IndustryMenuAccess = {
  schoolId: string;
  schoolName: string;
  menus: Record<IndustryMenuKey, boolean>;
  lastUpdatedAt: string;
};

export const INDUSTRY_MENU_ACCESS_KEY = 'safereach_industry_menu_access';
export const INDUSTRY_ACCESS_EVENT = 'safereach-industry-access-updated';
const API_BASE = apiBaseUrl;

export const industryMenuItems: { key: IndustryMenuKey; label: string; description: string }[] = [
  { key: 'table', label: 'Tables', description: 'Class, student, report, and operations table views.' },
  { key: 'messages', label: 'Messages', description: 'Admin, teacher, and parent communication menus.' },
  { key: 'attendance', label: 'Attendance', description: 'Daily attendance and travel status workflows.' },
  { key: 'timetable', label: 'Timetable', description: 'Class timetable planning and read-only parent views.' },
  { key: 'reports', label: 'Reports', description: 'Safety, attendance, and analytics reports.' },
];

export const defaultMenuState: Record<IndustryMenuKey, boolean> = {
  table: false,
  messages: false,
  attendance: true,
  timetable: true,
  reports: true,
};

const nowLabel = () => new Date().toLocaleString();

function emitIndustryAccessEvent() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(INDUSTRY_ACCESS_EVENT));
  }
}

function readStoredIndustryMenuAccess(): IndustryMenuAccess[] {
  if (typeof window === 'undefined') return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(INDUSTRY_MENU_ACCESS_KEY) ?? '[]') as IndustryMenuAccess[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function readIndustryMenuAccess(schools: { id: string; name: string }[]): IndustryMenuAccess[] {
  if (typeof window === 'undefined') {
    return schools.map(school => ({
      schoolId: school.id,
      schoolName: school.name,
      menus: { ...defaultMenuState },
      lastUpdatedAt: 'Demo start',
    }));
  }

  const byId = new Map(readStoredIndustryMenuAccess().map(item => [item.schoolId, item]));
  return schools.map(school => {
    const stored = byId.get(school.id);
    return {
      schoolId: school.id,
      schoolName: school.name,
      menus: { ...defaultMenuState, ...(stored?.menus ?? {}) },
      lastUpdatedAt: stored?.lastUpdatedAt ?? 'Demo start',
    };
  });
}

export function writeIndustryMenuAccess(records: IndustryMenuAccess[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(INDUSTRY_MENU_ACCESS_KEY, JSON.stringify(records));
  emitIndustryAccessEvent();
}

export async function fetchIndustryMenuAccess(schools: { id: string; name: string }[]) {
  try {
    const response = await fetch(`${API_BASE}/industry-menu-access`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Backend returned ${response.status}`);
    const payload = await response.json() as { access?: IndustryMenuAccess[] };
    if (!Array.isArray(payload.access)) return readIndustryMenuAccess(schools);
    const schoolNames = new Map(schools.map(school => [school.id, school.name]));
    const normalized = payload.access.map(record => ({
      schoolId: record.schoolId,
      schoolName: record.schoolName || schoolNames.get(record.schoolId) || record.schoolId,
      menus: { ...defaultMenuState, ...record.menus },
      lastUpdatedAt: record.lastUpdatedAt || nowLabel(),
    }));
    writeIndustryMenuAccess(normalized);
    return readIndustryMenuAccess(schools);
  } catch {
    return readIndustryMenuAccess(schools);
  }
}

export async function saveIndustryMenuAccess(input: {
  schoolId: string;
  schoolName: string;
  menuKey: IndustryMenuKey;
  enabled: boolean;
}) {
  try {
    await fetch(`${API_BASE}/industry-menu-access/${encodeURIComponent(input.schoolId)}/${input.menuKey}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: input.enabled, schoolName: input.schoolName, actorUserId: 'main-admin-demo' }),
    });
  } catch {
    // The frontend keeps localStorage as an offline fallback when the backend is not running.
  }
}
