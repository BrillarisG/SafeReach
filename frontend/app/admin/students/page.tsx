'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { downloadTextFile } from '@/lib/downloadFile';

const classSections = [
  { className: 'Class 1', sections: ['A', 'B'], total: 82, attendance: '96%' },
  { className: 'Class 2', sections: ['A', 'B', 'C'], total: 118, attendance: '94%' },
  { className: 'Class 3', sections: ['A', 'B'], total: 91, attendance: '95%' },
  { className: 'Class 4', sections: ['A', 'B', 'C'], total: 126, attendance: '92%' },
  { className: 'Class 5', sections: ['A', 'B', 'C'], total: 88, attendance: '97%' },
  { className: 'Class 6', sections: ['A', 'B'], total: 96, attendance: '93%' },
  { className: 'Class 7', sections: ['A', 'B', 'C'], total: 0, attendance: 'Setup' },
  { className: 'Class 8', sections: ['A', 'B', 'C'], total: 0, attendance: 'Setup' },
  { className: 'Class 9', sections: ['A', 'B', 'C'], total: 0, attendance: 'Setup' },
  { className: 'Class 10', sections: ['A', 'B', 'C'], total: 0, attendance: 'Setup' },
  { className: 'Class 11', sections: ['A', 'B', 'C'], total: 0, attendance: 'Setup' },
  { className: 'Class 12', sections: ['A', 'B', 'C'], total: 0, attendance: 'Setup' },
];

const students = [
  { name: 'Sarah Jenkins', id: 'ST-2025-001', className: 'Class 5', section: 'B', roll: '05', status: 'At School', guardian: 'Robert Jenkins', phone: '+1 (555) 0123-456', last: 'Arrived at 07:45 AM' },
  { name: 'Marcus Thorne', id: 'ST-2025-042', className: 'Class 3', section: 'A', roll: '14', status: 'In Class', guardian: 'Elena Thorne', phone: '+1 (555) 0987-654', last: 'Class check-in 09:00 AM' },
  { name: 'Leo Martinez', id: 'ST-2025-118', className: 'Class 4', section: 'C', roll: '22', status: 'Absent', guardian: 'Maria Martinez', phone: '+1 (555) 1122-334', last: 'No check-in recorded today' },
  { name: 'Chloe Zhao', id: 'ST-2025-089', className: 'Class 2', section: 'A', roll: '08', status: 'At School', guardian: 'David Zhao', phone: '+1 (555) 4455-667', last: 'Library entry 10:15 AM' },
  { name: 'Aarav Mehta', id: 'ST-2025-204', className: 'Class 4', section: 'B', roll: '11', status: 'At School', guardian: 'Neha Mehta', phone: '+1 (555) 7100-218', last: 'Science Lab 10:00 AM' },
  { name: 'Diya Mehta', id: 'ST-2025-251', className: 'Class 5', section: 'C', roll: '18', status: 'In Class', guardian: 'Neha Mehta', phone: '+1 (555) 7100-218', last: 'English class 09:00 AM' },
  { name: 'Priya Nair', id: 'ST-2025-311', className: 'Class 6', section: 'A', roll: '04', status: 'At School', guardian: 'Vikram Nair', phone: '+1 (555) 2001-918', last: 'Morning attendance submitted' },
];

const statusStyle: Record<string, string> = {
  'At School': 'bg-green-100 text-green-700',
  'In Class': 'bg-blue-100 text-blue-700',
  Absent: 'bg-red-100 text-red-700',
};

export default function AdminStudentsPage() {
  const [selectedClass, setSelectedClass] = useState(classSections[0].className);
  const [selectedSection, setSelectedSection] = useState(classSections[0].sections[0]);
  const [studentRows, setStudentRows] = useState(students);
  const [search, setSearch] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState(students[0].id);
  const [targetSection, setTargetSection] = useState('A');
  const [confirmMove, setConfirmMove] = useState(false);

  const selectedClassMeta = classSections.find(item => item.className === selectedClass) ?? classSections[0];
  const selectedStudent = studentRows.find(student => student.id === selectedStudentId) ?? studentRows[0];
  const currentClassNo = Number(selectedStudent?.className.replace('Class ', '') ?? '1');
  const nextClassName = `Class ${Math.min(currentClassNo + 1, 12)}`;
  const visibleStudents = useMemo(() => {
    return studentRows.filter(student => {
      const classMatch = student.className === selectedClass && student.section === selectedSection;
      const searchMatch = `${student.name} ${student.id} ${student.guardian}`.toLowerCase().includes(search.toLowerCase());
      return classMatch && searchMatch;
    });
  }, [search, selectedClass, selectedSection, studentRows]);

  function downloadTemplate() {
    downloadTextFile(
      'safereach-student-upload-template.csv',
      'student_name,student_id,class_name,section,roll_no,guardian_name,guardian_phone,status\n',
      'text/csv'
    );
  }

  function moveSelectedStudent() {
    if (!selectedStudent) return;
    setStudentRows(current => current.map(student => student.id === selectedStudent.id ? { ...student, className: nextClassName, section: targetSection, last: `Moved from ${student.className}-${student.section} to ${nextClassName}-${targetSection}` } : student));
    setSelectedClass(nextClassName);
    setSelectedSection(targetSection);
  }

  function editStudent(studentId: string) {
    setStudentRows(current => current.map(student => student.id === studentId ? { ...student, status: 'Updated', last: 'Record edited by school admin' } : student));
  }

  function deleteStudent(studentId: string) {
    const student = studentRows.find(item => item.id === studentId);
    if (!window.confirm(`Delete ${student?.name ?? 'this student'} from class records?`)) return;
    setStudentRows(current => current.filter(student => student.id !== studentId));
  }

  return (
    <div className="p-gutter">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-stack-lg">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-primary">Class Records</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Select a class to view class teachers, subject teachers, and class students.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={downloadTemplate} className="flex items-center gap-2 px-4 py-2 border border-outline text-primary font-label-md rounded-lg hover:bg-surface-container-high transition-all">
            <span className="material-symbols-outlined text-[20px]">download</span>Download Template
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-secondary text-on-secondary font-label-md rounded-lg hover:opacity-90 transition-all">
            <span className="material-symbols-outlined text-[20px]">upload_file</span>Upload Excel
          </button>
          <Link href="/admin/students/add" className="flex items-center gap-2 px-6 py-2 bg-primary text-on-primary font-label-md rounded-lg hover:opacity-90 transition-all shadow-md">
            <span className="material-symbols-outlined text-[20px]">person_add</span>Add Student
          </Link>
        </div>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-gutter mb-stack-lg">
        {classSections.map(item => (
          <Link
            key={item.className}
            href={`/admin/students/class-view?class=${encodeURIComponent(item.className)}&section=${item.sections[0]}&view=overview`}
            className={`text-left bg-white rounded-xl border p-stack-md shadow-sm hover:shadow-md transition-all ${selectedClass === item.className ? 'border-primary ring-2 ring-primary/20' : 'border-outline-variant/40'}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-headline-md text-headline-md text-primary">{item.className}</p>
                <p className="text-label-md text-on-surface-variant">{item.sections.length} sections available</p>
              </div>
              <span className="material-symbols-outlined text-primary">school</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="bg-surface-container/60 rounded-lg p-3">
                <p className="text-label-sm text-on-surface-variant">Students</p>
                <p className="font-bold text-primary text-headline-md">{item.total}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-label-sm text-on-surface-variant">Attendance</p>
                <p className="font-bold text-green-700 text-headline-md">{item.attendance}</p>
              </div>
            </div>
          </Link>
        ))}
      </section>

      <section className="bg-white rounded-xl border border-outline-variant/40 shadow-sm p-stack-md mb-stack-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="font-headline-md text-headline-md text-on-surface">{selectedClass} Sections</h3>
            <p className="text-label-md text-on-surface-variant">Choose a section to open student records on a separate page.</p>
          </div>
          <div className="relative w-full md:w-80">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input className="w-full pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary text-body-md font-body-md" placeholder="Search selected section..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          {selectedClassMeta.sections.map(section => (
            <Link
              key={section}
              href={`/admin/students/class-view?class=${encodeURIComponent(selectedClass)}&section=${section}`}
              className={`px-5 py-3 rounded-lg font-label-md border transition-all ${selectedSection === section ? 'bg-primary text-on-primary border-primary shadow-sm' : 'bg-surface-container-low text-primary border-outline-variant hover:bg-primary-container hover:text-on-primary-container'}`}
            >
              Section {section}
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-xl border border-outline-variant/40 shadow-sm p-stack-md mb-stack-lg">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="max-w-2xl">
            <h3 className="font-headline-md text-headline-md text-primary">Move Existing Student to Next Standard</h3>
            <p className="text-label-md text-on-surface-variant">Use this instead of adding the same student again. The selected record is moved forward with the existing student ID.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-auto">
            <select value={selectedStudentId} onChange={e => setSelectedStudentId(e.target.value)} className="px-4 py-3 bg-surface-container border border-outline-variant rounded-lg">
              {studentRows.map(student => <option key={student.id} value={student.id}>{student.name} - {student.className}{student.section}</option>)}
            </select>
            <select value={targetSection} onChange={e => setTargetSection(e.target.value)} className="px-4 py-3 bg-surface-container border border-outline-variant rounded-lg">
              {['A', 'B', 'C', 'D'].map(section => <option key={section}>{section}</option>)}
            </select>
            <button type="button" onClick={() => setConfirmMove(true)} className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-secondary text-on-secondary rounded-lg font-bold hover:opacity-90">
              <span className="material-symbols-outlined text-[20px]">upgrade</span>
              Next Std
            </button>
          </div>
        </div>
        {selectedStudent && (
          <p className="mt-3 text-label-md text-on-surface-variant">Selected: <span className="font-bold text-on-surface">{selectedStudent.name}</span> moves from {selectedStudent.className}-{selectedStudent.section} to {nextClassName}-{targetSection}.</p>
        )}
      </section>
      <div className="glass-card rounded-xl p-stack-md border border-outline-variant/40">
        <h3 className="font-headline-md text-headline-md text-primary">Open Class Records</h3>
        <p className="text-label-md text-on-surface-variant mt-1">Student tables now open on a separate page from the class or section buttons above.</p>
        <Link href={`/admin/students/class-view?class=${encodeURIComponent(selectedClass)}&section=${selectedSection}`} className="mt-4 inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-primary text-on-primary font-bold hover:opacity-90">
          <span className="material-symbols-outlined text-[20px]">open_in_new</span>
          Open {selectedClass}-{selectedSection}
        </Link>
      </div>
      {confirmMove && selectedStudent && (
        <div className="fixed inset-0 z-[80] bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-outline-variant overflow-hidden">
            <div className="p-stack-md border-b border-outline-variant/40">
              <h3 className="font-headline-md text-headline-md text-primary">Confirm Next Standard Move</h3>
              <p className="mt-2 text-label-md text-on-surface-variant">This button moves an existing student record to the next class without creating a duplicate student. Use it only for yearly promotion or approved class movement.</p>
            </div>
            <div className="p-stack-md bg-surface-container-low">
              <p className="text-body-md text-on-surface">
                Move <span className="font-bold text-primary">{selectedStudent.name}</span> from {selectedStudent.className}-{selectedStudent.section} to {nextClassName}-{targetSection}?
              </p>
            </div>
            <div className="p-stack-md flex justify-end gap-3">
              <button type="button" onClick={() => setConfirmMove(false)} className="px-5 py-3 rounded-lg border border-outline-variant font-bold text-on-surface">Cancel</button>
              <button type="button" onClick={() => { moveSelectedStudent(); setConfirmMove(false); }} className="px-5 py-3 rounded-lg bg-secondary text-on-secondary font-bold">Accept Move</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
