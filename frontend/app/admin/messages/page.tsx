'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from '@/src/next-navigation';
import LoadingRing from '@/components/LoadingRing';

type MessageGroup = 'all' | 'common' | 'teacher' | 'parent';

type Conversation = {
  id: string;
  group: MessageGroup;
  name: string;
  sub: string;
  avatar: string;
  online?: boolean;
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
  { id: 'common-admin-teachers', group: 'common', name: 'Admin + All Teachers', sub: 'School admin common group with all teachers', avatar: 'AT', online: true, unread: 3, time: 'Live' },
  { id: 'teacher-james', group: 'teacher', name: 'Mr. James Anderson', sub: 'Senior Mathematics Teacher', avatar: 'JA', online: true, unread: 0, time: '10:20 AM' },
  { id: 'teacher-elena', group: 'teacher', name: 'Elena Smith', sub: 'Class 4-A Incharge', avatar: 'ES', online: true, unread: 1, time: '09:45 AM' },
  { id: 'teacher-julian', group: 'teacher', name: 'Julian Thorne', sub: 'Transport and route duty', avatar: 'JT', online: true, unread: 0, time: '09:30 AM' },
  { id: 'teacher-clara', group: 'teacher', name: 'Clara White', sub: 'Grade 2 Aurora teacher', avatar: 'CW', unread: 0, time: '08:55 AM' },
  { id: 'teacher-david', group: 'teacher', name: 'David Ng', sub: 'Class 4-B Incharge', avatar: 'DN', unread: 0, time: 'Yesterday' },
  { id: 'parent-sarah', group: 'parent', name: 'Sarah Thompson', sub: 'Parent of Leo and Maya Thompson', avatar: 'ST', online: true, unread: 2, time: '11:05 AM' },
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
  { id: 'all', label: 'All', icon: 'chat', helper: 'All recent conversations' },
  { id: 'common', label: 'Admin', icon: 'campaign', helper: 'Admin and all teachers included' },
  { id: 'teacher', label: 'Teacher', icon: 'badge', helper: 'Admin can chat with any teacher' },
  { id: 'parent', label: 'Parent', icon: 'family_restroom', helper: 'Admin can chat with parent contacts' },
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
    if (!requestedChat || !requestedName || conversations.some(conversation => conversation.id === requestedChat)) return undefined;
    const group: MessageGroup = requestedChat.startsWith('teacher-') ? 'teacher' : requestedChat.startsWith('parent-') || requestedChat.startsWith('guardian-') ? 'parent' : 'parent';
    const initials = requestedName.split(' ').slice(0, 2).map(part => part[0]).join('').toUpperCase();
    return {
      id: requestedChat,
      group,
      name: requestedName,
      sub: requestedRole || (group === 'teacher' ? 'Teacher direct chat' : 'Parent direct chat'),
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
  const [sentThreads, setSentThreads] = useState<Record<string, Message[]>>({});
  const [recentActivity, setRecentActivity] = useState<Record<string, number>>({});
  const [readConversationIds, setReadConversationIds] = useState<Record<string, true>>({});
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const [notice, setNotice] = useState('Admin messaging is a frontend demo. Backend delivery will be added later.');

  useEffect(() => {
    const conversation = availableConversations.find(item => item.id === requestedChat);
    if (!conversation) return;
    setActiveGroup(conversation.group);
    selectConversation(conversation.id);
    setSearch('');
    setMobileChatOpen(true);
    setNotice(`Direct chat opened for ${conversation.name}.`);
  }, [availableConversations, requestedChat]);

  const conversationScore = (conversation: Conversation) => recentActivity[conversation.id] ?? conversationTimeScore(conversation.time);
  const visibleConversations = useMemo(() => availableConversations.filter(conversation => {
    const inGroup = activeGroup === 'all' || conversation.group === activeGroup;
    const match = `${conversation.name} ${conversation.sub}`.toLowerCase().includes(search.toLowerCase());
    return inGroup && match;
  }).sort((a, b) => conversationScore(b) - conversationScore(a)), [activeGroup, availableConversations, recentActivity, search]);

  const activeConversation = visibleConversations.find(conversation => conversation.id === activeId) ?? visibleConversations[0] ?? availableConversations[0];
  const activeThread = [...(threads[activeConversation.id] ?? []), ...(sentThreads[activeConversation.id] ?? [])];
  const showSenderName = activeConversation.group === 'common';
  const isUnread = (conversation: Conversation) => conversation.unread > 0 && !readConversationIds[conversation.id];

  function selectConversation(id: string) {
    setActiveId(id);
    setReadConversationIds(current => ({ ...current, [id]: true }));
  }

  useEffect(() => {
    if (activeId) setReadConversationIds(current => ({ ...current, [activeId]: true }));
  }, [activeId]);

  function changeGroup(group: MessageGroup) {
    const first = [...availableConversations]
      .sort((a, b) => conversationScore(b) - conversationScore(a))
      .find(conversation => group === 'all' || conversation.group === group);
    setActiveGroup(group);
    selectConversation(first?.id ?? '');
    setSearch('');
    setMobileChatOpen(false);
    setNotice(groupTabs.find(tab => tab.id === group)?.helper ?? '');
  }

  function sendMessage() {
    if (!draft.trim()) return;
    const message: Message = {
      from: 'Admin Priya',
      text: draft.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      me: true,
    };
    setSentThreads(current => ({
      ...current,
      [activeConversation.id]: [...(current[activeConversation.id] ?? []), message],
    }));
    setRecentActivity(current => ({ ...current, [activeConversation.id]: Date.now() }));
    setNotice(`Message added for ${activeConversation.name}.`);
    setDraft('');
  }

  return (
    <div className="h-[calc(100dvh-4rem)] min-h-[540px] w-full min-w-0 max-w-full overflow-hidden">

      <div className={`${mobileChatOpen ? 'hidden' : 'flex'} h-full min-h-0 md:hidden flex-col bg-background`}>
        <div className="px-2 py-2 bg-surface border-y border-outline-variant/30 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 min-w-max">
            {groupTabs.map(tab => {
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => changeGroup(tab.id)}
                  title={tab.label}
                  className={`max-w-[104px] truncate rounded-full border px-3 py-1.5 text-[12px] leading-none whitespace-nowrap ${activeGroup === tab.id ? 'border-primary bg-primary text-on-primary' : 'border-outline-variant/70 bg-white text-on-surface-variant'}`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
        <div className="no-scrollbar flex-1 overflow-y-auto">
          {visibleConversations.map(conversation => (
            <button
              key={conversation.id}
              type="button"
              onClick={() => { selectConversation(conversation.id); setMobileChatOpen(true); }}
              className="w-full px-4 py-3 flex items-start gap-3 text-left hover:bg-surface-container"
            >
              <span className="relative shrink-0"><span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-label-md font-bold text-on-primary">{conversation.avatar}</span>{conversation.online && <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />}</span>
              <span className="min-w-0 flex-1 border-b border-outline-variant/20 pb-3">
                <span className="flex items-start justify-between gap-2"><span className={`font-medium truncate ${isUnread(conversation) ? 'text-on-surface' : 'text-on-surface-variant'}`}>{conversation.name}</span><span className={`shrink-0 text-label-sm ${isUnread(conversation) ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>{conversation.time}</span></span>
                <span className="mt-1 flex items-center gap-2"><span className="flex-1 text-[13px] leading-5 text-on-surface-variant truncate">{conversation.sub}</span><span className="material-symbols-outlined text-[18px] text-on-surface-variant">notifications_off</span></span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className={`${mobileChatOpen ? 'flex' : 'hidden'} h-full min-h-0 md:hidden flex-col bg-background`}>
        <header className="px-4 py-3 bg-surface border-y border-outline-variant/30 flex items-center gap-3 shrink-0">
          <button type="button" onClick={() => setMobileChatOpen(false)} className="-ml-2 h-9 w-9 flex items-center justify-center rounded-full hover:bg-surface-container" aria-label="Back to messages"><span className="material-symbols-outlined">arrow_back</span></button>
          <span className="relative"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-label-sm font-bold text-on-primary">{activeConversation.avatar}</span>{activeConversation.online && <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-500" />}</span>
          <span className="block font-bold text-on-surface">{activeConversation.name}</span>
        </header>
        <div className="no-scrollbar flex-1 min-h-0 overflow-y-auto p-4 pb-28 md:pb-4 space-y-3">
          {activeThread.map((message, index) => <div key={`${message.time}-${index}`} className={`flex ${message.me ? 'justify-end' : 'justify-start'}`}><div className={`chat-bubble max-w-sm px-4 py-2.5 rounded-2xl text-body-md ${message.me ? 'chat-bubble-sent bg-white text-on-surface rounded-br-sm shadow-sm border border-outline-variant/20' : 'chat-bubble-received bg-primary text-on-primary rounded-bl-sm border border-primary'}`}><p>{message.text}</p><p className={`mt-2 text-[11px] ${message.me ? 'text-on-surface-variant' : 'text-on-primary/80'}`}>{showSenderName ? `${message.from} | ${message.time}` : message.time}</p></div></div>)}
        </div>
        <footer className="fixed bottom-3 left-0 right-0 z-40 border-t border-outline-variant/30 bg-surface p-3 pb-4 md:static md:z-auto md:pb-3"><div className="flex items-center gap-2 bg-surface-container rounded-xl px-3 py-2 border border-outline-variant"><input value={draft} onChange={event => setDraft(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') sendMessage(); }} className="flex-1 bg-transparent outline-none text-body-md" placeholder="Type a message..." /><button type="button" onClick={sendMessage} className={`p-1.5 rounded-full ${draft.trim() ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'}`}><span className="material-symbols-outlined text-[20px]">send</span></button></div></footer>
      </div>

      <div className="hidden h-full min-h-0 min-w-0 grid-cols-1 md:grid md:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="safe-surface-enter min-w-0 bg-surface-container-low border-r border-outline-variant/30 overflow-hidden flex flex-col">
          <div className="order-2 p-3 border-y border-outline-variant/30 overflow-x-auto admin-message-category-scroll">
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
          <div className="order-3 min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
            {visibleConversations.map(conversation => (
              <button
                key={conversation.id}
                type="button"
                onClick={() => selectConversation(conversation.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 border-b border-outline-variant/20 text-left ${activeConversation.id === conversation.id ? 'bg-primary-container/35' : 'hover:bg-surface-container-low'}`}
              >
                <span className="relative shrink-0"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-label-sm font-bold text-on-primary">{conversation.avatar}</span>{conversation.online && <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />}</span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-bold text-on-surface truncate">{conversation.name}</span>
                    <span className={`text-label-sm shrink-0 ${isUnread(conversation) ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>{conversation.time}</span>
                  </span>
                  <span className="block text-label-sm text-on-surface-variant truncate">{conversation.sub}</span>
                </span>
              </button>
            ))}
          </div>
        </aside>

        <section className="safe-surface-enter min-w-0 min-h-0 bg-background overflow-hidden flex flex-col">
          <header className="p-4 border-b border-outline-variant/30 flex items-center gap-3">
            <span className="relative"><span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary font-bold text-on-primary">{activeConversation.avatar}</span>{activeConversation.online && <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />}</span>
            <div>
              <h2 className="font-bold text-primary">{activeConversation.name}</h2>
            </div>
          </header>
          <p className="sr-only" aria-live="polite">{notice}</p>
          <div className="flex-1 p-4 pb-28 md:pb-4 space-y-3 overflow-y-auto bg-background">
            {activeThread.map((message, index) => (
              <div key={`${message.time}-${index}`} className={`flex ${message.me ? 'justify-end' : 'justify-start'}`}>
                <div className={`chat-bubble max-w-md px-4 py-2.5 rounded-2xl ${message.me ? 'chat-bubble-sent bg-white border border-outline-variant/30 text-on-surface rounded-br-sm shadow-sm' : 'chat-bubble-received bg-primary border border-primary text-on-primary rounded-bl-sm'}`}>
                  <p>{message.text}</p>
                  <p className={`mt-2 text-[11px] ${message.me ? 'text-on-surface-variant' : 'text-on-primary/80'}`}>{showSenderName ? `${message.from} | ${message.time}` : message.time}</p>
                </div>
              </div>
            ))}
            {activeThread.length === 0 && (
              <div className="rounded-xl border border-dashed border-outline-variant bg-white p-5 text-center text-on-surface-variant">No messages yet. Send a frontend demo message below.</div>
            )}
          </div>
          <footer className="fixed bottom-3 left-0 right-0 z-40 border-t border-outline-variant/30 bg-surface p-3 pb-4 md:static md:z-auto md:pb-3">
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
    <Suspense fallback={<LoadingRing size="lg" />}>
      <AdminMessagesContent />
    </Suspense>
  );
}

