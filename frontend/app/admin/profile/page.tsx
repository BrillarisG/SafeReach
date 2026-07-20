'use client';

import { useEffect, useState } from 'react';
import ProfileImageUploader from '@/components/ProfileImageUploader';
import ThemeModeToggle from '@/components/ThemeModeToggle';
import { useSchoolSettings } from '@/lib/schoolSettings';

export default function AdminProfilePage() {
  const [notice, setNotice] = useState('');
  const { settings, loading: schoolLoading, error: schoolError, save: saveSchoolSettings, openTime, closeTime } = useSchoolSettings();
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
    schoolOpenTime: '08:00',
    schoolCloseTime: '16:30',
    travelTracking: 'Enabled',
    smsAlerts: 'Enabled',
  });

  useEffect(() => {
    if (!settings.id) return;
    setSchool(current => ({
      ...current,
      name: settings.name || current.name,
      code: settings.code || current.code,
      phone: settings.phone || current.phone,
      email: settings.email || current.email,
      address: settings.address || current.address,
      schoolOpenTime: openTime,
      schoolCloseTime: closeTime,
    }));
  }, [settings, openTime, closeTime]);

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

      <ThemeModeToggle />

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
            void saveSchoolSettings({
              name: school.name,
              phone: school.phone,
              email: school.email,
              address: school.address,
              schoolOpenTime: school.schoolOpenTime,
              schoolCloseTime: school.schoolCloseTime,
            })
              .then(() => setNotice(`${school.name} school settings saved in backend.`))
              .catch(reason => setNotice(reason instanceof Error ? reason.message : 'School settings save failed.'));
          }}
          className="space-y-5"
        >
          {schoolLoading && <p className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-label-md font-bold text-primary">Loading school settings from backend...</p>}
          {schoolError && <p className="rounded-lg border border-error/30 bg-error-container/30 px-4 py-3 text-label-md font-bold text-error">{schoolError}</p>}
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
              <span className="text-label-md font-bold text-on-surface-variant">School Open Time</span>
              <input type="time" value={school.schoolOpenTime} onChange={event => updateSchool('schoolOpenTime', event.target.value)} className="w-full bg-white border border-outline-variant rounded-lg px-4 py-3" />
            </label>
            <label className="space-y-1.5">
              <span className="text-label-md font-bold text-on-surface-variant">School Close Time</span>
              <input type="time" value={school.schoolCloseTime} onChange={event => updateSchool('schoolCloseTime', event.target.value)} className="w-full bg-white border border-outline-variant rounded-lg px-4 py-3" />
            </label>
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

      </section>
    </div>
  );
}
