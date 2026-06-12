'use client';

import ProfileImageUploader from '@/components/ProfileImageUploader';

export default function AdminProfilePage() {
  return (
    <div className="p-container-padding-mobile md:p-container-padding-desktop space-y-stack-lg">
      <section className="relative mt-14 bg-white rounded-xl border border-outline-variant/30 shadow-sm px-stack-md pb-stack-md pt-20 overflow-visible">
        <ProfileImageUploader storageKey="safereach_admin_profile_image" initials="RV" label="admin profile image" />
        <div className="mb-5 text-center">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-primary">Admin Profile</h1>
            <p className="text-body-md text-on-surface-variant">Profile settings separate from System Audit.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input className="bg-surface-container border border-outline-variant rounded-lg px-4 py-3" defaultValue="Dr. Robert Vance" />
          <input className="bg-surface-container border border-outline-variant rounded-lg px-4 py-3" defaultValue="admin@demo.safereach.edu" />
          <input className="bg-surface-container border border-outline-variant rounded-lg px-4 py-3" defaultValue="Super Administrator" />
          <input className="bg-surface-container border border-outline-variant rounded-lg px-4 py-3" defaultValue="HQ Office" />
        </div>
        <button type="button" className="mt-5 bg-primary text-on-primary px-5 py-3 rounded-lg font-bold">Save Profile</button>
      </section>
    </div>
  );
}
