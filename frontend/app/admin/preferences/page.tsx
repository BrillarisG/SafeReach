'use client';

export default function AdminPreferencesPage() {
  return (
    <div className="p-container-padding-mobile md:p-container-padding-desktop space-y-stack-lg">
      <h1 className="font-headline-lg text-headline-lg text-primary">System Preferences</h1>
      <section className="bg-white rounded-xl border border-outline-variant/30 p-stack-md shadow-sm">
        {['Require OTP for admin login','Enable parent report notifications','Show critical incident banner','Auto-close resolved alerts'].map(item => (
          <label key={item} className="flex items-center justify-between py-3 border-b border-outline-variant/20 last:border-b-0">
            <span className="font-label-md text-on-surface">{item}</span>
            <input type="checkbox" defaultChecked className="w-5 h-5 rounded text-primary" />
          </label>
        ))}
      </section>
    </div>
  );
}
