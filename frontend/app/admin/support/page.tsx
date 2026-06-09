'use client';

export default function AdminSupportPage() {
  return (
    <div className="p-container-padding-mobile md:p-container-padding-desktop space-y-stack-lg">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-primary">Admin Support</h1>
        <p className="text-body-md text-on-surface-variant">Frontend support desk for system, access, and safety operations requests.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        {[
          ['Access Issue', 'Manage roles, locked accounts, and permission questions.', 'manage_accounts'],
          ['Safety Workflow', 'Request help with incident review or safety reports.', 'health_and_safety'],
          ['Technical Support', 'Report dashboard, upload, or frontend display issues.', 'support_agent'],
        ].map(([title, text, icon]) => (
          <div key={title} className="bg-white rounded-xl border border-outline-variant/40 p-stack-md shadow-sm">
            <span className="material-symbols-outlined text-primary text-[32px] mb-3">{icon}</span>
            <h2 className="font-headline-md text-primary mb-2">{title}</h2>
            <p className="text-body-md text-on-surface-variant">{text}</p>
          </div>
        ))}
      </div>
      <form className="bg-white rounded-xl border border-outline-variant/40 p-stack-md shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input className="bg-surface-container border border-outline-variant rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary" placeholder="Subject" />
          <select className="bg-surface-container border border-outline-variant rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary"><option>Normal</option><option>High</option><option>Emergency</option></select>
        </div>
        <textarea rows={5} className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary resize-none" placeholder="Describe the support request..." />
        <button type="button" className="bg-primary text-on-primary px-5 py-3 rounded-lg font-bold">Create Support Request</button>
      </form>
    </div>
  );
}
