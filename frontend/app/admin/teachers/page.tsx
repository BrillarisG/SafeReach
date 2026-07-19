'use client';

import Link from '@/src/next-link';
import { useMemo, useState } from 'react';
import { type BackendTeacher, useBackendBootstrap } from '@/lib/backendData';

function assignmentLabel(teacher: BackendTeacher) {
  const primary = teacher.assignments?.[0];
  if (!primary) return 'No stored assignment';
  return `${primary.className} - Section ${primary.sectionName}`;
}

function assignmentSubject(teacher: BackendTeacher) {
  const subjects = teacher.assignments?.map(item => item.subject).filter(Boolean) ?? [];
  return subjects.length ? Array.from(new Set(subjects)).join(', ') : teacher.subject || 'No stored subject';
}

function statusClass(status: string) {
  const value = status.toLowerCase();
  if (value.includes('leave')) return 'bg-error/10 text-error';
  if (value.includes('transit')) return 'bg-tertiary/10 text-tertiary';
  return 'bg-secondary/10 text-secondary';
}

function getTeacherChatHref(teacher: BackendTeacher) {
  const params = new URLSearchParams({
    chat: `teacher-${teacher.id}`,
    name: teacher.full_name,
    role: assignmentLabel(teacher),
  });
  return `/admin/messages?${params.toString()}`;
}

export default function AdminTeachersPage() {
  const { data, loading, error } = useBackendBootstrap();
  const [statusFilter, setStatusFilter] = useState('All Staff');
  const [staffSearch, setStaffSearch] = useState('');
  const [notice, setNotice] = useState('');

  const teachers = data.teachers;
  const classAssignments = useMemo(
    () => teachers.flatMap(teacher => (teacher.assignments ?? []).map(assignment => ({ teacher, assignment }))),
    [teachers],
  );
  const unassignedCount = teachers.filter(teacher => !teacher.assignments?.length).length;

  const filteredTeachers = useMemo(() => teachers.filter(teacher => {
    const normalizedStatus = teacher.status || 'active';
    const statusMatch = statusFilter === 'All Staff'
      || (statusFilter === 'On Leave' ? normalizedStatus.toLowerCase().includes('leave') : normalizedStatus === statusFilter);
    const searchMatch = `${teacher.full_name} ${teacher.employee_code} ${teacher.email} ${teacher.phone} ${assignmentLabel(teacher)} ${assignmentSubject(teacher)} ${normalizedStatus}`
      .toLowerCase()
      .includes(staffSearch.toLowerCase());
    return statusMatch && searchMatch;
  }), [staffSearch, statusFilter, teachers]);

  function handlePlannedWrite(action: string) {
    setNotice(`${action} is planned through the backend write API. This page is currently read-only and shows stored database records only.`);
  }

  if (loading) {
    return <div className="p-container-padding-mobile md:p-container-padding-desktop text-primary font-bold">Loading stored teacher data...</div>;
  }

  return (
    <div className="p-container-padding-mobile md:p-container-padding-desktop">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-stack-lg gap-stack-md">
        <div>
          <h1 className="text-headline-lg font-headline-lg text-primary">Staff Directory</h1>
          <p className="text-body-md text-on-surface-variant">Stored teacher assignments, availability, and school permissions from DB-1.</p>
        </div>
        <Link href="/admin/teachers/profile?mode=new" className="bg-primary text-on-primary h-[48px] px-stack-lg rounded-lg font-bold flex items-center gap-stack-sm hover:shadow-lg transition-shadow">
          <span className="material-symbols-outlined">person_add</span>
          Add New Teacher
        </Link>
      </div>

      {error && (
        <div className="mb-stack-md rounded-xl border border-error/20 bg-error/5 px-4 py-3 text-error font-bold">
          Backend data unavailable: {error}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-stack-lg">
        {[
          { label: 'Total Staff', value: String(teachers.length), sub: 'Stored records', border: 'border-primary', icon: 'groups', iconCls: 'text-primary-container bg-primary/10' },
          { label: 'Active Duty', value: String(teachers.filter(t => (t.status || 'active') === 'active').length), sub: 'Available', border: 'border-secondary', icon: 'check_circle', iconCls: 'text-secondary bg-secondary/10' },
          { label: 'On Leave', value: String(teachers.filter(t => (t.status || '').toLowerCase().includes('leave')).length), sub: 'Stored status', border: 'border-tertiary-fixed-dim', icon: 'event_busy', iconCls: 'text-tertiary bg-tertiary/10' },
          { label: 'Unassigned Classes', value: String(unassignedCount), sub: 'Action required', border: 'border-error', icon: 'warning', iconCls: 'text-error bg-error/10', alert: unassignedCount > 0 },
        ].map(card => (
          <div key={card.label} className={`bg-surface-container-lowest p-3 rounded-xl shadow-sm border-l-4 ${card.border}`}>
            <div className="flex justify-between items-start">
              <span className={`material-symbols-outlined p-2 ${card.iconCls} rounded-lg`}>{card.icon}</span>
              <span className={`text-label-sm font-bold ${card.alert ? 'text-error' : 'text-on-surface-variant'}`}>{card.sub}</span>
            </div>
            <div className="mt-stack-sm">
              <p className="text-label-md text-on-surface-variant">{card.label}</p>
              <h3 className={`text-headline-md font-bold ${card.alert ? 'text-error' : 'text-primary'}`}>{card.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <section className="hidden grid grid-cols-1 xl:grid-cols-2 gap-gutter mb-stack-lg">
        <div className="bg-white rounded-xl border border-outline-variant/50 shadow-sm p-stack-md">
          <h2 className="font-headline-md text-headline-md text-primary mb-2">Teacher Login Records</h2>
          <p className="text-label-md text-on-surface-variant mb-4">Visible teachers are loaded from DB-1. Local unsaved teacher rows are not displayed.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 opacity-75">
            <input disabled className="px-4 py-3 bg-surface-container border border-outline-variant rounded-lg" placeholder="Teacher name" />
            <input disabled className="px-4 py-3 bg-surface-container border border-outline-variant rounded-lg" placeholder="Teacher email" />
            <input disabled type="password" className="px-4 py-3 bg-surface-container border border-outline-variant rounded-lg" placeholder="Password" />
          </div>
          <button type="button" onClick={() => handlePlannedWrite('Save teacher')} className="mt-4 inline-flex items-center gap-2 px-5 py-3 bg-primary text-on-primary rounded-lg font-bold hover:opacity-90">
            <span className="material-symbols-outlined text-[20px]">person_add</span>
            Save Teacher
          </button>
          {notice && <p className="mt-4 rounded-lg bg-primary/5 border border-primary/15 px-4 py-3 text-primary font-bold text-label-md">{notice}</p>}
        </div>

        <div className="bg-white rounded-xl border border-outline-variant/50 shadow-sm p-stack-md">
          <h2 className="font-headline-md text-headline-md text-primary mb-2">Class / Section Incharge</h2>
          <p className="text-label-md text-on-surface-variant mb-4">Stored primary and assistant incharge assignments are displayed from teacher assignment records.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {classAssignments.map(({ teacher, assignment }) => (
              <div key={`${teacher.id}-${assignment.className}-${assignment.sectionName}-${assignment.assignmentType}`} className="rounded-xl border border-outline-variant p-4 bg-surface-container-low">
                <p className="font-bold text-primary">{assignment.className} - Section {assignment.sectionName}</p>
                <p className="text-label-md text-on-surface-variant">{assignment.assignmentType}: <span className="font-bold text-on-surface">{teacher.full_name}</span></p>
                <p className="mt-1 text-xs font-bold text-secondary">{assignment.subject}</p>
              </div>
            ))}
            {classAssignments.length === 0 && <p className="text-on-surface-variant">No stored class assignments are available.</p>}
          </div>
          <button type="button" onClick={() => handlePlannedWrite('Save assignment')} className="mt-4 inline-flex items-center gap-2 px-5 py-3 bg-secondary text-on-secondary rounded-lg font-bold hover:opacity-90">
            <span className="material-symbols-outlined text-[20px]">assignment_ind</span>
            Save Assignment
          </button>
        </div>
      </section>

      <div className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.12)] overflow-hidden">
        <div className="p-stack-md border-b border-surface-container flex flex-wrap gap-stack-md justify-between items-center">
          <div className="flex gap-stack-sm overflow-x-auto pb-2 sm:pb-0">
            {['All Staff', 'active', 'In Transit', 'On Leave'].map(filter => (
              <button
                key={filter}
                type="button"
                onClick={() => setStatusFilter(filter)}
                className={`px-4 py-1.5 rounded-full text-label-md font-bold ${statusFilter === filter ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-variant'}`}
              >
                {filter === 'active' ? 'Active Duty' : filter}
              </button>
            ))}
          </div>
          <label className="relative w-full sm:w-80">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
            <input value={staffSearch} onChange={event => setStaffSearch(event.target.value)} className="w-full pl-9 pr-3 py-2 bg-white border border-outline-variant rounded-lg text-label-md focus:ring-2 focus:ring-primary focus:outline-none" placeholder="Search stored staff..." />
          </label>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left border-collapse">
            <thead className="bg-surface-container-low">
              <tr>{['Staff Member', 'Primary Assignment', 'Subjects', 'Current Status', 'Actions'].map(header => <th key={header} className="p-stack-md font-label-md text-on-surface-variant">{header}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {filteredTeachers.map(teacher => (
                <tr key={teacher.id} className="hover:bg-surface-bright transition-colors group">
                  <td className="p-stack-md">
                    <div className="flex items-center gap-stack-md">
                      <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold">{teacher.full_name.split(' ').map(part => part[0]).join('').slice(0, 2)}</div>
                      <div>
                        <p className="font-bold text-on-surface">{teacher.full_name}</p>
                        <p className="text-label-sm text-on-surface-variant">ID: {teacher.employee_code}</p>
                        <p className="text-label-sm text-on-surface-variant">{teacher.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-stack-md"><span className="px-2 py-1 bg-primary/5 text-primary border border-primary/20 rounded text-label-sm font-bold">{assignmentLabel(teacher)}</span></td>
                  <td className="p-stack-md text-body-sm text-on-surface-variant">{assignmentSubject(teacher)}</td>
                  <td className="p-stack-md"><span className={`px-3 py-1 ${statusClass(teacher.status || 'active')} rounded-full text-label-sm font-bold flex items-center w-fit gap-1`}>{teacher.status || 'active'}</span></td>
                  <td className="p-stack-md text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/teachers/profile?id=${teacher.id}&mode=edit`} className="text-primary hover:bg-primary-container p-1.5 rounded-lg transition-colors inline-flex" title="Edit teacher">
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </Link>
                      <Link href={getTeacherChatHref(teacher)} className="text-primary hover:bg-primary-container p-1.5 rounded-lg transition-colors inline-flex" title={`Message ${teacher.full_name}`}>
                        <span className="material-symbols-outlined text-[18px]">chat</span>
                      </Link>
                      <Link href={`/admin/teachers/profile?id=${teacher.id}`} className="text-primary hover:bg-primary-container p-1.5 rounded-lg transition-colors inline-flex" title="Open profile">
                        <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredTeachers.length === 0 && (
                <tr><td colSpan={5} className="p-stack-lg text-center text-on-surface-variant">No stored teachers match the selected filter or search.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-stack-md bg-surface-container-low flex justify-between items-center border-t border-surface-container">
          <span className="text-label-md text-on-surface-variant">Showing {filteredTeachers.length} of {teachers.length} stored teachers</span>
          <span className="text-label-sm font-bold text-primary">DB-1 source</span>
        </div>
      </div>
    </div>
  );
}

