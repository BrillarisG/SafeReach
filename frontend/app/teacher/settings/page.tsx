'use client';

import ThemeModeToggle from '@/components/ThemeModeToggle';

export default function TeacherSettingsPage() {
  return (
    <div className="p-container-padding-mobile md:p-container-padding-desktop space-y-stack-lg">
      <ThemeModeToggle />
      <section className="bg-white rounded-xl border border-outline-variant/30 p-stack-md shadow-sm">
        <h3 className="font-headline-md text-primary mb-4">Teacher Account Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input className="bg-surface-container border border-outline-variant rounded-lg px-4 py-3" defaultValue="Sarah Jenkins" />
          <input className="bg-surface-container border border-outline-variant rounded-lg px-4 py-3" defaultValue="teacher@demo.safereach.edu" />
          <input className="bg-surface-container border border-outline-variant rounded-lg px-4 py-3" defaultValue="Class 4-B Supervisor" />
          <select className="bg-surface-container border border-outline-variant rounded-lg px-4 py-3"><option>Available</option><option>On Leave</option><option>Training</option></select>
        </div>
      </section>
      <section className="bg-white rounded-xl border border-outline-variant/30 p-stack-md shadow-sm">
        <h3 className="font-headline-md text-primary mb-4">Class Alert Preferences</h3>
        {['Attendance exceptions', 'Parent messages', 'Incident review updates', 'Report deadlines'].map(item => (
          <label key={item} className="flex items-center justify-between py-3 border-b border-outline-variant/20 last:border-b-0">
            <span className="font-label-md text-on-surface">{item}</span>
            <input type="checkbox" defaultChecked className="w-5 h-5 rounded text-primary" />
          </label>
        ))}
      </section>
    </div>
  );
}
