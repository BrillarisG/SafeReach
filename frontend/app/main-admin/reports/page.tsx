'use client';

import MainAdminShell from '@/components/MainAdminShell';
import { downloadTextFile } from '@/lib/downloadFile';

const reportRows = [
  { school: 'SafeReach Demo Academy', users: 2488, incidents: 7, attendance: '94%', alerts: 3, health: 'Good' },
  { school: 'Greenwood High School', users: 1284, incidents: 4, attendance: '96%', alerts: 1, health: 'Good' },
  { school: 'Green Valley Public School', users: 0, incidents: 0, attendance: 'Setup', alerts: 0, health: 'Pending Setup' },
];

const auditRows = [
  { time: '09 Jun 2026, 10:40 AM', role: 'Main Admin', action: 'Accepted school environment', api: 'app.main.school.accept', target: 'Green Valley Public School' },
  { time: '09 Jun 2026, 10:18 AM', role: 'School Admin', action: 'Assigned class incharge', api: 'app.admin.class.assign', target: 'Class 4 - Section B' },
  { time: '09 Jun 2026, 09:55 AM', role: 'Teacher', action: 'Edited assigned student', api: 'app.teacher.student.edit', target: 'ST-421' },
  { time: '09 Jun 2026, 09:30 AM', role: 'Main Admin', action: 'Reviewed permission rule', api: 'app.main.user.monitor', target: 'School Admin role' },
];

export default function MainAdminReportsPage() {
  function exportReport() {
    const csv = [
      'school,total_users,incidents,attendance,alerts,health',
      ...reportRows.map(row => `${row.school},${row.users},${row.incidents},${row.attendance},${row.alerts},${row.health}`),
    ].join('\n');
    downloadTextFile('safereach-main-admin-report.csv', csv, 'text/csv');
  }

  return (
    <MainAdminShell active="reports" title="Main Admin Reports" subtitle="App-level analytics for schools, users, incidents, permissions, and audit activity">
      <div className="p-container-padding-mobile md:p-container-padding-desktop space-y-stack-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-primary">Monitoring Reports</h1>
            <p className="text-body-md text-on-surface-variant">Consolidated frontend reports for every school environment and role action.</p>
          </div>
          <button type="button" onClick={exportReport} className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-primary text-on-primary rounded-lg font-bold hover:opacity-90">
            <span className="material-symbols-outlined text-[20px]">download</span>
            Export Main Admin CSV
          </button>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-gutter">
          {[
            { label: 'Schools Monitored', value: '03', icon: 'domain', color: 'text-primary', bg: 'bg-primary/10' },
            { label: 'Total Users', value: '3,772', icon: 'groups', color: 'text-secondary', bg: 'bg-secondary/10' },
            { label: 'Open Alerts', value: '04', icon: 'emergency_home', color: 'text-error', bg: 'bg-error-container' },
            { label: 'Permission Rules', value: '10', icon: 'rule', color: 'text-green-700', bg: 'bg-green-100' },
          ].map(card => (
            <div key={card.label} className="bg-white rounded-xl border border-outline-variant/50 p-stack-md shadow-sm flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full ${card.bg} ${card.color} flex items-center justify-center`}>
                <span className="material-symbols-outlined">{card.icon}</span>
              </div>
              <div>
                <p className="text-label-md text-on-surface-variant">{card.label}</p>
                <p className={`text-headline-md font-bold ${card.color}`}>{card.value}</p>
              </div>
            </div>
          ))}
        </section>

        <section className="bg-white rounded-xl border border-outline-variant/50 shadow-sm overflow-hidden">
          <div className="p-stack-md border-b border-outline-variant/40">
            <h2 className="font-headline-md text-headline-md text-primary">School Health Overview</h2>
            <p className="text-label-md text-on-surface-variant">App-wide view of school usage, incidents, attendance, and setup status.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="bg-surface-container-low text-on-surface-variant text-label-md">
                <tr>{['School', 'Users', 'Incidents', 'Attendance', 'Open Alerts', 'Health'].map(head => <th key={head} className="px-5 py-4 font-bold">{head}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40">
                {reportRows.map(row => (
                  <tr key={row.school} className="hover:bg-surface-container-low">
                    <td className="px-5 py-4 font-bold text-primary">{row.school}</td>
                    <td className="px-5 py-4">{row.users}</td>
                    <td className="px-5 py-4">{row.incidents}</td>
                    <td className="px-5 py-4">{row.attendance}</td>
                    <td className="px-5 py-4"><span className={`status-chip ${row.alerts > 0 ? 'bg-error-container text-error' : 'bg-green-100 text-green-700'}`}>{row.alerts}</span></td>
                    <td className="px-5 py-4"><span className="status-chip bg-primary/10 text-primary">{row.health}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-2 gap-gutter">
          <div className="bg-white rounded-xl border border-outline-variant/50 shadow-sm p-stack-md">
            <h2 className="font-headline-md text-headline-md text-primary mb-4">Role Activity Audit</h2>
            <div className="space-y-3">
              {auditRows.map(row => (
                <div key={`${row.time}-${row.api}`} className="rounded-xl border border-outline-variant p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <p className="font-bold text-on-surface">{row.action}</p>
                    <span className="text-label-sm text-on-surface-variant">{row.time}</span>
                  </div>
                  <p className="text-label-md text-on-surface-variant">{row.role} - {row.target}</p>
                  <p className="font-mono text-xs text-primary mt-1">{row.api}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-outline-variant/50 shadow-sm p-stack-md">
            <h2 className="font-headline-md text-headline-md text-primary mb-4">Monitoring Priorities</h2>
            <div className="space-y-4">
              {[
                ['School onboarding queue', 'Pending school requests must be accepted or rejected by main admin before the school admin can operate.'],
                ['Permission drift review', 'Main admin should review add, edit, and delete API privileges before enabling high-risk actions.'],
                ['Class assignment coverage', 'Each class section should have one assigned incharge teacher before students are added.'],
                ['Incident visibility', 'All school incident reports remain visible to main admin for app-level safety monitoring.'],
              ].map(([title, detail]) => (
                <div key={title} className="flex gap-3">
                  <span className="material-symbols-outlined text-primary mt-0.5">check_circle</span>
                  <div>
                    <p className="font-bold text-on-surface">{title}</p>
                    <p className="text-label-md text-on-surface-variant">{detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </MainAdminShell>
  );
}
