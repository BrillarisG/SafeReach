'use client';

export default function AdminAuditPage() {
  return (
    <div className="p-container-padding-mobile md:p-container-padding-desktop space-y-stack-lg">
      <h1 className="font-headline-lg text-headline-lg text-primary">Full Audit</h1>
      <section className="bg-white rounded-xl border border-outline-variant/30 shadow-sm divide-y divide-outline-variant/20">
        {[
          ['12 mins ago','Admin profile updated','Dr. Robert Vance'],
          ['45 mins ago','Staff bulk upload processed','System Task'],
          ['2 hours ago','Unauthorized access blocked','Firewall'],
          ['4 hours ago','Emergency broadcast tested','Admin Dashboard'],
        ].map(([time,event,actor]) => (
          <div key={event} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div><p className="font-bold text-on-surface">{event}</p><p className="text-label-md text-on-surface-variant">{actor}</p></div>
            <span className="text-label-md text-primary">{time}</span>
          </div>
        ))}
      </section>
    </div>
  );
}
