'use client';

import { useState } from 'react';
import { downloadTextFile } from '@/lib/downloadFile';

const recentReports = [
  { id: 'RPT-001', title: 'Monthly Safety Summary - May 2025', type: 'Safety', date: 'May 28, 2025', status: 'Published', author: 'System Auto' },
  { id: 'RPT-002', title: 'Term 2 Attendance Analysis', type: 'Attendance', date: 'May 25, 2025', status: 'Published', author: 'Admin Priya' },
  { id: 'RPT-003', title: 'Incident Overview Q1 2025', type: 'Incident', date: 'May 20, 2025', status: 'Draft', author: 'Admin Priya' },
  { id: 'RPT-004', title: 'Staff Performance Review - April', type: 'Staff', date: 'May 10, 2025', status: 'Published', author: 'Admin Raj' },
  { id: 'RPT-005', title: 'Emergency Response Drill Log', type: 'Safety', date: 'May 5, 2025', status: 'Published', author: 'Admin Raj' },
];
const weekData = [65, 78, 82, 70, 88, 75, 90];
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const incidentTypes = [
  { label: 'Medical', count: 8, pct: 33, color: 'bg-red-400' },
  { label: 'Bullying', count: 5, pct: 21, color: 'bg-orange-400' },
  { label: 'Injury', count: 6, pct: 25, color: 'bg-yellow-400' },
  { label: 'Absence', count: 3, pct: 13, color: 'bg-blue-400' },
  { label: 'Other', count: 2, pct: 8, color: 'bg-gray-300' },
];

export default function AdminReportsPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'incident' | 'attendance' | 'staff'>('overview');
  const [selectedReport, setSelectedReport] = useState<(typeof recentReports)[number] | null>(null);
  const [notice, setNotice] = useState('');

  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 2500);
  }

  function downloadReport(report: (typeof recentReports)[number]) {
    downloadTextFile(
      `${report.id}-${report.title.replaceAll(' ', '-').toLowerCase()}.txt`,
      [
        'SafeReach Report',
        `Report ID: ${report.id}`,
        `Title: ${report.title}`,
        `Type: ${report.type}`,
        `Date: ${report.date}`,
        `Status: ${report.status}`,
        `Author: ${report.author}`,
        '',
        'This frontend demo export will be replaced by backend-generated PDF/CSV reports later.',
      ].join('\n')
    );
    showNotice(`${report.id} downloaded.`);
  }

  function exportReports() {
    const csv = [
      'Report ID,Title,Type,Date,Status,Author',
      ...recentReports.map(report => [report.id, `"${report.title}"`, report.type, report.date, report.status, report.author].join(',')),
    ].join('\n');
    downloadTextFile('safereach-safety-reports.csv', csv, 'text/csv');
    showNotice('Safety reports export downloaded.');
  }

  return (
    <div className="p-container-padding-mobile md:p-container-padding-desktop">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-stack-lg gap-4">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-primary">Safety Reports</h1>
          <p className="text-body-md text-on-surface-variant">Analytics and reports for academic session 2024-25</p>
        </div>
        <div className="flex gap-3">
          <select className="bg-white border border-outline-variant rounded-lg px-4 py-2 text-label-md focus:ring-2 focus:ring-primary focus:outline-none">
            <option>May 2025</option><option>April 2025</option><option>March 2025</option>
          </select>
          <button onClick={exportReports} className="flex items-center gap-2 bg-secondary text-on-secondary px-4 py-2 rounded-lg font-label-md hover:opacity-90 shadow-sm">
            <span className="material-symbols-outlined text-[18px]">download</span>Export CSV
          </button>
        </div>
      </div>
      {notice && <div className="mb-4 bg-green-50 border border-green-100 text-green-700 px-4 py-3 rounded-lg font-label-md">{notice}</div>}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-stack-lg">
        {[
          { label: 'Reports Generated', value: '47', delta: '+12%', icon: 'description', c: 'text-primary', bg: 'bg-primary/5 border-primary/20' },
          { label: 'Avg Response Time', value: '2.4h', delta: '-18%', icon: 'schedule', c: 'text-green-600', bg: 'bg-green-50 border-green-100' },
          { label: 'Compliance Score', value: '94%', delta: '+3%', icon: 'verified', c: 'text-secondary', bg: 'bg-secondary/5 border-secondary/20' },
          { label: 'Pending Review', value: '5', delta: '-2', icon: 'pending_actions', c: 'text-orange-600', bg: 'bg-orange-50 border-orange-100' },
        ].map(card => (
          <div key={card.label} className={`p-stack-md rounded-xl border ${card.bg}`}>
            <div className="flex items-center justify-between mb-2"><p className="text-label-md text-on-surface-variant">{card.label}</p><span className={`material-symbols-outlined text-[20px] ${card.c}`}>{card.icon}</span></div>
            <p className={`font-headline-md text-headline-md ${card.c}`}>{card.value}</p>
            <p className="text-label-sm text-green-600 mt-1">{card.delta} vs last month</p>
          </div>
        ))}
      </div>

      <div className="flex gap-1 mb-stack-lg bg-surface-container p-1 rounded-xl w-fit overflow-x-auto max-w-full">
        {(['overview', 'incident', 'attendance', 'staff'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-lg text-label-md capitalize transition-all whitespace-nowrap ${activeTab === tab ? 'bg-white text-primary font-bold shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}>
            {tab === 'incident' ? 'Incidents' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-stack-lg">
        <div className="bg-white rounded-xl shadow-sm border border-outline-variant/30 p-stack-md lg:col-span-2">
          <div className="flex items-center justify-between mb-4"><div><h3 className="font-headline-md text-headline-md text-on-surface">Weekly Attendance Rate</h3><p className="text-label-md text-on-surface-variant">This week - School-wide</p></div><span className="text-headline-md font-bold text-green-600">78.9%</span></div>
          <div className="flex items-end gap-3 h-40">
            {weekData.map((value, index) => (
              <div key={days[index]} className="flex-1 flex flex-col items-center gap-1"><span className="text-label-sm text-on-surface-variant">{value}%</span><div className="w-full rounded-t-lg bg-primary/80" style={{ height: `${value}%` }}></div><span className="text-label-sm text-on-surface-variant">{days[index]}</span></div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-outline-variant/30 p-stack-md">
          <h3 className="font-headline-md text-headline-md text-on-surface mb-1">Incident Breakdown</h3>
          <p className="text-label-md text-on-surface-variant mb-4">By type - May 2025</p>
          <div className="space-y-3">
            {incidentTypes.map(item => (
              <div key={item.label}><div className="flex justify-between text-label-md mb-1"><span>{item.label}</span><span className="text-on-surface-variant">{item.count} ({item.pct}%)</span></div><div className="w-full bg-surface-container rounded-full h-2"><div className={`${item.color} rounded-full h-2`} style={{ width: `${item.pct}%` }}></div></div></div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden">
        <div className="px-4 py-3 border-b border-outline-variant flex items-center justify-between">
          <h3 className="font-headline-md text-headline-md text-on-surface">Recent Reports</h3>
          <button onClick={() => showNotice('All recent reports are already displayed.')} className="text-primary text-label-md hover:underline">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="bg-surface-container-low">{['Report ID', 'Title', 'Type', 'Date', 'Status', 'Author', 'Actions'].map(h => <th key={h} className="text-left px-4 py-3 font-label-md text-label-md text-on-surface-variant">{h}</th>)}</tr></thead>
            <tbody>
              {recentReports.map((report, index) => (
                <tr key={report.id} className={`border-b border-outline-variant/20 hover:bg-surface-container/30 transition-colors ${index % 2 !== 0 ? 'bg-surface-container/10' : ''}`}>
                  <td className="px-4 py-3 text-label-md text-primary font-bold">{report.id}</td>
                  <td className="px-4 py-3 text-body-md font-medium">{report.title}</td>
                  <td className="px-4 py-3"><span className="px-2.5 py-1 rounded-full text-label-sm bg-primary/10 text-primary font-bold">{report.type}</span></td>
                  <td className="px-4 py-3 text-body-md text-on-surface-variant whitespace-nowrap">{report.date}</td>
                  <td className="px-4 py-3"><span className={`px-2.5 py-1 rounded-full text-label-sm font-bold ${report.status === 'Published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{report.status}</span></td>
                  <td className="px-4 py-3 text-body-md text-on-surface-variant">{report.author}</td>
                  <td className="px-4 py-3"><div className="flex gap-1"><button onClick={() => downloadReport(report)} className="text-primary hover:bg-primary-container p-1.5 rounded-lg" title="Download report"><span className="material-symbols-outlined text-[18px]">download</span></button><button onClick={() => setSelectedReport(report)} className="text-secondary hover:bg-secondary/10 p-1.5 rounded-lg" title="Open report"><span className="material-symbols-outlined text-[18px]">open_in_new</span></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedReport && (
        <div className="fixed inset-0 z-[90] bg-black/40 flex items-center justify-center px-4">
          <section className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-outline-variant p-stack-md">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div><p className="text-label-sm text-on-surface-variant">{selectedReport.id}</p><h3 className="font-headline-md text-primary">{selectedReport.title}</h3></div>
              <button onClick={() => setSelectedReport(null)} className="p-2 rounded-full hover:bg-surface-container"><span className="material-symbols-outlined">close</span></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-surface-container rounded-lg p-3"><p className="text-label-sm text-on-surface-variant">Type</p><p className="font-bold">{selectedReport.type}</p></div>
              <div className="bg-surface-container rounded-lg p-3"><p className="text-label-sm text-on-surface-variant">Status</p><p className="font-bold">{selectedReport.status}</p></div>
              <div className="bg-surface-container rounded-lg p-3"><p className="text-label-sm text-on-surface-variant">Date</p><p className="font-bold">{selectedReport.date}</p></div>
              <div className="bg-surface-container rounded-lg p-3"><p className="text-label-sm text-on-surface-variant">Author</p><p className="font-bold">{selectedReport.author}</p></div>
            </div>
            <button onClick={() => downloadReport(selectedReport)} className="mt-5 w-full bg-primary text-on-primary py-3 rounded-lg font-bold">Download Report</button>
          </section>
        </div>
      )}
    </div>
  );
}
