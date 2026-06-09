'use client';

import { useState } from 'react';

const conversations = [
  {id:1,name:'Mr. James Anderson',role:'Class Teacher – Aarav',time:'10:15 AM',unread:2,avatar:'JA',online:true,preview:"Regarding Aarav's test score this week…"},
  {id:2,name:'Principal Verma',role:'School Administration',time:'Yesterday',unread:0,avatar:'PV',online:false,preview:"Annual Sports Day is scheduled for June 5th."},
  {id:3,name:'Ms. Anita Roy',role:'Class Teacher – Diya',time:'May 26',unread:1,avatar:'AR',online:true,preview:"Diya has been doing wonderfully in class!"},
  {id:4,name:'School Nurse',role:'Health & Safety',time:'May 22',unread:0,avatar:'SN',online:false,preview:"Reminder: medical check-up is due next month."},
];
const threads: Record<number,{from:string;text:string;time:string;me:boolean}[]> = {
  1:[{from:'Mr. Anderson',text:"Good morning! I wanted to update you on Aarav's progress. He's been very engaged this week.",time:'9:00 AM',me:false},{from:'You',text:'That is wonderful to hear! He has been studying hard at home too.',time:'9:20 AM',me:true},{from:'Mr. Anderson',text:"However, his last test score was 72%. I'd suggest focusing on Chapter 5 – Quadratics.",time:'9:35 AM',me:false},{from:'You',text:'We will work on that over the weekend. Thank you so much, Mr. Anderson!',time:'9:50 AM',me:true},{from:'Mr. Anderson',text:"Regarding Aarav's test score this week – he scored 85%! Great improvement!",time:'10:15 AM',me:false}],
  2:[{from:'Principal Verma',text:"Dear Parents, we are pleased to announce the Annual Sports Day scheduled for June 5th, 2025.",time:'Yesterday 3:00 PM',me:false},{from:'You',text:'Thank you for the update! Both my children will participate.',time:'Yesterday 4:00 PM',me:true}],
};

export default function ParentMessagesPage() {
  const [active, setActive] = useState(1);
  const [newMsg, setNewMsg] = useState('');
  const thread = threads[active] || [];
  const activeConv = conversations.find(c=>c.id===active);
  return (
    <div className="flex overflow-hidden" style={{height:'calc(100vh - 64px)'}}>
      <aside className="w-80 border-r border-outline-variant/30 bg-surface-container-low flex-col shrink-0 hidden md:flex">
        <div className="p-3 border-b border-outline-variant/20">
          <div className="relative"><span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span><input className="w-full pl-9 pr-3 py-2 bg-white border border-outline-variant rounded-lg text-label-md focus:ring-2 focus:ring-primary focus:outline-none" placeholder="Search conversations…" /></div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map(c=>(
            <button key={c.id} onClick={()=>setActive(c.id)} className={`w-full flex items-start gap-3 px-4 py-3 border-b border-outline-variant/20 text-left transition-colors ${active===c.id?'bg-primary-container/30':'hover:bg-surface-container'}`}>
              <div className="relative shrink-0"><div className={`w-10 h-10 rounded-full flex items-center justify-center text-label-sm font-bold ${active===c.id?'bg-primary text-white':'bg-primary-container text-primary'}`}>{c.avatar}</div>{c.online&&<span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>}</div>
              <div className="flex-1 min-w-0"><div className="flex items-center justify-between"><p className={`text-label-md truncate ${c.unread>0?'font-bold text-on-surface':'text-on-surface-variant'}`}>{c.name}</p><p className="text-label-sm text-on-surface-variant shrink-0 ml-2">{c.time}</p></div><p className="text-label-sm text-on-surface-variant truncate">{c.preview}</p></div>
              {c.unread>0&&<span className="w-5 h-5 rounded-full bg-primary text-on-primary text-label-sm font-bold flex items-center justify-center shrink-0 mt-1">{c.unread}</span>}
            </button>
          ))}
        </div>
      </aside>
      <div className="flex-1 flex flex-col bg-background">
        <div className="px-4 py-3 bg-surface border-b border-outline-variant/30 flex items-center gap-3 shrink-0">
          <div className="relative"><div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-label-sm">{activeConv?.avatar}</div>{activeConv?.online&&<span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></span>}</div>
          <div><p className="font-label-md font-bold text-on-surface">{activeConv?.name}</p><p className="text-label-sm text-on-surface-variant">{activeConv?.role}</p></div>
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
            <input className="flex-1 bg-transparent border-none focus:ring-0 text-body-md placeholder:text-on-surface-variant outline-none" placeholder="Type a message to the school…" value={newMsg} onChange={e=>setNewMsg(e.target.value)} />
            <button className="text-on-surface-variant hover:text-primary p-1"><span className="material-symbols-outlined text-[20px]">attach_file</span></button>
            <button onClick={()=>setNewMsg('')} className={`p-1.5 rounded-full transition-colors ${newMsg.trim()?'bg-primary text-on-primary':'bg-surface-container-high text-on-surface-variant'}`}><span className="material-symbols-outlined text-[20px]">send</span></button>
          </div>
        </div>
      </div>
    </div>
  );
}
