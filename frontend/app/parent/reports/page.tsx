'use client';

import { useMemo, useState } from 'react';

const academicData = [
  {
    child: 'Aarav Mehta',
    section: 'Grade 8 - Section A',
    standards: ['Grade 7 - Completed', 'Grade 8 - Current'],
    exams: {
      'Term 1': [
        { name: 'Mathematics', mark: 82, total: 100 },
        { name: 'Science', mark: 79, total: 100 },
        { name: 'English', mark: 88, total: 100 },
        { name: 'Social Studies', mark: 76, total: 100 },
      ],
      'Term 2': [
        { name: 'Mathematics', mark: 88, total: 100 },
        { name: 'Science', mark: 83, total: 100 },
        { name: 'English', mark: 91, total: 100 },
        { name: 'Social Studies', mark: 80, total: 100 },
      ],
    },
  },
  {
    child: 'Diya Mehta',
    section: 'Grade 5 - Section C',
    standards: ['Grade 4 - Completed', 'Grade 5 - Current'],
    exams: {
      'Term 1': [
        { name: 'Mathematics', mark: 91, total: 100 },
        { name: 'Science', mark: 86, total: 100 },
        { name: 'English', mark: 93, total: 100 },
        { name: 'Computer Science', mark: 89, total: 100 },
      ],
      'Term 2': [
        { name: 'Mathematics', mark: 94, total: 100 },
        { name: 'Science', mark: 90, total: 100 },
        { name: 'English', mark: 95, total: 100 },
        { name: 'Computer Science', mark: 92, total: 100 },
      ],
    },
  },
];

export default function ParentReportsPage() {
  const [selectedChild, setSelectedChild] = useState(academicData[0].child);
  const selectedChildData = academicData.find(item => item.child === selectedChild) ?? academicData[0];
  const [selectedStandard, setSelectedStandard] = useState(selectedChildData.standards[1]);
  const [selectedExam, setSelectedExam] = useState('Term 2');
  const [showReport, setShowReport] = useState(false);

  const subjects = useMemo(() => selectedChildData.exams[selectedExam as keyof typeof selectedChildData.exams] ?? [], [selectedChildData, selectedExam]);
  const scored = subjects.reduce((sum, subject) => sum + subject.mark, 0);
  const total = subjects.reduce((sum, subject) => sum + subject.total, 0);
  const average = total ? Math.round((scored / total) * 100) : 0;

  function changeChild(value: string) {
    const nextChild = academicData.find(item => item.child === value) ?? academicData[0];
    setSelectedChild(value);
    setSelectedStandard(nextChild.standards[nextChild.standards.length - 1]);
    setShowReport(false);
  }

  return (
    <div className="px-container-padding-mobile md:px-container-padding-desktop py-stack-lg space-y-stack-lg">
      <section className="bg-white rounded-xl shadow-sm border border-outline-variant/30 p-stack-md">
        <h3 className="font-headline-md text-primary mb-4">Marks Report Filter</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="text-label-sm text-on-surface-variant block mb-1">Child</label>
            <select className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2.5" value={selectedChild} onChange={e => changeChild(e.target.value)}>
              {academicData.map(item => <option key={item.child}>{item.child}</option>)}
            </select>
          </div>
          <div>
            <label className="text-label-sm text-on-surface-variant block mb-1">Current Section</label>
            <input readOnly value={selectedChildData.section} className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2.5 text-on-surface-variant" />
          </div>
          <div>
            <label className="text-label-sm text-on-surface-variant block mb-1">Standard</label>
            <select className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2.5" value={selectedStandard} onChange={e => { setSelectedStandard(e.target.value); setShowReport(false); }}>
              {selectedChildData.standards.map(std => <option key={std}>{std}</option>)}
            </select>
          </div>
          <div>
            <label className="text-label-sm text-on-surface-variant block mb-1">Exam Name</label>
            <div className="flex gap-2">
              <select className="flex-1 bg-surface-container border border-outline-variant rounded-lg px-3 py-2.5" value={selectedExam} onChange={e => { setSelectedExam(e.target.value); setShowReport(false); }}>
                {Object.keys(selectedChildData.exams).map(exam => <option key={exam}>{exam}</option>)}
              </select>
              <button onClick={() => setShowReport(true)} className="px-4 py-2.5 bg-primary text-on-primary rounded-lg font-bold">OK</button>
            </div>
          </div>
        </div>
      </section>

      {showReport ? (
        <>
          <div className="bg-gradient-to-r from-primary to-primary-container rounded-2xl p-stack-md text-on-primary">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div><h3 className="font-headline-md text-headline-md">{selectedExam} Marks</h3><p className="text-on-primary/80 text-body-md">{selectedChild} - {selectedStandard}</p></div>
              <div className="flex gap-6">{[[`${scored}/${total}`, 'Marks'], [`${average}%`, 'Average'], [average >= 90 ? 'A+' : average >= 80 ? 'A' : 'B+', 'Grade']].map(([v, l]) => <div key={l} className="text-center"><p className="font-headline-lg text-headline-lg">{v}</p><p className="text-on-primary/80 text-label-sm">{l}</p></div>)}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-stack-lg">
            <div className="bg-white rounded-xl shadow-sm border border-outline-variant/30 p-stack-md">
              <h3 className="font-headline-md text-on-surface mb-4">Subject Performance</h3>
              <div className="space-y-4">
                {subjects.map(subject => {
                  const pct = Math.round((subject.mark / subject.total) * 100);
                  return (
                    <div key={subject.name}>
                      <div className="flex items-center justify-between mb-1"><span className="text-label-md text-on-surface">{subject.name}</span><span className="font-bold text-primary">{subject.mark}/{subject.total}</span></div>
                      <div className="w-full bg-surface-container rounded-full h-2"><div className="bg-primary rounded-full h-2" style={{ width: `${pct}%` }}></div></div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-outline-variant/30 p-stack-md">
              <h3 className="font-headline-md text-on-surface mb-4">Report Summary</h3>
              <div className="space-y-3">
                {[
                  ['Selected child', selectedChild],
                  ['Selected class', selectedStandard],
                  ['Selected exam', selectedExam],
                ].map(([label, value]) => (
                  <div key={label} className="p-3 bg-surface-container rounded-lg"><p className="text-label-sm text-on-surface-variant">{label}</p><p className="font-label-md text-on-surface">{value}</p></div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-outline-variant/30 p-stack-lg text-center text-on-surface-variant">
          Select child, standard, and exam name, then click OK to display marks and subject performance.
        </div>
      )}
    </div>
  );
}
