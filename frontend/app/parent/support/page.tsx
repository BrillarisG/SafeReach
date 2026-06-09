'use client';

export default function ParentSupportPage() {
  return (
    <div className="px-container-padding-mobile md:px-container-padding-desktop py-stack-lg space-y-stack-lg">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          ['School Office', 'office@safereach.edu', 'call'],
          ['Transport Desk', 'transport@safereach.edu', 'directions_bus'],
          ['Emergency Line', '+1 (555) 000-0911', 'emergency'],
        ].map(([title, detail, icon]) => (
          <div key={title} className="bg-white rounded-xl border border-outline-variant/30 p-stack-md shadow-sm">
            <span className="material-symbols-outlined text-primary text-[30px]">{icon}</span>
            <h3 className="font-headline-md text-primary mt-2">{title}</h3>
            <p className="text-body-md text-on-surface-variant">{detail}</p>
          </div>
        ))}
      </div>
      <form className="bg-white rounded-xl border border-outline-variant/30 p-stack-md shadow-sm space-y-4">
        <h3 className="font-headline-md text-primary">Send Support Request</h3>
        <select className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-3"><option>Attendance question</option><option>Report access</option><option>Child safety update</option><option>Other</option></select>
        <textarea rows={5} className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-3 resize-none" placeholder="Write your request..." />
        <button type="button" className="bg-primary text-on-primary px-5 py-3 rounded-lg font-bold">Submit Request</button>
      </form>
    </div>
  );
}
