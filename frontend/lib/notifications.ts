'use client';

import { DB3_REALTIME_STORAGE_KEY, type Db3RealtimeEvent } from './studentTravel';
import { readPremiumPaymentRequests } from './industryAccess';

export type NotificationAudience = 'admin' | 'teacher' | 'parent' | 'main-admin';

const fallbackNotifications: Db3RealtimeEvent[] = [
  {
    id: 'demo-parent-ready',
    table: 'parent_events',
    studentId: 'st-leo-thompson',
    studentName: 'Leo Thompson',
    actor: 'parent',
    event: 'Ready to Send',
    status: 'to_school',
    detail: 'Leo Thompson is Tracking to School.',
    createdAt: 'Demo start',
  },
  {
    id: 'demo-teacher-present',
    table: 'teacher_events',
    studentId: 'st-maya-thompson',
    studentName: 'Maya Thompson',
    actor: 'teacher',
    event: 'Present',
    status: 'present',
    detail: 'Maya Thompson is marked Present. Parent sees SafeReach.',
    createdAt: 'Demo start',
  },
];

export function readDb3Notifications(audience: NotificationAudience) {
  if (typeof window === 'undefined') return fallbackNotifications;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(DB3_REALTIME_STORAGE_KEY) ?? '[]') as Db3RealtimeEvent[];
    const paymentEvents: Db3RealtimeEvent[] = readPremiumPaymentRequests().map(request => ({
      id: request.id,
      table: 'payment_events',
      studentId: request.schoolId,
      studentName: request.schoolName,
      actor: request.status === 'Requested' ? 'admin' : 'main-admin',
      event: `Premium ${request.status}`,
      status: request.status === 'Enabled' ? 'menu_enabled' : request.status === 'Rejected' ? 'payment_rejected' : 'payment_requested',
      detail: `${request.planName} ${request.billing} ${request.price}. PayPal is display-only in this frontend demo.`,
      createdAt: request.handledAt || request.requestedAt,
    }));
    const baseEvents = Array.isArray(parsed) && parsed.length > 0 ? parsed : fallbackNotifications;
    const events = [...paymentEvents, ...baseEvents];
    if (audience === 'teacher') {
      return events.filter(event => event.actor !== 'teacher');
    }
    if (audience === 'parent') {
      return events.filter(event => event.table === 'teacher_events' || event.table === 'travel_events' || event.table === 'students_status');
    }
    return events;
  } catch {
    return fallbackNotifications;
  }
}
