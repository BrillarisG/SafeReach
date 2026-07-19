'use client';

import Link from '@/src/next-link';
import { useMemo } from 'react';
import { statusLabel, useBackendBootstrap } from '@/lib/backendData';

export default function AdminDashboardPage() {
  const { data, loading, error } = useBackendBootstrap();
  const stats = useMemo(() => {
    const present = data.attendance.filter(item => item.status === 'present').length;
    const absent = data.attendance.filter(item => item.status === 'absent').length;
    return {
      students: data.students.length,
      present,
      pendingReviews: data.incidents.filter(item => item.status === 'pending').length,
      alerts: data.incidents.filter(item => ['critical', 'high'].includes(item.level.toLowerCase())).length,
      absent,
    };
  }, [data]);

  return (
    <div className="p-container-padding-mobile md:p-container-padding-desktop">
      {loading && <div className="rounded-xl bg-white border border-outline-variant p-stack-md text-primary font-bold">Loading backend stored data...</div>}
      {error && <div className="rounded-xl bg-error-container border border-error/20 p-stack-md text-error font-bold">Backend data unavailable: {error}</div>}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-stack-lg">
        {[
          { label: 'Stored Students', value: String(stats.students), icon: 'groups', c: 'text-primary', bg: 'bg-primary-fixed' },
          { label: 'Present Today', value: String(stats.present), icon: 'task_alt', c: 'text-green-700', bg: 'bg-green-100' },
          { label: 'Pending Reviews', value: String(stats.pendingReviews), icon: 'pending_actions', c: 'text-secondary', bg: 'bg-secondary-container' },
          { label: 'Active Alerts', value: String(stats.alerts), icon: 'emergency_home', c: 'text-error', bg: 'bg-error-container border-l-4 border-error' },
        ].map(card => (
          <div key={card.label} className={`bg-white p-3 rounded-xl shadow-sm flex items-center gap-3 ${card.bg.includes('border') ? card.bg : ''}`}>
            <div className={`w-10 h-10 rounded-full ${card.bg.includes('border') ? 'bg-error-container' : card.bg} flex items-center justify-center`}>
              <span className={`material-symbols-outlined ${card.c}`}>{card.icon}</span>
            </div>
            <div><p className="text-label-md text-on-surface-variant">{card.label}</p><p className={`text-headline-md font-bold ${card.c}`}>{card.value}</p></div>
          </div>
        ))}
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.12)] overflow-hidden p-stack-md">
          <h3 className="font-headline-md text-on-surface mb-4">Class Records</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {data.classes.map(item => {
              const studentCount = data.students.filter(student => student.class_name === item.class_name).length;
              const section = item.sections[0]?.name ?? '';
              return (
                <Link
                  key={item.id}
                  href={`/admin/students/class-view?class=${encodeURIComponent(item.class_name)}&section=${encodeURIComponent(section)}`}
                  className="rounded-xl border border-outline-variant bg-surface-container-low p-4 transition-colors hover:border-primary hover:bg-primary/5"
                >
                  <span className="material-symbols-outlined text-primary">school</span>
                  <p className="mt-2 font-bold text-primary">{item.class_name}</p>
                  <p className="text-label-sm text-on-surface-variant">Section {section || '-'}</p>
                  <div className="mt-3 flex items-center justify-between text-label-md"><span>Students</span><span className="font-bold text-primary">{studentCount}</span></div>
                </Link>
              );
            })}
            {data.classes.length === 0 && <div className="rounded-xl border border-dashed border-outline-variant p-6 text-on-surface-variant">No class records found.</div>}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.12)] p-stack-md flex flex-col">
          <h3 className="font-headline-md text-on-surface mb-stack-lg">Stored Attendance Status</h3>
          <div className="flex-1 flex flex-col justify-center gap-5">
            {['present', 'absent', 'late', 'pending'].map(status => {
              const count = data.attendance.filter(item => item.status === status).length || data.students.filter(item => item.attendance_status === status).length;
              const pct = data.students.length ? Math.round((count / data.students.length) * 100) : 0;
              return (
                <div key={status} className="space-y-2">
                  <div className="flex justify-between text-label-md"><span className="text-on-surface-variant">{statusLabel(status)}</span><span className="font-bold text-primary">{count}</span></div>
                  <div className="w-full h-3 bg-surface-container rounded-full overflow-hidden"><div className="bg-primary h-full rounded-full" style={{ width: `${pct}%` }}></div></div>
                </div>
              );
            })}
          </div>
          <Link href="/admin/reports" className="mt-stack-lg w-full py-3 bg-surface-container-high text-primary font-bold rounded-lg hover:bg-surface-container-highest transition-colors text-center">View Stored Report</Link>
        </div>
      </section>
    </div>
  );
}
