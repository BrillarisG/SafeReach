'use client';

import { useMemo, useState } from 'react';
import { useStudentTravelState } from '@/lib/studentTravel';

type ConversationGroup = 'all' | 'admin' | 'teacher' | 'student' | 'direct';
type Conversation = { id: string; name: string; sub: string; time: string; unread: number; avatar: string; studentId?: string; group: ConversationGroup };
type Message = { from: string; text: string; time: string; me: boolean };

const baseConversations: Conversation[] = [
  { id: 'base-1', name: 'Rajesh Shah (Parent)', sub: "Re: Aryan's performance this term", time: '10:32 AM', unread: 2, avatar: 'RS', group: 'direct' },
  { id: 'base-2', name: 'Admin - Principal Verma', sub: 'Upcoming staff meeting agenda', time: 'Yesterday', unread: 0, avatar: 'PV', group: 'admin' },
  { id: 'base-3', name: 'Sunita Nair (Parent)', sub: 'Priya was absent on Monday...', time: 'Yesterday', unread: 1, avatar: 'SN', group: 'direct' },
  { id: 'base-4', name: 'Mr. David Lee', sub: 'Can we swap supervision slots?', time: 'May 26', unread: 0, avatar: 'DL', group: 'teacher' },
  { id: 'base-5', name: 'Counselor Deepa', sub: 'Student referral - Lavanya P.', time: 'May 25', unread: 0, avatar: 'CD', group: 'teacher' },
];

const baseThreads: Record<string, Message[]> = {
  'base-1': [
    { from: 'Rajesh Shah', text: "Good morning, I wanted to discuss Aryan's recent test performance.", time: '9:00 AM', me: false },
    { from: 'You', text: "Good morning, Mr. Shah. Aryan scored 68% on the last test. He's been a bit distracted.", time: '9:15 AM', me: true },
    { from: 'Rajesh Shah', text: 'I see. Is there anything specific we can do at home to help?', time: '9:30 AM', me: false },
  ],
  'base-2': [
    { from: 'Principal Verma', text: 'Staff meeting scheduled for Friday 3 PM in the Conference Room.', time: 'Yesterday 2:00 PM', me: false },
    { from: 'You', text: 'Noted. I will attend. Should we prepare a class-wise attendance summary?', time: 'Yesterday 2:30 PM', me: true },
  ],
  'group-admin': [
    { from: 'Principal Verma', text: 'This admin group includes school admin and all teachers for common school announcements.', time: 'Today 8:30 AM', me: false },
    { from: 'You', text: 'Noted. I will share class attendance and safety updates here when needed.', time: 'Today 8:34 AM', me: true },
  ],
  'group-teacher': [
    { from: 'Mr. David Lee', text: 'Teacher-only coordination group is ready for staff updates without admin announcements.', time: 'Today 9:10 AM', me: false },
    { from: 'You', text: 'I will use this for duty swaps, class coordination, and student support notes.', time: 'Today 9:12 AM', me: true },
  ],
  'group-student': [
    { from: 'System', text: 'Student group contains only students from your assigned Class 4-B incharge section.', time: 'Today', me: false },
  ],
};

const groups: { id: ConversationGroup; label: string; icon: string }[] = [
  { id: 'all', label: 'All', icon: 'chat' },
  { id: 'admin', label: 'Admin Group', icon: 'admin_panel_settings' },
  { id: 'teacher', label: 'Teacher Group', icon: 'groups' },
  { id: 'student', label: 'Student Group', icon: 'school' },
  { id: 'direct', label: 'Direct Chat', icon: 'person' },
];

function conversationTimeScore(time: string) {
  const normalized = time.trim().toLowerCase();
  if (normalized === 'live' || normalized.includes('today')) return 20000;
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

export default function TeacherMessagesPage() {
  const { classStudents } = useStudentTravelState();
  const [selectedGroup, setSelectedGroup] = useState<ConversationGroup>('all');
  const [directRecipient, setDirectRecipient] = useState('base-1');
  const [sentNotice, setSentNotice] = useState('');
  const absenceConversations = useMemo(() => classStudents
    .filter(student => student.status === 'absent' || student.absenceReasonRequested || student.absenceReason)
    .map<Conversation>(student => ({
      id: `absence-${student.id}`,
      name: `${student.parentName} - Absence Reason`,
      sub: student.absenceReason ? `${student.name}: ${student.absenceReason}` : `${student.name}: reason pending`,
      time: student.updatedAt,
      unread: student.absenceReason ? 1 : 0,
      avatar: student.avatar,
      studentId: student.id,
      group: 'student',
    })), [classStudents]);
  const studentGroupConversations = useMemo<Conversation[]>(() => [
    {
      id: 'group-student',
      name: 'Class 4-B Student Group',
      sub: `${classStudents.length} incharge-class students included`,
      time: 'Live',
      unread: 0,
      avatar: '4B',
      group: 'student',
    },
    ...classStudents.map(student => ({
      id: `student-${student.id}`,
      name: `${student.name} - Direct Student/Parent`,
      sub: `${student.parentName} | ${student.parentPhone}`,
      time: student.updatedAt,
      unread: student.absenceReason ? 1 : 0,
      avatar: student.avatar,
      studentId: student.id,
      group: 'student' as const,
    })),
  ], [classStudents]);
  const groupConversations: Conversation[] = [
    { id: 'group-admin', name: 'Admin + All Teachers', sub: 'Common group with school admin and every teacher', time: 'Live', unread: 1, avatar: 'AD', group: 'admin' },
    { id: 'group-teacher', name: 'All Teachers', sub: 'Teacher-only group without admin users', time: 'Live', unread: 0, avatar: 'TG', group: 'teacher' },
  ];
  const conversations = [...groupConversations, ...studentGroupConversations, ...absenceConversations, ...baseConversations];
  const filteredConversations = conversations
    .filter(conversation => selectedGroup === 'all' || conversation.group === selectedGroup)
    .sort((a, b) => conversationTimeScore(b.time) - conversationTimeScore(a.time));
  const [active, setActive] = useState('group-admin');
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const [newMsg, setNewMsg] = useState('');
  const [sentThreads, setSentThreads] = useState<Record<string, Message[]>>({});
  const activeConv = filteredConversations.find(c => c.id === active) ?? filteredConversations[0] ?? conversations[0];
  const activeStudent = classStudents.find(student => student.id === activeConv?.studentId);
  const showSenderName = Boolean(activeConv?.id?.startsWith('group-'));

  const thread = useMemo<Message[]>(() => {
    const extra = sentThreads[activeConv?.id ?? active] ?? [];
    if (activeStudent) {
      return [
        { from: 'You', text: `${activeStudent.name} marked absent. SMS/reason request sent to ${activeStudent.parentName}.`, time: activeStudent.absenceSmsSentAt || 'Today', me: true },
        activeStudent.absenceReason
          ? { from: activeStudent.parentName, text: activeStudent.absenceReason, time: activeStudent.updatedAt, me: false }
          : { from: 'System', text: 'Parent reason is still pending in the app.', time: activeStudent.updatedAt, me: false },
        ...extra,
      ];
    }
    return [...(baseThreads[activeConv?.id ?? active] || []), ...extra];
  }, [active, activeConv?.id, activeStudent, sentThreads]);

  function changeGroup(group: ConversationGroup) {
    setSelectedGroup(group);
    const firstInGroup = [...conversations]
      .sort((a, b) => conversationTimeScore(b.time) - conversationTimeScore(a.time))
      .find(conversation => group === 'all' || conversation.group === group);
    if (group === 'direct') {
      setActive(directRecipient);
    } else {
      setActive(firstInGroup?.id ?? '');
    }
    setSentNotice('');
  }

  function sendMessage() {
    if (!newMsg.trim() || !activeConv) return;
    const message: Message = {
      from: 'You',
      text: newMsg.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      me: true,
    };
    setSentThreads(current => ({
      ...current,
      [activeConv.id]: [...(current[activeConv.id] ?? []), message],
    }));
    setSentNotice(`Message added for ${activeConv.name}.`);
    setNewMsg('');
  }

  function openMobileConversation(id: string) {
    setActive(id);
    setMobileChatOpen(true);
    setSentNotice('');
  }

  return (
    <div className="flex h-[calc(100dvh-4rem)] w-full min-w-0 max-w-full min-h-0 overflow-hidden">
      <aside className="w-80 border-r border-outline-variant/30 bg-surface-container-low flex-col shrink-0 hidden md:flex">
        <div className="order-2 border-b border-outline-variant/20 p-3 overflow-x-auto admin-message-category-scroll">
          <div className="flex min-w-max items-center gap-1.5">
            {groups.map(group => {
              const unread = conversations.filter(conversation => (group.id === 'all' || conversation.group === group.id) && conversation.unread > 0).reduce((total, conversation) => total + conversation.unread, 0);
              return (
                <button
                  key={group.id}
                  onClick={() => changeGroup(group.id)}
                  className={`rounded-full border px-3 py-1.5 text-label-sm font-bold whitespace-nowrap ${selectedGroup === group.id ? 'border-primary bg-primary text-on-primary' : 'border-outline-variant/70 bg-white text-on-surface-variant hover:bg-surface-container'}`}
                >
                  <span>{group.label}</span>
                  {unread > 0 && <span className={`ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full border px-1 text-[10px] font-bold ${selectedGroup === group.id ? 'border-white/70 text-on-primary' : 'border-primary/40 text-primary'}`}>{unread}</span>}
                </button>
              );
            })}
          </div>
        </div>
        <div className="order-1 p-3 border-b border-outline-variant/20">
          <div className="relative"><span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span><input className="w-full pl-9 pr-3 py-2 bg-white border border-outline-variant rounded-lg text-label-md focus:ring-2 focus:ring-primary focus:outline-none" placeholder="Search messages..." /></div>
          {selectedGroup === 'direct' && (
            <select
              value={directRecipient}
              onChange={event => {
                setDirectRecipient(event.target.value);
                setActive(event.target.value);
                setSentNotice('');
              }}
              className="mt-2 w-full px-3 py-2 bg-white border border-outline-variant rounded-lg text-label-md"
            >
              {conversations.filter(conversation => conversation.group === 'direct').map(conversation => (
                <option key={conversation.id} value={conversation.id}>{conversation.name}</option>
              ))}
            </select>
          )}
        </div>
        <div className="order-3 flex-1 overflow-y-auto">
          {filteredConversations.map(c => (
            <button key={c.id} onClick={() => setActive(c.id)} className={`w-full flex items-center gap-3 px-4 py-3 border-b border-outline-variant/20 text-left transition-colors ${active === c.id ? 'bg-primary-container/30' : 'hover:bg-surface-container'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-label-sm font-bold shrink-0 ${active === c.id ? 'bg-primary text-white' : 'bg-primary-container text-primary'}`}>{c.avatar}</div>
              <div className="flex-1 min-w-0"><div className="flex items-center justify-between"><p className={`text-label-md truncate ${c.unread > 0 ? 'font-bold text-on-surface' : 'text-on-surface-variant'}`}>{c.name}</p><p className="text-label-sm text-on-surface-variant shrink-0 ml-2">{c.time}</p></div><p className="text-label-sm text-on-surface-variant truncate">{c.sub}</p></div>
              {c.unread > 0 && <span className="w-5 h-5 rounded-full border border-primary/40 text-primary text-label-sm font-bold flex items-center justify-center shrink-0">{c.unread}</span>}
            </button>
          ))}
        </div>
      </aside>
      <div className={`${mobileChatOpen ? 'hidden' : 'flex'} md:hidden w-full min-w-0 flex-1 flex-col bg-background`}>
        <div className="px-2 py-2 bg-surface border-b border-outline-variant/30 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 min-w-max">
            {groups.map(group => {
              const unread = conversations.filter(conversation => (group.id === 'all' || conversation.group === group.id) && conversation.unread > 0).reduce((total, conversation) => total + conversation.unread, 0);
              return (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => changeGroup(group.id)}
                  className={`max-w-[96px] truncate rounded-full border px-2.5 py-1.5 text-[12px] leading-none whitespace-nowrap ${selectedGroup === group.id ? 'bg-primary text-on-primary border-primary' : 'bg-white border-outline-variant/70 text-on-surface-variant'}`}
                  title={group.label}
                >
                  <span>{group.label}</span>
                  {unread > 0 && <span className={`ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full border px-1 text-[10px] font-bold ${selectedGroup === group.id ? 'border-white/70 text-on-primary' : 'border-primary/40 text-primary'}`}>{unread}</span>}
                </button>
              );
            })}
            <button className="h-8 w-8 rounded-full border border-outline-variant bg-white flex items-center justify-center text-on-surface-variant shrink-0" aria-label="New message">
              <span className="material-symbols-outlined text-[18px]">add</span>
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto bg-background">
          {filteredConversations.map(conversation => (
            <button
              key={conversation.id}
              type="button"
              onClick={() => openMobileConversation(conversation.id)}
              className="w-full px-4 py-3 flex items-start gap-3 text-left hover:bg-surface-container transition-colors"
            >
              <div className="w-12 h-12 rounded-full overflow-hidden bg-primary-container text-primary flex items-center justify-center text-label-md font-bold shrink-0">
                {conversation.avatar}
              </div>
              <div className="min-w-0 flex-1 border-b border-outline-variant/20 pb-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[15px] leading-5 font-medium text-on-surface truncate">{conversation.name}</p>
                  <p className={`text-label-sm shrink-0 ${conversation.unread > 0 ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>{conversation.time}</p>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <p className="text-[13px] leading-5 text-on-surface-variant truncate flex-1">{conversation.sub}</p>
                  <span className="material-symbols-outlined text-[18px] text-on-surface-variant">notifications_off</span>
                  {conversation.unread > 0 && <span className="w-5 h-5 rounded-full border border-primary/40 text-primary text-label-sm font-bold flex items-center justify-center shrink-0">{conversation.unread}</span>}
                </div>
              </div>
            </button>
          ))}
          {filteredConversations.length === 0 && (
            <div className="p-6 text-center text-label-md text-on-surface-variant">No conversations in this group.</div>
          )}
        </div>
      </div>
      <div className={`${mobileChatOpen ? 'flex' : 'hidden'} md:flex w-full min-w-0 min-h-0 flex-1 flex-col bg-background`}>
        <div className="px-4 py-3 bg-surface border-b border-outline-variant/30 flex items-center gap-3 shrink-0">
          <button type="button" onClick={() => setMobileChatOpen(false)} className="md:hidden -ml-2 h-9 w-9 flex items-center justify-center rounded-full hover:bg-surface-container" aria-label="Back to messages">
            <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
          </button>
          <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-label-sm">{activeConv?.avatar}</div>
          <p className="font-label-md font-bold text-on-surface">{activeConv?.name}</p>
        </div>
        {activeStudent && (
          <div className="px-4 py-3 bg-surface-container-low border-b border-outline-variant/30 text-label-md">
            <span className="font-bold text-primary">{activeStudent.name}</span> status: {activeStudent.absenceReason ? 'Reason received' : 'Waiting for parent reason'}
          </div>
        )}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 pb-28 md:pb-4 space-y-3">
          {thread.map((m, i) => (
            <div key={`${m.time}-${i}`} className={`flex ${m.me ? 'justify-end' : 'justify-start'}`}>
              <div className={`chat-bubble max-w-sm px-4 py-2.5 rounded-2xl text-body-md ${m.me ? 'chat-bubble-sent bg-white text-on-surface rounded-br-sm shadow-sm border border-outline-variant/20' : 'chat-bubble-received bg-primary text-on-primary rounded-bl-sm border border-primary'}`}>
                <p>{m.text}</p><p className={`mt-2 text-[11px] ${m.me ? 'text-on-surface-variant' : 'text-on-primary/80'}`}>{showSenderName ? `${m.from} | ${m.time}` : m.time}</p>
              </div>
            </div>
          ))}
          {thread.length === 0 && (
            <div className="rounded-xl border border-dashed border-outline-variant bg-white p-5 text-center text-on-surface-variant">
              No messages yet. Type below to prepare a frontend demo message for this group or direct contact.
            </div>
          )}
        </div>
        <div className="fixed bottom-3 left-0 right-0 z-40 border-t border-outline-variant/30 bg-surface p-3 pb-4 md:static md:z-auto md:pb-3">
          {sentNotice && <p className="mb-2 text-label-md font-bold text-primary">{sentNotice}</p>}
          <div className="flex items-center gap-2 bg-surface-container rounded-xl px-3 py-2 border border-outline-variant">
            <input className="flex-1 bg-transparent border-none focus:ring-0 text-body-md placeholder:text-on-surface-variant outline-none" placeholder={activeStudent ? 'Type a message about this student...' : 'Type a message...'} value={newMsg} onChange={e => setNewMsg(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }} />
            <button className="text-on-surface-variant hover:text-primary transition-colors p-1"><span className="material-symbols-outlined text-[20px]">attach_file</span></button>
            <button onClick={sendMessage} className={`p-1.5 rounded-full transition-colors ${newMsg.trim() ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'}`}><span className="material-symbols-outlined text-[20px]">send</span></button>
          </div>
        </div>
      </div>
    </div>
  );
}
