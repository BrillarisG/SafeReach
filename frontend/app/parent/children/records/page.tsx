'use client';

import Link from 'next/link';

const records = [
  { child: 'Aarav Mehta', standard: 'Grade 8 - Section A', roll: 'STU-0042', attendance: '94%', lastReport: 'Term 2 Progress Report', safety: 'No open alerts' },
  { child: 'Diya Mehta', standard: 'Grade 5 - Section C', roll: 'STU-0091', attendance: '97%', lastReport: 'Term 2 Progress Report', safety: 'No open alerts' },
];

export default function ParentChildRecordsPage() {
  return (
    <div className="px-container-padding-mobile md:px-container-padding-desktop py-stack-lg space-y-stack-lg">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="font-headline-lg text-headline-lg text-primary">Child Records</h3>
          <p className="text-body-md text-on-surface-variant">Quick access records opened from My Children.</p>
        </div>
        <Link href="/parent/students" className="px-4 py-2 border border-outline-variant rounded-lg text-primary font-bold hover:bg-surface-container">Back</Link>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
        {records.map(record => (
          <section key={record.roll} className="bg-white rounded-xl border border-outline-variant/30 shadow-sm p-stack-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary-container flex items-center justify-center text-primary font-bold">{record.child.split(' ').map(part => part[0]).join('')}</div>
              <div><h4 className="font-headline-md text-primary">{record.child}</h4><p className="text-label-md text-on-surface-variant">{record.standard}</p></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-surface-container/50 rounded-lg p-3"><p className="text-label-sm text-on-surface-variant">Roll ID</p><p className="font-bold">{record.roll}</p></div>
              <div className="bg-surface-container/50 rounded-lg p-3"><p className="text-label-sm text-on-surface-variant">Attendance</p><p className="font-bold text-green-700">{record.attendance}</p></div>
              <div className="bg-surface-container/50 rounded-lg p-3"><p className="text-label-sm text-on-surface-variant">Last Report</p><p className="font-bold">{record.lastReport}</p></div>
              <div className="bg-surface-container/50 rounded-lg p-3"><p className="text-label-sm text-on-surface-variant">Safety</p><p className="font-bold text-primary">{record.safety}</p></div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
