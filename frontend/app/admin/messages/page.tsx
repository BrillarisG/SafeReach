'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from '@/src/next-navigation';

type MessageGroup = 'all' | 'common' | 'teacher' | 'parent';

type Conversation = {
  id: string;
  group: MessageGroup;
  name: string;
  sub: string;
  avatar: string;
  unread: number;
  time: string;
};

type Message = {
  from: string;
  text: string;
  time: string;
  me: boolean;
};

const conversations: Conversation[] = [
  { id: 'common-admin-teachers', group: 'common', name: 'Admin + All Teachers', sub: 'School admin common group with all teachers', avatar: 'AT', unread: 3, time: 'Live' },
  { id: 'teacher-james', group: 'teacher', name: 'Mr. James Anderson', sub: 'Senior Mathematics Teacher', avatar: 'JA', unread: 0, time: '10:20 AM' },
  { id: 'teacher-elena', group: 'teacher', name: 'Elena Smith', sub: 'Class 4-A Incharge', avatar: 'ES', unread: 1, time: '09:45 AM' },
  { id: 'teacher-julian', group: 'teacher', name: 'Julian Thorne', sub: 'Transport and route duty', avatar: 'JT', unread: 0, time: '09:30 AM' },
  { id: 'teacher-clara', group: 'teacher', name: 'Clara White', sub: 'Grade 2 Aurora teacher', avatar: 'CW', unread: 0, time: '08:55 AM' },
  { id: 'teacher-david', group: 'teacher', name: 'David Ng', sub: 'Class 4-B Incharge', avatar: 'DN', unread: 0, time: 'Yesterday' },
  { id: 'parent-sarah', group: 'parent', name: 'Sarah Thompson', sub: 'Parent of Leo and Maya Thompson', avatar: 'ST', unread: 2, time: '11:05 AM' },
  { id: 'parent-nisha', group: 'parent', name: 'Nisha Sharma', sub: 'Parent of Aarav Sharma', avatar: 'NS', unread: 0, time: 'Yesterday' },
  { id: 'parent-sunita', group: 'parent', name: 'Sunita Nair', sub: 'Parent of Priya Nair', avatar: 'SN', unread: 1, time: 'Jun 13' },
];

const threads: Record<string, Message[]> = {
  'common-admin-teachers': [
    { from: 'Admin Priya', text: 'This common group includes school admin and every teacher for urgent announcements and school coordination.', time: 'Today 08:30 AM', me: true },
    { from: 'Mr. James Anderson', text: 'Acknowledged. Class attendance will be submitted before 9:15 AM.', time: 'Today 08:35 AM', me: false },
  ],
  'teacher-james': [
    { from: 'Admin Priya', text: 'Please review the Class 10A attendance exception before lunch.', time: '10:10 AM', me: true },
    { from: 'Mr. James Anderson', text: 'I will check and update the record.', time: '10:20 AM', me: false },
  ],
  'teacher-elena': [
    { from: 'Admin Priya', text: 'Please confirm the Grade 4-A section readiness for today.', time: '09:40 AM', me: true },
    { from: 'Elena Smith', text: 'Confirmed. The section status is updated.', time: '09:45 AM', me: false },
  ],
  'teacher-julian': [
    { from: 'Admin Priya', text: 'Please keep route duty updates in this direct thread.', time: '09:25 AM', me: true },
  ],
  'teacher-clara': [
    { from: 'Admin Priya', text: 'Your leave status is recorded. Please share backup handover notes here.', time: '08:50 AM', me: true },
  ],
  'teacher-david': [
    { from: 'Admin Priya', text: 'Class 4-B assistant incharge update is ready for review.', time: 'Yesterday 04:20 PM', me: true },
  ],
  'parent-sarah': [
    { from: 'Sarah Thompson', text: 'Leo reached home safely. Thank you for the SMS update.', time: '11:05 AM', me: false },
  ],
};

const groupTabs: { id: MessageGroup; label: string; icon: string; helper: string }[] = [
  { id: 'all', label: 'All Messages', icon: 'chat', helper: 'All recent conversations' },
  { id: 'common', label: 'Admin Common Group', icon: 'campaign', helper: 'Admin and all teachers included' },
  { id: 'teacher', label: 'Direct Teachers', icon: 'badge', helper: 'Admin can chat with any teacher' },
  { id: 'parent', label: 'Direct Parents', icon: 'family_restroom', helper: 'Admin can chat with parent contacts' },
];

function conversationTimeScore(time: string) {
  const normalized = time.trim().toLowerCase();
  if (normalized === 'live' || normalized === 'new' || normalized.includes('today')) return 20000;
  const timeMatch = normalized.match(/(\d{1,2}):(\d{2})\s*(am|pm)/);
  if (timeMatch) {
    let hour = Number(timeMatch[1]);
    const minute = Number(timeMatch[2]);
    if (timeMatch[3] === 'pm' && hour < 12) hour += 12;
    if (timeMatch[3] === 'am' && hour === 12) hour = 0;
    return 10000 + hour * 60 + minute;
  }
  if (normalized.includes('yesterday')) return 1000;
  return 0;
}

function AdminMessagesContent() {
  const searchParams = useSearchParams();
  const requestedChat = searchParams?.get('chat');
  const requestedName = searchParams?.get('name');
  const requestedRole = searchParams?.get('role');
  const dynamicConversation = useMemo<Conversation | undefined>(() => {
    if (!requestedChat?.startsWith('teacher-') || !requestedName || conversations.some(conversation => conversation.id === requestedChat)) return undefined;
    const initials = requestedName.split(' ').slice(0, 2).map(part => part[0]).join('').toUpperCase();
    return {
      id: requestedChat,
      group: 'teacher',
      name: requestedName,
      sub: requestedRole || 'Teacher direct chat',
      avatar: initials || 'TC',
      unread: 0,
      time: 'New',
    };
  }, [requestedChat, requestedName, requestedRole]);
  const availableConversations = useMemo(() => dynamicConversation ? [...conversations, dynamicConversation] : conversations, [dynamicConversation]);
  const requestedConversation = availableConversations.find(conversation => conversation.id === requestedChat);
  const [activeGroup, setActiveGroup] = useState<MessageGroup>(requestedConversation?.group ?? 'all');
  const [activeId, setActiveId] = useState(requestedConversation?.id ?? 'common-admin-teachers');
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState('');
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const [notice, setNotice] = useState('Admin messaging is a frontend demo. Backend delivery will be added later.');

  useEffect(() => {
    const conversation = availableConversations.find(item => item.id === requestedChat);
    if (!conversation) return;
    setActiveGroup(conversation.group);
    setActiveId(conversation.id);
    setSearch('');
    setNotice(`Direct chat opened for ${conversation.name}.`);
  }, [availableConversations, requestedChat]);

  const visibleConversations = useMemo(() => availableConversations.filter(conversation => {
    const inGroup = activeGroup === 'all' || conversation.group === activeGroup;
    const match = `${conversation.name} ${conversation.sub}`.toLowerCase().includes(search.toLowerCase());
    return inGroup && match;
  }).sort((a, b) => conversationTimeScore(b.time) - conversationTimeScore(a.time)), [activeGroup, availableConversations, search]);

  const activeConversation = visibleConversations.find(conversation => conversation.id === activeId) ?? visibleConversations[0] ?? availableConversations[0];
  const activeThread = threads[activeConversation.id] ?? [];

  function changeGroup(group: MessageGroup) {
    const first = [...availableConversations]
      .sort((a, b) => conversationTimeScore(b.time) - conversationTimeScore(a.time))
      .find(conversation => group === 'all' || conversation.group === group);
    setActiveGroup(group);
    setActiveId(first?.id ?? '');
    setSearch('');
    setMobileChatOpen(false);
    setNotice(groupTabs.find(tab => tab.id === group)?.helper ?? '');
  }

  function sendMessage() {
    if (!draft.trim()) return;
    setNotice(`Message prepared for ${activeConversation.name}: "${draft.trim()}"`);
    setDraft('');
  }

  return (
    <div className="p-container-padding-mobile md:p-container-padding-desktop min-w-0 max-w-full overflow-x-hidden">
      <div className="mb-stack-lg"><h1 className="font-headline-lg text-headline-lg text-primary">Admin Message</h1></div>

      <div className={`${mobileChatOpen ? 'hidden' : 'flex'} md:hidden min-h-[calc(100dvh-8rem)] flex-col bg-background -mx-4 -mb-4`}>
        <div className="px-2 py-2 bg-surface border-y border-outline-variant/30 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 min-w-max">
            {groupTabs.map(tab => {
              const unread = availableConversations.filter(conversation => (tab.id === 'all' || conversation.group === tab.id) && conversation.unread > 0).reduce((total, conversation) => total + conversation.unread, 0);
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => changeGroup(tab.id)}
                  title={tab.label}
                  className={`max-w-[104px] truncate rounded-full border px-3 py-1.5 text-[12px] leading-none whitespace-nowrap ${activeGroup === tab.id ? 'border-primary bg-primary text-on-primary' : 'border-outline-variant/70 bg-white text-on-surface-variant'}`}
                >
                  {tab.label}{unread > 0 && <span className={`ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] ${activeGroup === tab.id ? 'bg-white/20 text-on-primary' : 'bg-primary-container text-primary'}`}>{unread}</span>}
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {visibleConversations.map(conversation => (
            <button
              key={conversation.id}
              type="button"
              onClick={() => { setActiveId(conversation.id); setMobileChatOpen(true); }}
              className="w-full px-4 py-3 flex items-start gap-3 text-left hover:bg-surface-container"
            >
              <span className="w-12 h-12 shrink-0 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-label-md">{conversation.avatar}</span>
              <span className="min-w-0 flex-1 border-b border-outline-variant/20 pb-3">
                <span className="flex items-start justify-between gap-2"><span className="font-medium text-on-surface truncate">{conversation.name}</span><span className="shrink-0 text-label-sm text-primary">{conversation.time}</span></span>
                <span className="mt-1 flex items-center gap-2"><span className="flex-1 text-[13px] leading-5 text-on-surface-variant truncate">{conversation.sub}</span><span className="material-symbols-outlined text-[18px] text-on-surface-variant">notifications_off</span>{conversation.unread > 0 && <span className="w-5 h-5 shrink-0 rounded-full bg-secondary text-on-secondary text-label-sm font-bold flex items-center justify-center">{conversation.unread}</span>}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className={`${mobileChatOpen ? 'flex' : 'hidden'} md:hidden min-h-[calc(100dvh-8rem)] flex-col bg-background -mx-4 -mb-4`}>
        <header className="px-4 py-3 bg-surface border-y border-outline-variant/30 flex items-center gap-3 shrink-0">
          <button type="button" onClick={() => setMobileChatOpen(false)} className="-ml-2 h-9 w-9 flex items-center justify-center rounded-full hover:bg-surface-container" aria-label="Back to messages"><span className="material-symbols-outlined">arrow_back</span></button>
          <span className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-label-sm">{activeConversation.avatar}</span>
          <span><span className="block font-bold text-on-surface">{activeConversation.name}</span><span className="block text-label-sm text-secondary">{activeConversation.sub}</span></span>
        </header>
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
          {activeThread.map((message, index) => <div key={`${message.time}-${index}`} className={`flex ${message.me ? 'justify-end' : 'justify-start'}`}><div className={`max-w-sm px-4 py-2.5 rounded-2xl text-body-md ${message.me ? 'bg-primary text-on-primary rounded-br-sm' : 'bg-white text-on-surface rounded-bl-sm shadow-sm border border-outline-variant/20'}`}><p>{message.text}</p><p className={`mt-1 text-label-sm ${message.me ? 'text-on-primary/70' : 'text-on-surface-variant'}`}>{message.from} | {message.time}</p></div></div>)}
        </div>
        <footer className="p-3 bg-surface border-t border-outline-variant/30 shrink-0"><div className="flex items-center gap-2 bg-surface-container rounded-xl px-3 py-2 border border-outline-variant"><input value={draft} onChange={event => setDraft(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') sendMessage(); }} className="flex-1 bg-transparent outline-none text-body-md" placeholder="Type a message..." /><button type="button" onClick={sendMessage} className={`p-1.5 rounded-full ${draft.trim() ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'}`}><span className="material-symbols-outlined text-[20px]">send</span></button></div></footer>
      </div>

      <div className="hidden min-w-0 grid-cols-1 gap-5 md:grid md:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="min-w-0 bg-white rounded-xl border border-outline-variant/50 shadow-sm overflow-hidden flex flex-col">
          <div className="order-2 p-3 border-b border-outline-variant/30 overflow-x-auto no-scrollbar">
            <div className="flex min-w-max gap-2" role="tablist" aria-label="Message categories">
            {groupTabs.map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => changeGroup(tab.id)}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-left text-label-sm font-bold transition-all ${activeGroup === tab.id ? 'border-primary bg-primary text-on-primary' : 'border-outline-variant bg-white text-on-surface-variant hover:bg-surface-container'}`}
              >
                <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
            </div>
          </div>
          <div className="order-1 p-3 border-b border-outline-variant/30">
            <label className="relative block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
              <input
                value={search}
                onChange={event => setSearch(event.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-surface-container border border-outline-variant rounded-lg text-label-md focus:ring-2 focus:ring-primary focus:outline-none"
                placeholder="Search contacts..."
              />
            </label>
          </div>
          <div className="order-3 max-h-[56vh] overflow-x-hidden overflow-y-auto no-scrollbar">
            {visibleConversations.map(conversation => (
              <button
                key={conversation.id}
                type="button"
                onClick={() => setActiveId(conversation.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 border-b border-outline-variant/20 text-left ${activeConversation.id === conversation.id ? 'bg-primary-container/35' : 'hover:bg-surface-container-low'}`}
              >
                <span className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-label-sm shrink-0">{conversation.avatar}</span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-bold text-on-surface truncate">{conversation.name}</span>
                    <span className="text-label-sm text-on-surface-variant shrink-0">{conversation.time}</span>
                  </span>
                  <span className="block text-label-sm text-on-surface-variant truncate">{conversation.sub}</span>
                </span>
                {conversation.unread > 0 && <span className="w-5 h-5 rounded-full bg-primary text-on-primary text-label-sm font-bold flex items-center justify-center">{conversation.unread}</span>}
              </button>
            ))}
          </div>
        </aside>

        <section className="min-w-0 bg-white rounded-xl border border-outline-variant/50 shadow-sm overflow-hidden min-h-[620px] flex flex-col">
          <header className="p-4 border-b border-outline-variant/30 flex items-center gap-3">
            <span className="w-11 h-11 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold">{activeConversation.avatar}</span>
            <div>
              <h2 className="font-bold text-primary">{activeConversation.name}</h2>
              <p className="text-label-md text-on-surface-variant">{activeConversation.sub}</p>
            </div>
          </header>
          <div className="p-4 bg-primary/5 border-b border-primary/15 text-label-md text-primary font-bold">{notice}</div>
          <div className="flex-1 p-4 space-y-3 overflow-y-auto bg-background">
            {activeThread.map((message, index) => (
              <div key={`${message.time}-${index}`} className={`flex ${message.me ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-md px-4 py-2.5 rounded-2xl ${message.me ? 'bg-primary text-on-primary rounded-br-sm' : 'bg-white border border-outline-variant/30 text-on-surface rounded-bl-sm shadow-sm'}`}>
                  <p>{message.text}</p>
                  <p className={`text-label-sm mt-1 ${message.me ? 'text-on-primary/70' : 'text-on-surface-variant'}`}>{message.from} | {message.time}</p>
                </div>
              </div>
            ))}
            {activeThread.length === 0 && (
              <div className="rounded-xl border border-dashed border-outline-variant bg-white p-5 text-center text-on-surface-variant">No messages yet. Send a frontend demo message below.</div>
            )}
          </div>
          <footer className="p-3 border-t border-outline-variant/30">
            <div className="flex items-center gap-2 bg-surface-container rounded-xl px-3 py-2 border border-outline-variant">
              <input value={draft} onChange={event => setDraft(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') sendMessage(); }} className="flex-1 bg-transparent outline-none text-body-md" placeholder={`Message ${activeConversation.name}...`} />
              <button type="button" onClick={sendMessage} className={`p-2 rounded-full ${draft.trim() ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'}`}>
                <span className="material-symbols-outlined text-[20px]">send</span>
              </button>
            </div>
          </footer>
        </section>
      </div>
    </div>
  );
}

export default function AdminMessagesPage() {
  return (
    <Suspense fallback={<div className="p-container-padding-mobile md:p-container-padding-desktop text-primary font-bold">Loading admin messages...</div>}>
      <AdminMessagesContent />
    </Suspense>
  );
}

