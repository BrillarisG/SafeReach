'use client';

export default function TeacherSupportPage() {
  return (
    <div className="p-container-padding-mobile md:p-container-padding-desktop space-y-stack-lg">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          ['Admin Office', 'admin@safereach.edu', 'admin_panel_settings'],
          ['IT Support', 'support@safereach.edu', 'support_agent'],
          ['Student Safety Team', 'safety@safereach.edu', 'health_and_safety'],
        ].map(([title, detail, icon]) => (
          <div key={title} className="bg-white rounded-xl border border-outline-variant/30 p-stack-md shadow-sm">
            <span className="material-symbols-outlined text-primary text-[30px]">{icon}</span>
            <h3 className="font-headline-md text-primary mt-2">{title}</h3>
            <p className="text-body-md text-on-surface-variant">{detail}</p>
          </div>
        ))}
      </div>
      <form className="bg-white rounded-xl border border-outline-variant/30 p-stack-md shadow-sm space-y-4">
        <h3 className="font-headline-md text-primary">Create Teacher Support Ticket</h3>
        <select className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-3"><option>Attendance issue</option><option>Student record issue</option><option>Report issue</option><option>Other</option></select>
        <textarea rows={5} className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-3 resize-none" placeholder="Write your support request..." />
        <button type="button" className="bg-primary text-on-primary px-5 py-3 rounded-lg font-bold">Submit Ticket</button>
      </form>
    </div>
  );
}
