'use client';

import { useState } from 'react';
import Link from 'next/link';

const safetyClasses = [
  {
    className: 'Class 1',
    overall: { score: 96, alerts: 0, attendance: '98%' },
    sections: [
      { name: 'A', score: 97, alerts: 0, attendance: '99%', report: 'All students checked in. Fire-drill briefing completed.' },
      { name: 'B', score: 95, alerts: 0, attendance: '97%', report: 'Pickup authorization list verified for all students.' },
    ],
  },
  {
    className: 'Class 4',
    overall: { score: 91, alerts: 2, attendance: '93%' },
    sections: [
      { name: 'A', score: 94, alerts: 0, attendance: '95%', report: 'Morning attendance closed with no exceptions.' },
      { name: 'B', score: 88, alerts: 1, attendance: '91%', report: 'One late arrival was approved by parent note.' },
      { name: 'C', score: 90, alerts: 1, attendance: '92%', report: 'One absence needs final guardian confirmation.' },
    ],
  },
  {
    className: 'Class 6',
    overall: { score: 89, alerts: 1, attendance: '92%' },
    sections: [
      { name: 'A', score: 91, alerts: 0, attendance: '94%', report: 'Safety protocol checklist completed.' },
      { name: 'B', score: 87, alerts: 1, attendance: '90%', report: 'Medical-room visit logged and parent notified.' },
    ],
  },
];

export default function AdminDashboardPage() {
  const [selectedClass, setSelectedClass] = useState(safetyClasses[0].className);
  const [selectedSection, setSelectedSection] = useState(safetyClasses[0].sections[0].name);
  const selectedClassData = safetyClasses.find(item => item.className === selectedClass) ?? safetyClasses[0];
  const selectedSectionData = selectedClassData.sections.find(item => item.name === selectedSection) ?? selectedClassData.sections[0];

  return (
    <div className="p-container-padding-mobile md:p-container-padding-desktop">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-stack-lg gap-4">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-primary">System Overview</h1>
          <p className="text-body-md text-on-surface-variant">Safety metrics and school operations for academic session 2024-25</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <select className="bg-white border border-outline-variant rounded-lg px-4 py-2 text-label-md focus:ring-2 focus:ring-primary focus:outline-none">
            <option>All Classes</option><option>Class 1</option><option>Class 4</option><option>Class 6</option>
          </select>
          <select className="bg-white border border-outline-variant rounded-lg px-4 py-2 text-label-md focus:ring-2 focus:ring-primary focus:outline-none">
            <option>All Teachers</option><option>Mr. Anderson</option><option>Ms. Smith</option>
          </select>
          <input className="bg-white border border-outline-variant rounded-lg px-4 py-2 text-label-md focus:ring-2 focus:ring-primary focus:outline-none" type="date" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter mb-stack-lg">
        {[
          { label: 'Total Students', value: '2,480', icon: 'groups', c: 'text-primary', bg: 'bg-primary-fixed' },
          { label: 'Present Today', value: '2,301', icon: 'task_alt', c: 'text-green-700', bg: 'bg-green-100' },
          { label: 'Pending Reviews', value: '18', icon: 'pending_actions', c: 'text-secondary', bg: 'bg-secondary-container' },
          { label: 'Active Alerts', value: '03', icon: 'emergency_home', c: 'text-error', bg: 'bg-error-container border-l-4 border-error' },
        ].map(card => (
          <div key={card.label} className={`bg-white p-stack-md rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.12)] flex items-center gap-4 ${card.bg.includes('border') ? card.bg : ''}`}>
            <div className={`w-12 h-12 rounded-full ${card.bg.includes('border') ? 'bg-error-container' : card.bg} flex items-center justify-center`}>
              <span className={`material-symbols-outlined ${card.c}`}>{card.icon}</span>
            </div>
            <div><p className="text-label-md text-on-surface-variant">{card.label}</p><p className={`text-headline-md font-bold ${card.c}`}>{card.value}</p></div>
          </div>
        ))}
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.12)] overflow-hidden">
          <div className="p-stack-md border-b border-surface-container">
            <h3 className="font-headline-md text-on-surface">Safety Report Overview</h3>
            <p className="text-label-md text-on-surface-variant">Overall report appears first. Select a class and section for detailed records.</p>
          </div>
          <div className="p-stack-md grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              ['Overall Safety Score', '93%', 'verified_user', 'text-primary', 'bg-primary/5'],
              ['School Attendance', '94%', 'how_to_reg', 'text-green-700', 'bg-green-50'],
              ['Open Actions', '06', 'assignment_late', 'text-error', 'bg-red-50'],
            ].map(([label, value, icon, color, bg]) => (
              <div key={label} className={`${bg} rounded-xl p-4 border border-outline-variant/30`}>
                <div className="flex items-center justify-between mb-2"><p className="text-label-md text-on-surface-variant">{label}</p><span className={`material-symbols-outlined ${color}`}>{icon}</span></div>
                <p className={`font-headline-lg text-headline-lg ${color}`}>{value}</p>
              </div>
            ))}
          </div>
          <div className="px-stack-md pb-stack-md">
            <h4 className="font-headline-md text-primary mb-3">Classes</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
              {safetyClasses.map(item => (
                <button
                  key={item.className}
                  onClick={() => {
                    setSelectedClass(item.className);
                    setSelectedSection(item.sections[0].name);
                  }}
                  className={`text-left rounded-xl border p-4 transition-all ${selectedClass === item.className ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'border-outline-variant hover:bg-surface-container'}`}
                >
                  <p className="font-bold text-primary">{item.className}</p>
                  <p className="text-label-sm text-on-surface-variant">{item.sections.length} sections</p>
                  <div className="flex justify-between mt-3 text-label-md"><span>Score</span><span className="font-bold">{item.overall.score}%</span></div>
                  <div className="flex justify-between text-label-md"><span>Alerts</span><span className={item.overall.alerts > 0 ? 'font-bold text-error' : 'font-bold text-green-700'}>{item.overall.alerts}</span></div>
                </button>
              ))}
            </div>
            <h4 className="font-headline-md text-primary mb-3">{selectedClassData.className} Sections</h4>
            <div className="flex flex-wrap gap-3 mb-5">
              {selectedClassData.sections.map(section => (
                <button key={section.name} onClick={() => setSelectedSection(section.name)} className={`px-4 py-3 rounded-lg border font-label-md ${selectedSection === section.name ? 'bg-primary text-on-primary border-primary' : 'bg-surface-container-low border-outline-variant text-primary hover:bg-primary-container hover:text-on-primary-container'}`}>
                  Section {section.name}
                </button>
              ))}
            </div>
            <div className="rounded-xl border border-outline-variant bg-surface-container-low p-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                <div>
                  <p className="font-bold text-primary">{selectedClassData.className} - Section {selectedSectionData.name}</p>
                  <p className="text-label-md text-on-surface-variant">{selectedSectionData.report}</p>
                </div>
                <span className={`status-chip ${selectedSectionData.alerts > 0 ? 'bg-error-container text-error' : 'bg-green-100 text-green-700'}`}>{selectedSectionData.alerts} alerts</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="bg-white rounded-lg p-3"><p className="text-label-sm text-on-surface-variant">Score</p><p className="font-bold text-primary">{selectedSectionData.score}%</p></div>
                <div className="bg-white rounded-lg p-3"><p className="text-label-sm text-on-surface-variant">Attendance</p><p className="font-bold text-green-700">{selectedSectionData.attendance}</p></div>
                <div className="bg-white rounded-lg p-3"><p className="text-label-sm text-on-surface-variant">Review Status</p><p className="font-bold text-secondary">Updated</p></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.12)] p-stack-md flex flex-col">
          <h3 className="font-headline-md text-on-surface mb-stack-lg">Attendance Status</h3>
          <div className="flex-1 flex flex-col justify-center gap-6">
            {[
              ['At School', '76%', 'bg-primary', 'text-primary'],
              ['In Class', '16%', 'bg-secondary', 'text-secondary'],
              ['On Leave', '6%', 'bg-tertiary', 'text-tertiary-fixed-dim'],
              ['Absent/Alert', '2%', 'bg-error', 'text-error'],
            ].map(([label, pct, bg, color]) => (
              <div key={label} className="space-y-2">
                <div className="flex justify-between text-label-md"><span className="text-on-surface-variant">{label}</span><span className={`font-bold ${color}`}>{pct}</span></div>
                <div className="w-full h-3 bg-surface-container rounded-full overflow-hidden"><div className={`${bg} h-full rounded-full`} style={{ width: pct }}></div></div>
              </div>
            ))}
          </div>
          <Link href="/admin/reports" className="mt-stack-lg w-full py-3 bg-surface-container-high text-primary font-bold rounded-lg hover:bg-surface-container-highest transition-colors text-center">View Detailed Report</Link>
        </div>
      </section>
    </div>
  );
}
