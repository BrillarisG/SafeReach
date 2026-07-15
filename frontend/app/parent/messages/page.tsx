'use client';

import { useMemo, useState } from 'react';
import { useStudentTravelState } from '@/lib/studentTravel';

type Conversation = {
  id: string;
  name: string;
  role: string;
  time: string;
  unread: number;
  avatar: string;
  online: boolean;
  preview: string;
  studentId?: string;
};

type Message = { from: string; text: string; time: string; me: boolean };

const baseConversations: Conversation[] = [
  { id: 'base-1', name: 'Mr. James Anderson', role: 'Class Teacher - Leo', time: '10:15 AM', unread: 2, avatar: 'JA', online: true, preview: "Regarding Leo's test score this week..." },
  { id: 'base-2', name: 'Principal Verma', role: 'School Administration', time: 'Yesterday', unread: 0, avatar: 'PV', online: false, preview: 'Annual Sports Day is scheduled for June 5th.' },
  { id: 'base-3', name: 'Ms. Anita Roy', role: 'Class Teacher - Maya', time: 'May 26', unread: 1, avatar: 'AR', online: true, preview: 'Maya has been doing wonderfully in class.' },
  { id: 'base-4', name: 'School Nurse', role: 'Health & Safety', time: 'May 22', unread: 0, avatar: 'SN', online: false, preview: 'Reminder: medical check-up is due next month.' },
];

const baseThreads: Record<string, Message[]> = {
  'base-1': [
    { from: 'Mr. Anderson', text: "Good morning! I wanted to update you on Leo's progress. He has been very engaged this week.", time: '9:00 AM', me: false },
    { from: 'You', text: 'That is wonderful to hear. He has been studying hard at home too.', time: '9:20 AM', me: true },
    { from: 'Mr. Anderson', text: 'Regarding Leo, please keep checking the daily travel status from the dashboard.', time: '10:15 AM', me: false },
  ],
  'base-2': [
    { from: 'Principal Verma', text: 'Dear Parents, we are pleased to announce the Annual Sports Day scheduled for June 5th, 2026.', time: 'Yesterday 3:00 PM', me: false },
    { from: 'You', text: 'Thank you for the update. Both my children will participate.', time: 'Yesterday 4:00 PM', me: true },
  ],
};

function conversationTimeScore(time: string) {
  const normalized = time.trim().toLowerCase();
  if (normalized.includes('today')) return 20000;
  const timeMatch = normalized.match(/(\d{1,2}):(\d{2})\s*(am|pm)/);
  if (timeMatch) {
    let hour = Number(timeMatch[1]);
    const minute = Number(timeMatch[2]);
    const period = timeMatch[3];
    if (period === 'pm' && hour < 12) hour += 12;
    if (period === 'am' && hour === 12) hour = 0;
    return 10000 + hour * 60 + minute;
  }
  if (normalized.includes('yesterday')) return 1000;
  return 0;
}

export default function ParentMessagesPage() {
  const { parentChildren, actions } = useStudentTravelState();
  const absenceConversations = useMemo(() => parentChildren
    .filter(child => child.status === 'absent' || child.absenceReasonRequested || child.absenceReason)
    .map<Conversation>(child => ({
      id: `absence-${child.id}`,
      name: `${child.teacherName} - Absence Reason`,
      role: `${child.name} | ${child.className}-${child.section}`,
      time: child.absenceSmsSentAt || 'Today',
      unread: child.absenceReason ? 0 : 1,
      avatar: child.avatar,
      online: true,
      preview: child.absenceReason ? `Reason sent: ${child.absenceReason}` : `SMS received: please send reason for ${child.name}.`,
      studentId: child.id,
    })), [parentChildren]);
  const conversations = useMemo(
    () => [...absenceConversations, ...baseConversations].sort((a, b) => conversationTimeScore(b.time) - conversationTimeScore(a.time)),
    [absenceConversations]
  );
  const [active, setActive] = useState(conversations[0]?.id ?? 'base-1');
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const [newMsg, setNewMsg] = useState('');
  const activeConv = conversations.find(c => c.id === active) ?? conversations[0];
  const activeStudent = parentChildren.find(child => child.id === activeConv?.studentId);
  const unreadCount = conversations.reduce((sum, conversation) => sum + conversation.unread, 0);
  const groupCount = conversations.filter(conversation => conversation.role.toLowerCase().includes('administration') || conversation.role.toLowerCase().includes('safety')).length;

  const thread = useMemo<Message[]>(() => {
    if (activeStudent) {
      return [
        { from: activeStudent.teacherName, text: `${activeStudent.name} was marked absent today. An SMS has been sent to ${activeStudent.parentPhone}. Please reply with the absence reason in this app.`, time: activeStudent.absenceSmsSentAt || 'Today', me: false },
        ...(activeStudent.absenceReason ? [{ from: 'You', text: activeStudent.absenceReason, time: activeStudent.updatedAt, me: true }] : []),
      ];
    }
    return baseThreads[active] || [];
  }, [active, activeStudent]);

  function sendMessage() {
    if (!newMsg.trim()) return;
    if (activeStudent) {
      actions.submitAbsenceReason(activeStudent.id, newMsg);
    }
    setNewMsg('');
  }

  function openMobileConversation(id: string) {
    setActive(id);
    setMobileChatOpen(true);
  }

  return (
    <div className="flex overflow-hidden" style={{ height: 'calc(100vh - 64px)' }}>
      <aside className="w-80 border-r border-outline-variant/30 bg-surface-container-low flex-col shrink-0 hidden md:flex">
        <div className="p-3 border-b border-outline-variant/20">
          <div className="relative"><span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span><input className="w-full pl-9 pr-3 py-2 bg-white border border-outline-variant rounded-lg text-label-md focus:ring-2 focus:ring-primary focus:outline-none" placeholder="Search conversations..." /></div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map(c => (
            <button key={c.id} onClick={() => setActive(c.id)} className={`w-full flex items-start gap-3 px-4 py-3 border-b border-outline-variant/20 text-left transition-colors ${active === c.id ? 'bg-primary-container/30' : 'hover:bg-surface-container'}`}>
              <div className="relative shrink-0"><div className={`w-10 h-10 rounded-full flex items-center justify-center text-label-sm font-bold ${active === c.id ? 'bg-primary text-white' : 'bg-primary-container text-primary'}`}>{c.avatar}</div>{c.online && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>}</div>
              <div className="flex-1 min-w-0"><div className="flex items-center justify-between"><p className={`text-label-md truncate ${c.unread > 0 ? 'font-bold text-on-surface' : 'text-on-surface-variant'}`}>{c.name}</p><p className="text-label-sm text-on-surface-variant shrink-0 ml-2">{c.time}</p></div><p className="text-label-sm text-on-surface-variant truncate">{c.preview}</p></div>
              {c.unread > 0 && <span className="w-5 h-5 rounded-full bg-primary text-on-primary text-label-sm font-bold flex items-center justify-center shrink-0 mt-1">{c.unread}</span>}
            </button>
          ))}
        </div>
      </aside>
      <div className={`${mobileChatOpen ? 'hidden' : 'flex'} md:hidden flex-1 flex-col bg-background`}>
        <div className="px-3 py-2 bg-surface border-b border-outline-variant/30 overflow-x-auto">
          <div className="flex items-center gap-2 min-w-max">
            {[
              ['All', ''],
              ['Unread', String(unreadCount)],
              ['Favourites', ''],
              ['Groups', String(groupCount)],
            ].map(([label, count], index) => (
              <button key={label} className={`rounded-full border px-4 py-1.5 text-label-md whitespace-nowrap ${index === 0 ? 'bg-surface-container border-outline-variant text-on-surface' : 'bg-white border-outline-variant/70 text-on-surface-variant'}`}>
                {label}{count ? ` ${count}` : ''}
              </button>
            ))}
            <button className="h-9 w-9 rounded-full border border-outline-variant bg-white flex items-center justify-center text-on-surface-variant" aria-label="New message">
              <span className="material-symbols-outlined text-[20px]">add</span>
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto bg-background">
          {conversations.map(conversation => (
            <button
              key={conversation.id}
              type="button"
              onClick={() => openMobileConversation(conversation.id)}
              className="w-full px-4 py-3 flex items-start gap-3 text-left hover:bg-surface-container transition-colors"
            >
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-primary-container text-primary flex items-center justify-center text-label-md font-bold">
                  {conversation.avatar}
                </div>
                {conversation.online && <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white"></span>}
              </div>
              <div className="min-w-0 flex-1 border-b border-outline-variant/20 pb-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-body-lg font-medium text-on-surface truncate">{conversation.name}</p>
                  <p className={`text-label-sm shrink-0 ${conversation.unread > 0 ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>{conversation.time}</p>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <p className="text-label-md text-on-surface-variant truncate flex-1">{conversation.preview}</p>
                  <span className="material-symbols-outlined text-[18px] text-on-surface-variant">notifications_off</span>
                  {conversation.unread > 0 && <span className="w-5 h-5 rounded-full bg-secondary text-on-secondary text-label-sm font-bold flex items-center justify-center shrink-0">{conversation.unread}</span>}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
      <div className={`${mobileChatOpen ? 'flex' : 'hidden'} md:flex flex-1 flex-col bg-background min-w-0`}>
        <div className="px-4 py-3 bg-surface border-b border-outline-variant/30 flex items-center gap-3 shrink-0">
          <button type="button" onClick={() => setMobileChatOpen(false)} className="md:hidden -ml-2 h-9 w-9 flex items-center justify-center rounded-full hover:bg-surface-container" aria-label="Back to messages">
            <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
          </button>
          <div className="relative"><div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-label-sm">{activeConv?.avatar}</div>{activeConv?.online && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></span>}</div>
          <div><p className="font-label-md font-bold text-on-surface">{activeConv?.name}</p><p className="text-label-sm text-on-surface-variant">{activeConv?.role}</p></div>
        </div>
        {activeStudent && !activeStudent.absenceReason && (
          <div className="px-4 py-3 bg-error-container text-error border-b border-error/20 text-label-md font-bold">
            Absence reason required for {activeStudent.name}. Type the reason below and press send.
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {thread.map((m, i) => (
            <div key={`${m.time}-${i}`} className={`flex ${m.me ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-sm px-4 py-2.5 rounded-2xl text-body-md ${m.me ? 'bg-primary text-on-primary rounded-br-sm' : 'bg-white text-on-surface rounded-bl-sm shadow-sm border border-outline-variant/20'}`}>
                <p>{m.text}</p><p className={`text-label-sm mt-1 ${m.me ? 'text-on-primary/70' : 'text-on-surface-variant'}`}>{m.time}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="p-3 bg-surface border-t border-outline-variant/30 shrink-0">
          <div className="flex items-center gap-2 bg-surface-container rounded-xl px-3 py-2 border border-outline-variant">
            <input className="flex-1 bg-transparent border-none focus:ring-0 text-body-md placeholder:text-on-surface-variant outline-none" placeholder={activeStudent ? 'Type absence reason for teacher...' : 'Type a message to the school...'} value={newMsg} onChange={e => setNewMsg(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }} />
            <button className="text-on-surface-variant hover:text-primary p-1"><span className="material-symbols-outlined text-[20px]">attach_file</span></button>
            <button onClick={sendMessage} className={`p-1.5 rounded-full transition-colors ${newMsg.trim() ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'}`}><span className="material-symbols-outlined text-[20px]">send</span></button>
          </div>
        </div>
      </div>
    </div>
  );
}
