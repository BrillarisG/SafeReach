'use client';

export default function ParentProfilePage() {
  return (
    <div className="px-container-padding-mobile md:px-container-padding-desktop py-stack-lg space-y-stack-lg">
      <section className="bg-white rounded-xl border border-outline-variant/30 p-stack-md shadow-sm">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-2xl bg-primary-container flex items-center justify-center text-primary font-bold text-headline-md">ST</div>
          <div>
            <h3 className="font-headline-lg text-headline-lg text-primary">Parent Profile</h3>
            <p className="text-body-md text-on-surface-variant">Guardian profile details and emergency contact information.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input className="bg-surface-container border border-outline-variant rounded-lg px-4 py-3" defaultValue="Sarah Thompson" />
          <input className="bg-surface-container border border-outline-variant rounded-lg px-4 py-3" defaultValue="parent@demo.safereach.edu" />
          <input className="bg-surface-container border border-outline-variant rounded-lg px-4 py-3" defaultValue="+1 (555) 8100-221" />
          <input className="bg-surface-container border border-outline-variant rounded-lg px-4 py-3" defaultValue="Primary Guardian" />
        </div>
        <button type="button" className="mt-5 bg-primary text-on-primary px-5 py-3 rounded-lg font-bold">Save Profile</button>
      </section>
    </div>
  );
}
