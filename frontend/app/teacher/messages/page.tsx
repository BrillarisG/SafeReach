'use client';

import { useState } from 'react';

const conversations = [
  {id:1,name:'Rajesh Shah (Parent)',sub:"Re: Aryan's performance this term",time:'10:32 AM',unread:2,avatar:'RS'},
  {id:2,name:'Admin — Principal Verma',sub:'Upcoming staff meeting agenda',time:'Yesterday',unread:0,avatar:'PV'},
  {id:3,name:'Sunita Nair (Parent)',sub:'Priya was absent on Monday…',time:'Yesterday',unread:1,avatar:'SN'},
  {id:4,name:'Mr. David Lee',sub:'Can we swap supervision slots?',time:'May 26',unread:0,avatar:'DL'},
  {id:5,name:'Counselor Deepa',sub:'Student referral – Lavanya P.',time:'May 25',unread:0,avatar:'CD'},
];
const threads: Record<number,{from:string;text:string;time:string;me:boolean}[]> = {
  1:[{from:'Rajesh Shah',text:"Good morning, I wanted to discuss Aryan's recent test performance.",time:'9:00 AM',me:false},{from:'You',text:"Good morning, Mr. Shah! Aryan scored 68% on the last test. He's been a bit distracted.",time:'9:15 AM',me:true},{from:'Rajesh Shah',text:'I see. Is there anything specific we can do at home to help?',time:'9:30 AM',me:false},{from:'You',text:"I'd recommend focusing on algebra revision. I'll share some practice sheets.",time:'9:45 AM',me:true},{from:'Rajesh Shah',text:'Thank you so much. We really appreciate your support.',time:'10:32 AM',me:false}],
  2:[{from:'Principal Verma',text:'Staff meeting scheduled for Friday 3 PM in the Conference Room.',time:'Yesterday 2:00 PM',me:false},{from:'You',text:'Noted. I will attend. Should we prepare a class-wise attendance summary?',time:'Yesterday 2:30 PM',me:true},{from:'Principal Verma',text:'Yes, please bring the Term 2 attendance data.',time:'Yesterday 3:00 PM',me:false}],
};

export default function TeacherMessagesPage() {
  const [active, setActive] = useState(1);
  const [newMsg, setNewMsg] = useState('');
  const thread = threads[active] || [];
  return (
    <div className="flex overflow-hidden" style={{height:'calc(100vh - 64px)'}}>
      <aside className="w-80 border-r border-outline-variant/30 bg-surface-container-low flex-col shrink-0 hidden md:flex">
        <div className="p-3 border-b border-outline-variant/20">
          <div className="relative"><span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span><input className="w-full pl-9 pr-3 py-2 bg-white border border-outline-variant rounded-lg text-label-md focus:ring-2 focus:ring-primary focus:outline-none" placeholder="Search messages..." /></div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map(c=>(
            <button key={c.id} onClick={()=>setActive(c.id)} className={`w-full flex items-center gap-3 px-4 py-3 border-b border-outline-variant/20 text-left transition-colors ${active===c.id?'bg-primary-container/30':'hover:bg-surface-container'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-label-sm font-bold shrink-0 ${active===c.id?'bg-primary text-white':'bg-primary-container text-primary'}`}>{c.avatar}</div>
              <div className="flex-1 min-w-0"><div className="flex items-center justify-between"><p className={`text-label-md truncate ${c.unread>0?'font-bold text-on-surface':'text-on-surface-variant'}`}>{c.name}</p><p className="text-label-sm text-on-surface-variant shrink-0 ml-2">{c.time}</p></div><p className="text-label-sm text-on-surface-variant truncate">{c.sub}</p></div>
              {c.unread>0 && <span className="w-5 h-5 rounded-full bg-primary text-on-primary text-label-sm font-bold flex items-center justify-center shrink-0">{c.unread}</span>}
            </button>
          ))}
        </div>
      </aside>
      <div className="flex-1 flex flex-col bg-background">
        <div className="px-4 py-3 bg-surface border-b border-outline-variant/30 flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-label-sm">{conversations.find(c=>c.id===active)?.avatar}</div>
          <div><p className="font-label-md font-bold text-on-surface">{conversations.find(c=>c.id===active)?.name}</p><p className="text-label-sm text-green-600">Online</p></div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {thread.map((m,i)=>(
            <div key={i} className={`flex ${m.me?'justify-end':'justify-start'}`}>
              <div className={`max-w-sm px-4 py-2.5 rounded-2xl text-body-md ${m.me?'bg-primary text-on-primary rounded-br-sm':'bg-white text-on-surface rounded-bl-sm shadow-sm border border-outline-variant/20'}`}>
                <p>{m.text}</p><p className={`text-label-sm mt-1 ${m.me?'text-on-primary/70':'text-on-surface-variant'}`}>{m.time}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="p-3 bg-surface border-t border-outline-variant/30 shrink-0">
          <div className="flex items-center gap-2 bg-surface-container rounded-xl px-3 py-2 border border-outline-variant">
            <input className="flex-1 bg-transparent border-none focus:ring-0 text-body-md placeholder:text-on-surface-variant outline-none" placeholder="Type a message..." value={newMsg} onChange={e=>setNewMsg(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&newMsg.trim())setNewMsg('');}} />
            <button className="text-on-surface-variant hover:text-primary transition-colors p-1"><span className="material-symbols-outlined text-[20px]">attach_file</span></button>
            <button onClick={()=>setNewMsg('')} className={`p-1.5 rounded-full transition-colors ${newMsg.trim()?'bg-primary text-on-primary':'bg-surface-container-high text-on-surface-variant'}`}><span className="material-symbols-outlined text-[20px]">send</span></button>
          </div>
        </div>
      </div>
    </div>
  );
}
