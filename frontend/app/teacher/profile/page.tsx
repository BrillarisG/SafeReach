'use client';

import ProfileImageUploader from '@/components/ProfileImageUploader';
import ThemeModeToggle from '@/components/ThemeModeToggle';

export default function TeacherProfilePage() {
  return (
    <div className="p-container-padding-mobile md:p-container-padding-desktop space-y-stack-lg">
      <section className="relative mt-14 bg-white rounded-xl border border-outline-variant/30 px-stack-md pb-stack-md pt-20 shadow-sm overflow-visible">
        <ProfileImageUploader storageKey="safereach_teacher_profile_image" initials="SJ" label="teacher profile image" />
        <div className="mb-5 text-center">
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
      <ThemeModeToggle />
    </div>
  );
}
