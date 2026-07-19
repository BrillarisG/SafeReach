'use client';

import Link from '@/src/next-link';
import { useMemo, useState } from 'react';
import { statusLabel, useBackendBootstrap } from '@/lib/backendData';

export default function AdminDashboardPage() {
  const { data, loading, error } = useBackendBootstrap();
  const firstClass = data.classes[0];
  const [selectedClassId, setSelectedClassId] = useState('');
  const selectedClass = data.classes.find(item => item.id === selectedClassId) ?? firstClass;
  const classReports = data.reports.filter(report => !selectedClass || report.class_name === selectedClass.class_name || !report.class_name);
  const selectedReport = classReports.find(report => report.class_name === selectedClass?.class_name) ?? data.reports[0];

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
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-stack-lg gap-4">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-primary">System Overview</h1>
          <p className="text-body-md text-on-surface-variant">Stored DB data for the active SafeReach school environment.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <select value={selectedClass?.id ?? ''} onChange={event => setSelectedClassId(event.target.value)} className="bg-white border border-outline-variant rounded-lg px-4 py-2 text-label-md focus:ring-2 focus:ring-primary focus:outline-none">
            {data.classes.map(item => <option key={item.id} value={item.id}>{item.class_name}</option>)}
          </select>
          <Link href="/admin/reports" className="bg-primary text-on-primary rounded-lg px-4 py-2 font-bold">Open Reports</Link>
        </div>
      </div>

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
        <div className="lg:col-span-2 bg-white rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.12)] overflow-hidden">
          <div className="p-stack-md border-b border-surface-container">
            <h3 className="font-headline-md text-on-surface">Stored Safety Reports</h3>
            <p className="text-label-md text-on-surface-variant">Only reports saved in DB-1 are displayed here.</p>
          </div>
          <div className="p-stack-md grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.reports.slice(0, 3).map(report => (
              <div key={report.id} className="bg-primary/5 rounded-xl p-4 border border-outline-variant/30">
                <div className="flex items-center justify-between mb-2"><p className="text-label-md text-on-surface-variant">{report.report_title}</p><span className="material-symbols-outlined text-primary">verified_user</span></div>
                <p className="font-headline-lg text-headline-lg text-primary">{report.safety_score}%</p>
                <p className="mt-2 text-label-sm text-on-surface-variant">{report.report_text}</p>
              </div>
            ))}
            {data.reports.length === 0 && <div className="rounded-xl border border-dashed border-outline-variant p-6 text-on-surface-variant">No stored reports found.</div>}
          </div>
          <div className="px-stack-md pb-stack-md">
            <h4 className="font-headline-md text-primary mb-3">Stored Classes</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
              {data.classes.map(item => {
                const studentCount = data.students.filter(student => student.class_name === item.class_name).length;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedClassId(item.id)}
                    className={`text-left rounded-xl border p-4 transition-all ${selectedClass?.id === item.id ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'border-outline-variant hover:bg-surface-container'}`}
                  >
                    <p className="font-bold text-primary">{item.class_name}</p>
                    <p className="text-label-sm text-on-surface-variant">{item.sections.length} stored sections</p>
                    <div className="flex justify-between mt-3 text-label-md"><span>Students</span><span className="font-bold">{studentCount}</span></div>
                  </button>
                );
              })}
            </div>
            <div className="rounded-xl border border-outline-variant bg-surface-container-low p-4">
              <p className="font-bold text-primary">{selectedClass?.class_name ?? 'No stored class selected'}</p>
              <p className="text-label-md text-on-surface-variant">{selectedReport?.report_text ?? 'No stored report for this class.'}</p>
            </div>
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
