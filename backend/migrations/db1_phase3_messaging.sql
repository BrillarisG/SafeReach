alter table messages add column if not exists student_id uuid references students(id) on delete set null;
alter table messages add column if not exists message_kind text not null default 'chat';
create index if not exists idx_messages_student_created on messages(student_id, created_at desc);
create index if not exists idx_messages_kind_created on messages(message_kind, created_at desc);
