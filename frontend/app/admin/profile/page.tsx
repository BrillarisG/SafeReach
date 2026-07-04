'use client';

import { useState } from 'react';
import ProfileImageUploader from '@/components/ProfileImageUploader';
import { createPremiumPaymentRequest, premiumPlans, readIndustryMenuAccess } from '@/lib/industryAccess';

export default function AdminProfilePage() {
  const [notice, setNotice] = useState('');
  const [admin, setAdmin] = useState({
    name: 'Dr. Robert Vance',
    email: 'admin@demo.safereach.edu',
    role: 'Super Administrator',
    office: 'HQ Office',
  });
  const [school, setSchool] = useState({
    name: 'SafeReach International School',
    code: 'SR-SCH-001',
    board: 'CBSE',
    principal: 'Dr. Meera Rao',
    phone: '+91 98765 43000',
    email: 'office@safereach.school',
    address: '42 Sunrise Colony, Mumbai - 400001',
    academicYear: '2026-2027',
    attendanceCutoff: '09:15 AM',
    travelTracking: 'Enabled',
    smsAlerts: 'Enabled',
  });
  const activeIndustry = {
    schoolId: 'SCH-001',
    schoolName: school.name,
    adminName: admin.name,
  };
  const [premiumNotice, setPremiumNotice] = useState('Choose a plan and send a PayPal activation request to Main Admin.');
  const activeAccess = readIndustryMenuAccess([{ id: activeIndustry.schoolId, name: activeIndustry.schoolName }])[0];

  function updateAdmin(field: keyof typeof admin, value: string) {
    setAdmin(current => ({ ...current, [field]: value }));
  }

  function updateSchool(field: keyof typeof school, value: string) {
    setSchool(current => ({ ...current, [field]: value }));
  }

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
        <form
          onSubmit={event => {
            event.preventDefault();
            setNotice('Admin profile saved in this frontend demo.');
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="space-y-1.5">
              <span className="text-label-md font-bold text-on-surface-variant">Admin Name</span>
              <input value={admin.name} onChange={event => updateAdmin('name', event.target.value)} className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-3" />
            </label>
            <label className="space-y-1.5">
              <span className="text-label-md font-bold text-on-surface-variant">Email</span>
              <input value={admin.email} onChange={event => updateAdmin('email', event.target.value)} type="email" className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-3" />
            </label>
            <label className="space-y-1.5">
              <span className="text-label-md font-bold text-on-surface-variant">Role</span>
              <input value={admin.role} onChange={event => updateAdmin('role', event.target.value)} className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-3" />
            </label>
            <label className="space-y-1.5">
              <span className="text-label-md font-bold text-on-surface-variant">Office</span>
              <input value={admin.office} onChange={event => updateAdmin('office', event.target.value)} className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-3" />
            </label>
          </div>
          <button type="submit" className="bg-primary text-on-primary px-5 py-3 rounded-lg font-bold">Save Profile</button>
        </form>
      </section>

      <section className="bg-white rounded-xl border border-outline-variant/30 shadow-sm p-stack-md">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-5">
          <div>
            <h2 className="font-headline-md text-headline-md text-primary">School Settings</h2>
            <p className="text-body-md text-on-surface-variant">Edit school identity, contact details, and operating settings for the school admin portal.</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-label-md font-bold text-primary w-fit">
            <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
            School admin editable
          </span>
        </div>

        <form
          onSubmit={event => {
            event.preventDefault();
            setNotice(`${school.name} school settings saved in this frontend demo.`);
          }}
          className="space-y-5"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <label className="space-y-1.5">
              <span className="text-label-md font-bold text-on-surface-variant">School Name</span>
              <input value={school.name} onChange={event => updateSchool('name', event.target.value)} className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-3" />
            </label>
            <label className="space-y-1.5">
              <span className="text-label-md font-bold text-on-surface-variant">School Code</span>
              <input value={school.code} onChange={event => updateSchool('code', event.target.value)} className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-3" />
            </label>
            <label className="space-y-1.5">
              <span className="text-label-md font-bold text-on-surface-variant">Board / Curriculum</span>
              <input value={school.board} onChange={event => updateSchool('board', event.target.value)} className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-3" />
            </label>
            <label className="space-y-1.5">
              <span className="text-label-md font-bold text-on-surface-variant">Principal / Head</span>
              <input value={school.principal} onChange={event => updateSchool('principal', event.target.value)} className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-3" />
            </label>
            <label className="space-y-1.5">
              <span className="text-label-md font-bold text-on-surface-variant">School Phone</span>
              <input value={school.phone} onChange={event => updateSchool('phone', event.target.value)} className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-3" />
            </label>
            <label className="space-y-1.5">
              <span className="text-label-md font-bold text-on-surface-variant">School Email</span>
              <input value={school.email} onChange={event => updateSchool('email', event.target.value)} type="email" className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-3" />
            </label>
            <label className="space-y-1.5 md:col-span-2">
              <span className="text-label-md font-bold text-on-surface-variant">School Address</span>
              <input value={school.address} onChange={event => updateSchool('address', event.target.value)} className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-3" />
            </label>
            <label className="space-y-1.5">
              <span className="text-label-md font-bold text-on-surface-variant">Academic Year</span>
              <input value={school.academicYear} onChange={event => updateSchool('academicYear', event.target.value)} className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-3" />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-xl bg-surface-container-low p-4 border border-outline-variant/40">
            <label className="space-y-1.5">
              <span className="text-label-md font-bold text-on-surface-variant">Attendance Cutoff</span>
              <input value={school.attendanceCutoff} onChange={event => updateSchool('attendanceCutoff', event.target.value)} className="w-full bg-white border border-outline-variant rounded-lg px-4 py-3" />
            </label>
            <label className="space-y-1.5">
              <span className="text-label-md font-bold text-on-surface-variant">Travel Tracking</span>
              <select value={school.travelTracking} onChange={event => updateSchool('travelTracking', event.target.value)} className="w-full bg-white border border-outline-variant rounded-lg px-4 py-3">
                <option>Enabled</option>
                <option>Paused</option>
              </select>
            </label>
            <label className="space-y-1.5">
              <span className="text-label-md font-bold text-on-surface-variant">SMS Alerts</span>
              <select value={school.smsAlerts} onChange={event => updateSchool('smsAlerts', event.target.value)} className="w-full bg-white border border-outline-variant rounded-lg px-4 py-3">
                <option>Enabled</option>
                <option>Paused</option>
              </select>
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" className="bg-secondary text-on-secondary px-5 py-3 rounded-lg font-bold inline-flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">save</span>
              Save School Settings
            </button>
            {notice && <p className="rounded-lg bg-primary/5 border border-primary/15 px-4 py-3 text-primary font-bold text-label-md">{notice}</p>}
          </div>
        </form>

        <div className="mt-stack-lg rounded-xl border border-outline-variant/40 bg-surface-container-low p-stack-md">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
            <div>
              <h3 className="font-headline-md text-headline-md text-primary">Premium Menu Payment Request</h3>
              <p className="text-body-md text-on-surface-variant">Request premium menu access for this school industry. PayPal is display-only in this frontend demo; no live payment is collected here.</p>
            </div>
            <span className="status-chip bg-yellow-100 text-yellow-700">PayPal request mode</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            {premiumPlans.map(plan => (
              <article key={plan.id} className="rounded-xl border border-outline-variant bg-white p-4 flex flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-primary">{plan.name}</h4>
                    <p className="text-label-md text-on-surface-variant">{plan.billing}</p>
                  </div>
                  <p className="font-headline-md text-headline-md text-primary">{plan.price}</p>
                </div>
                <p className="text-body-md text-on-surface-variant mt-3 flex-1">{plan.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {plan.menus.map(menu => <span key={menu} className="status-chip bg-primary/10 text-primary capitalize">{menu}</span>)}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const request = createPremiumPaymentRequest({ ...activeIndustry, plan });
                    setPremiumNotice(`Request ${request.id} sent to Main Admin for ${plan.name} ${plan.billing}. Main Admin can approve or auto-enable based on industry settings.`);
                  }}
                  className="mt-5 w-full rounded-lg bg-primary text-on-primary py-3 font-bold hover:opacity-90 transition-opacity"
                >
                  Request via PayPal
                </button>
              </article>
            ))}
          </div>

          <div className="mt-5 rounded-xl border border-outline-variant bg-white p-4">
            <p className="font-bold text-primary">Current industry menu status</p>
            <p className="text-label-md text-on-surface-variant mt-1">{premiumNotice}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {Object.entries(activeAccess.menus).map(([key, enabled]) => (
                <span key={key} className={`status-chip capitalize ${enabled ? 'bg-green-100 text-green-700' : 'bg-surface-container-high text-on-surface-variant'}`}>
                  {key}: {enabled ? 'enabled' : 'disabled'}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
