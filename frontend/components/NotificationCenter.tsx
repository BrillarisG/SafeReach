'use client';

import { useEffect, useState } from 'react';
import { readDb3Notifications, type NotificationAudience } from '@/lib/notifications';
import type { Db3RealtimeEvent } from '@/lib/studentTravel';

const tableStyle: Record<string, string> = {
  students_status: 'bg-blue-100 text-blue-700',
  teacher_events: 'bg-green-100 text-green-700',
  parent_events: 'bg-primary/10 text-primary',
  travel_events: 'bg-yellow-100 text-yellow-700',
  sms_events: 'bg-surface-container-high text-on-surface-variant',
  payment_events: 'bg-purple-100 text-purple-700',
};

export default function NotificationCenter({ audience }: { audience: NotificationAudience }) {
  const [events, setEvents] = useState<Db3RealtimeEvent[]>([]);

  useEffect(() => {
    setEvents(readDb3Notifications(audience));
    const refresh = () => setEvents(readDb3Notifications(audience));
    window.addEventListener('storage', refresh);
    window.addEventListener('safereach-travel-state-updated', refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('safereach-travel-state-updated', refresh);
    };
  }, [audience]);

  return (
    <div className="p-container-padding-mobile md:p-container-padding-desktop space-y-stack-lg">
      <section className="bg-white rounded-xl border border-outline-variant/40 shadow-sm p-stack-md">
        <h1 className="font-headline-lg text-headline-lg text-primary">Notifications</h1>
        <p className="text-body-md text-on-surface-variant">Realtime DB3 frontend notifications for SafeReach travel, attendance, SMS, and status events.</p>
      </section>
      <section className="bg-white rounded-xl border border-outline-variant/40 shadow-sm overflow-hidden">
        <div className="divide-y divide-outline-variant/30">
          {events.map(event => (
            <article key={event.id} className="p-stack-md flex flex-col md:flex-row md:items-center gap-4 hover:bg-surface-container-low transition-colors">
              <div className="w-11 h-11 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined">notifications_active</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-bold text-primary">{event.event}</h2>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${tableStyle[event.table] ?? tableStyle.students_status}`}>{event.table}</span>
                </div>
                <p className="text-body-md text-on-surface">{event.studentName}: {event.detail}</p>
                <p className="text-label-sm text-on-surface-variant">Actor: {event.actor} | Status: {event.status} | {event.createdAt}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
