'use client';

import ThemeModeToggle from '@/components/ThemeModeToggle';

export default function ParentSettingsPage() {
  return (
    <div className="px-container-padding-mobile md:px-container-padding-desktop py-stack-lg space-y-stack-lg">
      <ThemeModeToggle />
      <section className="bg-white rounded-xl border border-outline-variant/30 p-stack-md shadow-sm">
        <h3 className="font-headline-md text-primary mb-4">Parent Account Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input className="bg-surface-container border border-outline-variant rounded-lg px-4 py-3" defaultValue="Sarah Thompson" />
          <input className="bg-surface-container border border-outline-variant rounded-lg px-4 py-3" defaultValue="parent@demo.safereach.edu" />
          <input className="bg-surface-container border border-outline-variant rounded-lg px-4 py-3" defaultValue="+1 (555) 8100-221" />
          <select className="bg-surface-container border border-outline-variant rounded-lg px-4 py-3"><option>English</option><option>Spanish</option><option>Tamil</option></select>
        </div>
      </section>
      <section className="bg-white rounded-xl border border-outline-variant/30 p-stack-md shadow-sm">
        <h3 className="font-headline-md text-primary mb-4">Notification Preferences</h3>
        {['Attendance alerts', 'Report availability', 'Emergency notices', 'Teacher messages'].map(item => (
          <label key={item} className="flex items-center justify-between py-3 border-b border-outline-variant/20 last:border-b-0">
            <span className="font-label-md text-on-surface">{item}</span>
            <input type="checkbox" defaultChecked className="w-5 h-5 rounded text-primary" />
          </label>
        ))}
      </section>
    </div>
  );
}
