'use client';

import Link from 'next/link';

export default function StudentProfilePage() {
  return (
    <div className="p-container-padding-mobile md:p-container-padding-desktop max-w-7xl mx-auto w-full">
      <nav className="flex gap-2 text-label-md text-on-surface-variant mb-stack-lg items-center">
        <Link className="hover:text-primary" href="/admin/students">Directory</Link>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <a className="hover:text-primary" href="#">Grade 4</a>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <span className="text-primary font-bold">Liam Henderson</span>
      </nav>
      <div className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.12)] p-stack-lg mb-stack-lg flex flex-col md:flex-row gap-stack-lg items-center md:items-start">
        <div className="relative">
          <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-surface-container-high"><img alt="Liam Henderson" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC0nctrsVHL1W7d7owQdcWqKEDC3kLd4kNUfzqtP9eYoREipnjj3oy6nJXJ9REqZs-LP2c0mcOv91HsMM6V5JOTtF_Z1JVlx00nCdm_92vQxZp0Rx4xrwkmyUlaGNyzDea9045O-N7mBtWHsSBplEqL4TxdqoWuLfj5sfCPLrLbBniqAyx1v8T3ALgS0kYmALY6VtMLQMehew2Flc2HjCdewr8p-LL1TXHSKw22tWF7_5QCjcjqNr4LlyehP_KVnmIcePann9yuP6xW" /></div>
          <div className="absolute -bottom-2 -right-2 bg-secondary text-white p-1.5 rounded-lg shadow-md border-2 border-white flex items-center justify-center"><span className="material-symbols-outlined text-[18px]">verified_user</span></div>
        </div>
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
            <h1 className="font-headline-lg text-headline-lg text-primary">Liam Henderson</h1>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-label-md font-bold bg-secondary/10 text-secondary"><span className="w-2 h-2 rounded-full bg-secondary mr-2"></span>At School</span>
          </div>
          <p className="text-body-md text-on-surface-variant mb-4">Student ID: GT-99021 • Grade 4-B • Room 204</p>
          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            <div className="flex items-center gap-2 bg-surface-container-low px-4 py-2 rounded-lg border border-outline-variant"><span className="material-symbols-outlined text-primary text-[20px]">directions_bus</span><span className="text-label-md">Bus Route 42</span></div>
            <div className="flex items-center gap-2 bg-surface-container-low px-4 py-2 rounded-lg border border-outline-variant"><span className="material-symbols-outlined text-tertiary text-[20px]">medical_services</span><span className="text-label-md">Asthma (Inhaler in Office)</span></div>
          </div>
        </div>
        <div className="flex flex-col gap-2 w-full md:w-auto">
          <button className="bg-primary text-white h-[48px] px-6 rounded-lg font-bold flex items-center justify-center gap-2 hover:opacity-90"><span className="material-symbols-outlined">description</span>Safety Report</button>
          <button className="border-2 border-outline-variant text-on-surface-variant h-[48px] px-6 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-surface-container-low"><span className="material-symbols-outlined">edit</span>Edit Profile</button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        <div className="lg:col-span-8 flex flex-col gap-gutter">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
            <div className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.12)] p-stack-lg">
              <div className="flex items-center justify-between mb-stack-md"><h3 className="font-headline-md text-headline-md text-primary">Personal Details</h3><span className="material-symbols-outlined text-outline">info</span></div>
              <dl className="space-y-4">
                <div className="flex flex-col"><dt className="text-label-sm text-on-surface-variant uppercase tracking-wider">Date of Birth</dt><dd className="text-body-md font-medium">May 14, 2014 (9 Years Old)</dd></div>
                <div className="flex flex-col"><dt className="text-label-sm text-on-surface-variant uppercase tracking-wider">Home Address</dt><dd className="text-body-md font-medium">482 Oakwood Ave, North Hill, NJ 07003</dd></div>
                <div className="flex flex-col"><dt className="text-label-sm text-on-surface-variant uppercase tracking-wider">Emergency Pickup Code</dt><dd className="text-body-md font-bold text-primary tracking-widest">#8821-X</dd></div>
              </dl>
            </div>
            <div className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.12)] p-stack-lg">
              <div className="flex items-center justify-between mb-stack-md"><h3 className="font-headline-md text-headline-md text-primary">Guardian Info</h3><button className="text-primary font-bold text-label-md">Add New</button></div>
              <div className="space-y-6">
                {[{name:'Sarah Henderson',role:'Mother • Primary',img:'https://lh3.googleusercontent.com/aida-public/AB6AXuADLbWDf9sCYZLo7iVrfBDHuVTG4nJoAspoXg_ATb0onTOZ2ZWVjbCyv_GpWA_wuyggjRU0Dzv215m7VqgveoWDZGAz8y0g0M0puAO2eKLmyO-qi6_dENLFLCajyk2NAP5g9XCo9evKBXuq13MO_79tGcagsQBVIdJRRuhHiiwqkPJUcqa6ENANxqrz4GdN7srfxl-oLd9lE0zbd7HOeg6SfUwNwGdPNCTXzCbkIzhrXfb0j7Gz0uhdQGUZlhup4w4UyUvaqu2wts3t'},
                  {name:'Thomas Henderson',role:'Father • Secondary',img:'https://lh3.googleusercontent.com/aida-public/AB6AXuATJWLUZ1dt8y2ykBZmOGJS7YojANzT3kEKbKdBfmmNjVrveM2sj5pIIoO57H-KlIjJBzPVAy0xWgIqmudKNoI7zKeErjIo56j6v16v4htAbSLGp_oan8sjDtfLDhta0zq5IOqC89BpHbykKzv-c0u8NTz9msRiqZCJAWxwm50VejfIkDW-p_L8sPFpuycUlH31Kz3kpfjIaKsM-Ze4lTk_LgM9z80MsNPtrqjVYfF9C3vvxwofHqN2eF0cxnW7m2TZF9pC4B7co7bp'}
                ].map((g,i)=>(
                  <div key={i} className={`flex items-center gap-4 ${i===0?'border-b border-surface-container pb-4':''}`}>
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-surface-container-high"><img alt={g.name} className="w-full h-full object-cover" src={g.img} /></div>
                    <div className="flex-1"><h4 className="font-bold text-body-md">{g.name}</h4><p className="text-label-md text-on-surface-variant">{g.role}</p></div>
                    <div className="flex gap-2">
                      <button className="p-2 rounded-full bg-surface-container-high text-primary hover:bg-primary hover:text-white transition-all"><span className="material-symbols-outlined">call</span></button>
                      {i===0 && <button className="p-2 rounded-full bg-surface-container-high text-primary hover:bg-primary hover:text-white transition-all"><span className="material-symbols-outlined">chat</span></button>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.12)] overflow-hidden">
            <div className="p-stack-lg border-b border-outline-variant flex justify-between items-center"><h3 className="font-headline-md text-headline-md text-primary">Recent Safety Logs</h3><button className="text-primary font-bold text-label-md flex items-center gap-1">View History<span className="material-symbols-outlined text-[18px]">arrow_forward</span></button></div>
            <div className="divide-y divide-surface-container-low">
              {[{icon:'meeting_room',bg:'bg-secondary-container/30',color:'text-secondary',text:'Entered Room 204',sub:'Scan confirmed by Teacher Reynolds • 8:42 AM',time:'Today',border:false},
                {icon:'directions_bus',bg:'bg-primary-container/30',color:'text-primary',text:'Boarded Bus 42',sub:'Confirmed by Driver Miller • 8:15 AM',time:'Today',border:false},
                {icon:'warning',bg:'bg-error-container/30',color:'text-error',text:'Unscheduled Early Leave Attempt',sub:'Blocked at Gate 2. Notified Primary Guardian • 2:15 PM',time:'Yesterday',border:true},
                {icon:'home',bg:'bg-secondary-container/30',color:'text-secondary',text:'Dropped Off (Parent Pickup)',sub:'Authenticated via PIN: #8821-X • 3:30 PM',time:'Yesterday',border:false},
              ].map((log,i)=>(
                <div key={i} className={`p-stack-md flex items-start gap-4 ${log.border?'border-l-4 border-error':''} hover:bg-surface-container-low transition-colors cursor-pointer`}>
                  <div className={`w-10 h-10 rounded-lg ${log.bg} flex items-center justify-center ${log.color}`}><span className="material-symbols-outlined">{log.icon}</span></div>
                  <div className="flex-1"><p className={`text-body-md font-medium ${log.border?'font-bold text-error':'text-on-surface'}`}>{log.text}</p><p className="text-label-md text-on-surface-variant">{log.sub}</p></div>
                  <span className="text-label-md text-on-surface-variant">{log.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="lg:col-span-4 flex flex-col gap-gutter">
          <div className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.12)] p-stack-lg">
            <div className="flex items-center justify-between mb-stack-md"><h3 className="font-headline-md text-headline-md text-primary">Attendance</h3><div className="text-secondary font-bold text-headline-md">98%</div></div>
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['M','T','W','T','F','S','S'].map((d,i)=><div key={i} className="text-center text-label-sm text-on-surface-variant font-bold">{d}</div>)}
              {[{n:1,cls:'bg-secondary'},{n:2,cls:'bg-secondary'},{n:3,cls:'bg-secondary'},{n:4,cls:'bg-secondary'},{n:5,cls:'bg-error-container text-error'},{n:'',cls:'bg-surface-container opacity-30'},{n:'',cls:'bg-surface-container opacity-30'},
                {n:8,cls:'bg-secondary'},{n:9,cls:'bg-secondary'},{n:10,cls:'bg-secondary'},{n:11,cls:'bg-secondary'},{n:12,cls:'bg-secondary'},{n:'',cls:'bg-surface-container opacity-30'},{n:'',cls:'bg-surface-container opacity-30'},
              ].map((d,i)=><div key={i} className={`aspect-square ${d.cls} rounded-lg flex items-center justify-center font-bold text-label-md ${d.cls.includes('secondary')?'text-white':''}`}>{d.n}</div>)}
            </div>
            <div className="space-y-2">
              {[['Present','144 Days'],['Absent','2 Days'],['Excused','1 Day']].map(([k,v])=><div key={k} className="flex justify-between text-label-md"><span className="text-on-surface-variant">{k}</span><span className="font-bold">{v}</span></div>)}
            </div>
          </div>
          <div className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.12)] p-stack-lg border-l-4 border-primary">
            <h3 className="font-headline-md text-headline-md text-primary mb-stack-md">Admin Actions</h3>
            <div className="space-y-3">
              {[['event_busy','Mark Leave'],['assignment_ind','Temporary Caretaker'],['share','Share Profile']].map(([icon,label])=>(
                <button key={label} className="w-full flex items-center justify-between p-4 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors group"><div className="flex items-center gap-3"><span className="material-symbols-outlined text-primary">{icon}</span><span className="font-bold text-body-md">{label}</span></div><span className="material-symbols-outlined opacity-0 group-hover:opacity-100 transition-opacity">chevron_right</span></button>
              ))}
              <div className="pt-stack-md border-t border-surface-container mt-stack-md"><button className="w-full flex items-center justify-center gap-2 text-error font-bold p-3 rounded-xl border-2 border-error/20 hover:bg-error/5 transition-colors"><span className="material-symbols-outlined">delete</span>Archive Student Record</button></div>
            </div>
          </div>
          <div className="bg-primary rounded-xl p-stack-lg text-white relative overflow-hidden">
            <div className="relative z-10"><h4 className="font-bold mb-1">Current Transit Status</h4><p className="text-label-md opacity-80 mb-4">Live tracking active via GT-Tag v2</p><div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm border border-white/20"><div className="flex items-center gap-2"><span className="material-symbols-outlined animate-pulse text-secondary-fixed" style={{fontVariationSettings: "'FILL' 1"}}>my_location</span><span className="font-bold">Building B, Zone 4</span></div></div></div>
            <div className="absolute -right-8 -bottom-8 opacity-10"><span className="material-symbols-outlined text-[120px]">map</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
