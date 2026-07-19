'use client';

import Link from '@/src/next-link';
import { useMemo } from 'react';
import { useBackendBootstrap } from '@/lib/backendData';

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

      <section className="mx-auto w-full max-w-5xl bg-white rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.12)] p-stack-md">
          <h3 className="font-headline-md text-on-surface mb-4">Class Records</h3>
          <div className="grid grid-cols-1 justify-items-center sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {data.classes.map(item => {
              const classStudents = data.students.filter(student => student.class_name === item.class_name);
              const studentCount = classStudents.length;
              const presentCount = classStudents.filter(student => student.attendance_status === 'present').length;
              const safetyPercent = studentCount ? Math.round((presentCount / studentCount) * 100) : 0;
              const section = item.sections[0]?.name ?? '';
              return (
                <Link
                  key={item.id}
                  href={`/admin/students/class-view?class=${encodeURIComponent(item.class_name)}&section=${encodeURIComponent(section)}`}
                  className="class-record-font w-full max-w-[180px] rounded-[22px] border border-outline-variant/70 bg-surface-container-low px-5 py-4 shadow-sm transition-colors hover:border-primary hover:bg-primary/5"
                >
                  <p className="text-[24px] leading-none font-extrabold text-on-surface">{item.class_name}</p>
                  <p className="mt-1 text-[16px] leading-none font-bold text-outline">Section {section || '-'}</p>
                  <p className="mt-5 text-[16px] leading-none font-extrabold text-primary-container">Students: {String(studentCount).padStart(2, '0')}</p>
                  <p className="mt-2 text-[16px] leading-none font-extrabold text-green-700">SafeReach: {safetyPercent}%</p>
                </Link>
              );
            })}
            {data.classes.length === 0 && <div className="rounded-xl border border-dashed border-outline-variant p-6 text-on-surface-variant">No class records found.</div>}
          </div>
      </section>
    </div>
  );
}
