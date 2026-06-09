'use client';

export default function TeacherProfilePage() {
  return (
    <div className="p-container-padding-mobile md:p-container-padding-desktop space-y-stack-lg">
      <section className="bg-white rounded-xl border border-outline-variant/30 p-stack-md shadow-sm">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-2xl bg-primary-container flex items-center justify-center text-primary font-bold text-headline-md">SJ</div>
          <div>
            <h1 className="font-headline-lg text-headline-lg text-primary">Teacher Profile</h1>
            <p className="text-body-md text-on-surface-variant">Teacher profile details separate from settings.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input className="bg-surface-container border border-outline-variant rounded-lg px-4 py-3" defaultValue="Sarah Jenkins" />
          <input className="bg-surface-container border border-outline-variant rounded-lg px-4 py-3" defaultValue="teacher@demo.safereach.edu" />
          <input className="bg-surface-container border border-outline-variant rounded-lg px-4 py-3" defaultValue="Class 4-B Supervisor" />
          <input className="bg-surface-container border border-outline-variant rounded-lg px-4 py-3" defaultValue="Mathematics Department" />
        </div>
        <button type="button" className="mt-5 bg-primary text-on-primary px-5 py-3 rounded-lg font-bold">Save Profile</button>
      </section>
    </div>
  );
}
