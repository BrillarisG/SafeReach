'use client';

import { Fragment, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AddStudentPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  const router = useRouter();

  function nextStep() { if (currentStep < totalSteps) setCurrentStep(s => s + 1); }
  function prevStep() { if (currentStep > 1) setCurrentStep(s => s - 1); }
  function handleSubmit(e: React.FormEvent) { e.preventDefault(); router.push('/admin/students'); }

  const stepCls = (step: number) => {
    if (step < currentStep) return 'w-10 h-10 rounded-full bg-secondary text-on-secondary flex items-center justify-center font-bold';
    if (step === currentStep) return 'w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold';
    return 'w-10 h-10 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center font-bold';
  };

  return (
    <div className="p-container-padding-mobile md:p-container-padding-desktop">
      <div className="max-w-4xl mx-auto">
        <div className="mb-stack-lg">
          <nav className="flex items-center gap-2 text-label-sm text-on-surface-variant mb-2">
            <Link href="/admin/students" className="hover:text-primary">Students</Link>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <span className="text-primary font-bold">Add New Student</span>
          </nav>
          <h1 className="font-headline-lg text-headline-lg text-primary">Student Enrollment</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Register a new student into the SafeReach ecosystem.</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-stack-md mb-stack-lg flex justify-between items-center overflow-x-auto">
          {[['Personal Info',1],['Guardian Details',2],['Medical & Safety',3],['Transport',4]].map(([label, step], i, arr) => (
            <Fragment key={step as number}>
              <div key={step as number} className={`flex items-center gap-3 min-w-max ${currentStep < (step as number) ? 'opacity-50' : ''}`}>
                <div className={stepCls(step as number)}>{currentStep > (step as number) ? <span className="material-symbols-outlined text-[20px]">check</span> : step}</div>
                <span className={`font-label-md text-label-md ${currentStep >= (step as number) ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>{label}</span>
              </div>
              {i < arr.length - 1 && <div key={`div-${i}`} className="h-[1px] w-8 bg-outline-variant mx-4"></div>}
            </Fragment>
          ))}
        </div>
        <form className="space-y-stack-lg" onSubmit={handleSubmit}>
          {currentStep === 1 && (
            <section className="step-transition">
              <div className="bg-white rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden">
                <div className="p-stack-lg bg-surface-container-low/50 border-b border-outline-variant/30 flex justify-between items-center"><h2 className="font-headline-md text-headline-md text-primary">Personal Information</h2><span className="text-label-sm px-3 py-1 bg-primary/10 text-primary rounded-full">Step 1 of 4</span></div>
                <div className="p-stack-lg grid grid-cols-1 md:grid-cols-12 gap-gutter">
                  <div className="md:col-span-4 flex flex-col items-center gap-4">
                    <div className="w-40 h-40 rounded-xl bg-surface-container-highest border-2 border-dashed border-outline flex flex-col items-center justify-center text-on-surface-variant cursor-pointer hover:bg-surface-container-high transition-colors group">
                      <span className="material-symbols-outlined text-4xl group-hover:scale-110 transition-transform">add_a_photo</span>
                      <p className="text-label-sm mt-2">Upload Photo</p>
                      <input accept="image/*" className="hidden" type="file" />
                    </div>
                    <p className="text-[11px] text-center text-on-surface-variant px-4">JPEG or PNG. Max 2MB. Face clearly visible for security recognition.</p>
                  </div>
                  <div className="md:col-span-8 space-y-stack-md">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-md">
                      <div className="flex flex-col gap-1.5"><label className="font-label-md text-label-md text-on-surface-variant">Full Name</label><input className="w-full p-3 bg-surface-container-lowest border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="e.g. John Doe" type="text" /></div>
                      <div className="flex flex-col gap-1.5"><label className="font-label-md text-label-md text-on-surface-variant">Date of Birth</label><input className="w-full p-3 bg-surface-container-lowest border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none" type="date" /></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-md">
                      <div className="flex flex-col gap-1.5"><label className="font-label-md text-label-md text-on-surface-variant">Grade Level</label><select className="w-full p-3 bg-surface-container-lowest border border-outline-variant rounded-lg focus:border-primary outline-none">{['Kindergarten','Grade 1','Grade 2','Grade 3','Grade 4','Grade 5'].map(g=><option key={g}>{g}</option>)}</select></div>
                      <div className="flex flex-col gap-1.5"><label className="font-label-md text-label-md text-on-surface-variant">Section / Classroom</label><input className="w-full p-3 bg-surface-container-lowest border border-outline-variant rounded-lg focus:border-primary outline-none" placeholder="e.g. 3-B" type="text" /></div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="font-label-md text-label-md text-on-surface-variant">Gender</label>
                      <div className="flex gap-stack-md">{['Male','Female','Other'].map(g=><label key={g} className="flex-1 cursor-pointer"><input className="hidden peer" name="gender" type="radio" /><div className="p-3 border border-outline-variant rounded-lg text-center peer-checked:bg-primary-container peer-checked:border-primary peer-checked:text-on-primary-container hover:bg-surface-container-low transition-all">{g}</div></label>)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}
          {currentStep === 2 && (
            <section className="step-transition">
              <div className="bg-white rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden">
                <div className="p-stack-lg bg-surface-container-low/50 border-b border-outline-variant/30 flex justify-between items-center"><h2 className="font-headline-md text-headline-md text-primary">Guardian Information</h2><span className="text-label-sm px-3 py-1 bg-primary/10 text-primary rounded-full">Step 2 of 4</span></div>
                <div className="p-stack-lg space-y-stack-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                    {[['person','Primary Guardian'],['emergency','Emergency Contact']].map(([icon,title])=>(
                      <div key={title} className="space-y-stack-md p-stack-md border border-outline-variant/30 rounded-xl bg-surface-bright">
                        <h3 className="font-label-md text-label-md font-bold text-primary flex items-center gap-2"><span className="material-symbols-outlined text-[20px]">{icon}</span>{title}</h3>
                        {['Full Name','Relationship','Phone Number','Email Address'].map(f=><div key={f} className="space-y-stack-sm"><label className="text-label-sm text-on-surface-variant uppercase">{f}</label><input className="w-full p-3 bg-white border border-outline-variant rounded-lg focus:ring-1 focus:ring-primary outline-none" type={f.includes('Email')?'email':f.includes('Phone')?'tel':'text'} /></div>)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}
          {currentStep === 3 && (
            <section className="step-transition">
              <div className="bg-white rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden">
                <div className="p-stack-lg bg-surface-container-low/50 border-b border-outline-variant/30 flex justify-between items-center"><h2 className="font-headline-md text-headline-md text-primary">Medical &amp; Safety Info</h2><span className="text-label-sm px-3 py-1 bg-primary/10 text-primary rounded-full">Step 3 of 4</span></div>
                <div className="p-stack-lg space-y-stack-lg">
                  <div className="space-y-stack-md p-stack-md border-l-4 border-error bg-error-container/10 rounded-r-xl"><h3 className="font-label-md text-label-md font-bold text-error flex items-center gap-2"><span className="material-symbols-outlined text-[20px]">medical_services</span>Critical Medical Alerts &amp; Allergies</h3><textarea className="w-full p-3 bg-white border border-outline-variant rounded-lg focus:ring-1 focus:ring-error outline-none" placeholder="List allergies, medications, or chronic conditions..." rows={3}></textarea></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                    <div className="space-y-stack-sm"><label className="font-label-md text-label-md text-on-surface-variant">Blood Group</label><select className="w-full p-3 bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-1 focus:ring-primary outline-none">{['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(b=><option key={b}>{b}</option>)}</select></div>
                    <div className="space-y-stack-sm"><label className="font-label-md text-label-md text-on-surface-variant">Physician Name</label><input className="w-full p-3 bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-1 focus:ring-primary outline-none" type="text" /></div>
                  </div>
                </div>
              </div>
            </section>
          )}
          {currentStep === 4 && (
            <section className="step-transition">
              <div className="bg-white rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden">
                <div className="p-stack-lg bg-surface-container-low/50 border-b border-outline-variant/30 flex justify-between items-center"><h2 className="font-headline-md text-headline-md text-primary">Transport Assignment</h2><span className="text-label-sm px-3 py-1 bg-primary/10 text-primary rounded-full">Step 4 of 4</span></div>
                <div className="p-stack-lg space-y-stack-lg">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
                    <div className="md:col-span-5 space-y-stack-md">
                      {[['secondary','Morning Route'],['tertiary','Afternoon Route']].map(([color,label])=>(
                        <div key={label} className={`p-stack-md bg-${color}/5 border border-${color}/20 rounded-xl`}>
                          <label className={`font-label-md text-label-md text-${color} font-bold block mb-stack-sm`}>{label}</label>
                          <select className="w-full p-3 bg-white border border-outline-variant rounded-lg focus:ring-1 outline-none mb-stack-md">
                            <option>Route A-12 (North District)</option><option>Route B-04 (Downtown Core)</option><option>Route C-09 (Suburban East)</option><option>Private Vehicle / Drop-off</option>
                          </select>
                        </div>
                      ))}
                    </div>
                    <div className="md:col-span-7 h-[300px] bg-surface-container rounded-xl relative overflow-hidden">
                      <img className="w-full h-full object-cover grayscale opacity-40" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDWsiOB597tq4xAazlYNuDnw1XHaHOo6vV5NKbm9bUmysa1sZlaLA7yeITj9WIW-x6uVCC0F2R_zbpCUTpdZIbUEcCoq6_4bs5Wj_rkBvaykEPcsOa5iuxb85CHHx8OBJ-6j7B9VZmOOHyiWdJFofrnJcfgwvQscJQUM_yKzWSNhKuxLyhoWa3CaNWzKXumyBe1Cs9WguBxAkRCx1_RaEQiC7WxexeNbCXA7mbkD8tSjVLCI9Brm_At9LRYVQE-PuHq36RIr4ufyQxD" alt="Route Map" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-stack-lg text-center bg-white/20 backdrop-blur-sm"><span className="material-symbols-outlined text-4xl text-primary mb-2">map</span><p className="font-label-md text-label-md text-primary font-bold">Interactive Route Selection</p><p className="text-label-sm text-on-surface-variant">Selected Stop: Highland Park Area</p></div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}
          <div className="flex justify-between items-center py-stack-md">
            {currentStep > 1 ? <button className="px-8 py-3 rounded-lg border border-outline-variant text-on-surface-variant font-label-md hover:bg-surface-container-low transition-all" type="button" onClick={prevStep}>Back</button> : <div></div>}
            <div className="flex-1"></div>
            <div className="flex gap-stack-md">
              <button className="px-8 py-3 rounded-lg text-on-surface-variant font-label-md hover:text-primary transition-all" type="button">Save Draft</button>
              {currentStep < totalSteps
                ? <button className="px-10 py-3 bg-primary text-on-primary rounded-lg font-label-md shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity" type="button" onClick={nextStep}>Next Step</button>
                : <button className="px-10 py-3 bg-primary text-on-primary rounded-lg font-label-md shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity" type="submit">Complete Enrollment</button>
              }
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
