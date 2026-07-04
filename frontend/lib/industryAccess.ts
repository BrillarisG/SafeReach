export type IndustryMenuKey = 'table' | 'messages' | 'attendance' | 'timetable' | 'reports';

export type IndustryMenuAccess = {
  schoolId: string;
  schoolName: string;
  autoEnablePaidMenus: boolean;
  menus: Record<IndustryMenuKey, boolean>;
  lastPaymentPlan: string;
  lastUpdatedAt: string;
};

export type PremiumPlan = {
  id: string;
  name: string;
  price: string;
  billing: string;
  description: string;
  menus: IndustryMenuKey[];
};

export type PremiumPaymentRequest = {
  id: string;
  schoolId: string;
  schoolName: string;
  adminName: string;
  planId: string;
  planName: string;
  price: string;
  billing: string;
  status: 'Requested' | 'Enabled' | 'Rejected';
  requestedAt: string;
  handledAt: string;
};

export const INDUSTRY_MENU_ACCESS_KEY = 'safereach_industry_menu_access';
export const PREMIUM_PAYMENT_REQUESTS_KEY = 'safereach_industry_premium_requests';
export const INDUSTRY_ACCESS_EVENT = 'safereach-industry-access-updated';

export const industryMenuItems: { key: IndustryMenuKey; label: string; description: string }[] = [
  { key: 'table', label: 'Premium Tables', description: 'Advanced class, student, and report table views.' },
  { key: 'messages', label: 'Messages', description: 'Admin, teacher, and parent communication menus.' },
  { key: 'attendance', label: 'Attendance', description: 'Daily attendance and travel status workflows.' },
  { key: 'timetable', label: 'Timetable', description: 'Class timetable planning and read-only parent views.' },
  { key: 'reports', label: 'Reports', description: 'Safety, attendance, and analytics reports.' },
];

export const premiumPlans: PremiumPlan[] = [
  {
    id: 'table-message-monthly',
    name: 'Table + Message',
    price: 'Rs 250',
    billing: 'Monthly',
    description: 'Enable premium table views and messaging menus for the school industry.',
    menus: ['table', 'messages'],
  },
  {
    id: 'message-monthly',
    name: 'Message Only',
    price: 'Rs 150',
    billing: 'Monthly',
    description: 'Enable messaging menus for school admin, teachers, and parent communication.',
    menus: ['messages'],
  },
  {
    id: 'table-message-yearly',
    name: 'Table + Message',
    price: 'Rs 2,999',
    billing: 'Yearly',
    description: 'Annual premium access for table views and messaging menus.',
    menus: ['table', 'messages'],
  },
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
      autoEnablePaidMenus: false,
      menus: { ...defaultMenuState },
      lastPaymentPlan: 'No premium request',
      lastUpdatedAt: 'Demo start',
    }));
  }

  const byId = new Map(readStoredIndustryMenuAccess().map(item => [item.schoolId, item]));
  return schools.map(school => {
    const stored = byId.get(school.id);
    return {
      schoolId: school.id,
      schoolName: school.name,
      autoEnablePaidMenus: stored?.autoEnablePaidMenus ?? false,
      menus: { ...defaultMenuState, ...(stored?.menus ?? {}) },
      lastPaymentPlan: stored?.lastPaymentPlan ?? 'No premium request',
      lastUpdatedAt: stored?.lastUpdatedAt ?? 'Demo start',
    };
  });
}

export function writeIndustryMenuAccess(records: IndustryMenuAccess[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(INDUSTRY_MENU_ACCESS_KEY, JSON.stringify(records));
  emitIndustryAccessEvent();
}

export function readPremiumPaymentRequests(): PremiumPaymentRequest[] {
  if (typeof window === 'undefined') return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(PREMIUM_PAYMENT_REQUESTS_KEY) ?? '[]') as PremiumPaymentRequest[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writePremiumPaymentRequests(requests: PremiumPaymentRequest[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(PREMIUM_PAYMENT_REQUESTS_KEY, JSON.stringify(requests));
  emitIndustryAccessEvent();
}

export function createPremiumPaymentRequest(input: {
  schoolId: string;
  schoolName: string;
  adminName: string;
  plan: PremiumPlan;
}) {
  const requests = readPremiumPaymentRequests();
  const request: PremiumPaymentRequest = {
    id: `PAY-${Date.now()}`,
    schoolId: input.schoolId,
    schoolName: input.schoolName,
    adminName: input.adminName,
    planId: input.plan.id,
    planName: input.plan.name,
    price: input.plan.price,
    billing: input.plan.billing,
    status: 'Requested',
    requestedAt: nowLabel(),
    handledAt: '',
  };
  writePremiumPaymentRequests([request, ...requests]);

  const access = readIndustryMenuAccess([{ id: input.schoolId, name: input.schoolName }]);
  const record = access[0];
  if (record?.autoEnablePaidMenus) {
    enableMenusForPlan(request.schoolId, request.schoolName, input.plan, 'Auto enabled after payment request');
    writePremiumPaymentRequests(readPremiumPaymentRequests().map(item => item.id === request.id ? { ...item, status: 'Enabled', handledAt: nowLabel() } : item));
  }

  return request;
}

export function enableMenusForPlan(schoolId: string, schoolName: string, plan: PremiumPlan, paymentLabel = plan.name) {
  const storedRecords = readStoredIndustryMenuAccess();
  const target = storedRecords.find(item => item.schoolId === schoolId) ?? {
    schoolId,
    schoolName,
    autoEnablePaidMenus: false,
    menus: { ...defaultMenuState },
    lastPaymentPlan: 'No premium request',
    lastUpdatedAt: 'Demo start',
  };
  const updated: IndustryMenuAccess = {
    ...target,
    menus: plan.menus.reduce((menus, key) => ({ ...menus, [key]: true }), { ...target.menus }),
    lastPaymentPlan: paymentLabel,
    lastUpdatedAt: nowLabel(),
  };

  const exists = storedRecords.some(item => item.schoolId === schoolId);
  writeIndustryMenuAccess(exists ? storedRecords.map(item => item.schoolId === schoolId ? updated : item) : [updated, ...storedRecords]);
}
