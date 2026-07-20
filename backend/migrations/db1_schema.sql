create extension if not exists pgcrypto;

create table if not exists schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text unique not null,
  address text,
  city text,
  state text,
  country text default 'India',
  phone text,
  email text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists roles (
  id uuid primary key default gen_random_uuid(),
  role_key text unique not null,
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists permissions (
  id uuid primary key default gen_random_uuid(),
  permission_key text unique not null,
  description text not null,
  created_at timestamptz not null default now()
);

create table if not exists role_permissions (
  role_id uuid not null references roles(id) on delete cascade,
  permission_id uuid not null references permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references schools(id) on delete restrict,
  role_id uuid not null references roles(id) on delete restrict,
  full_name text not null,
  email text unique not null,
  phone text,
  password_hash text not null,
  status text not null default 'active',
  terms_accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists school_registration_requests (
  id uuid primary key default gen_random_uuid(),
  school_name text not null,
  requester_name text not null,
  requester_email text not null,
  requester_phone text,
  address text,
  password_hash text not null,
  status text not null default 'pending',
  decision_reason text,
  decided_by uuid references users(id),
  decided_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists classes (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  name text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  unique (school_id, name)
);

create table if not exists sections (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  class_id uuid not null references classes(id) on delete cascade,
  name text not null,
  room text,
  created_at timestamptz not null default now(),
  unique (class_id, name)
);

create table if not exists teachers (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  user_id uuid references users(id) on delete set null,
  employee_code text,
  subject text,
  qualification text,
  status text not null default 'available',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists teacher_assignments (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  teacher_id uuid not null references teachers(id) on delete cascade,
  class_id uuid not null references classes(id) on delete cascade,
  section_id uuid not null references sections(id) on delete cascade,
  assignment_type text not null check (assignment_type in ('primary_incharge', 'assistant_incharge', 'subject_teacher')),
  subject text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists parents (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  user_id uuid references users(id) on delete set null,
  guardian_name text not null,
  phone text not null,
  alternate_phone text,
  sms_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  class_id uuid not null references classes(id) on delete restrict,
  section_id uuid not null references sections(id) on delete restrict,
  parent_id uuid references parents(id) on delete set null,
  student_code text unique not null,
  full_name text not null,
  roll_no text,
  gender text,
  date_of_birth date,
  status text not null default 'active',
  emergency_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists attendance_records (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  class_id uuid not null references classes(id) on delete restrict,
  section_id uuid not null references sections(id) on delete restrict,
  attendance_date date not null,
  session text not null check (session in ('morning', 'go_out')),
  status text not null,
  reason text,
  marked_by uuid references users(id),
  locked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, attendance_date, session)
);

create table if not exists student_travel_status (
  student_id uuid primary key references students(id) on delete cascade,
  school_id uuid not null references schools(id) on delete cascade,
  status text not null default 'at_home',
  attendance_status text default 'pending',
  last_event text,
  last_event_at timestamptz not null default now(),
  updated_by uuid references users(id)
);

create table if not exists timetable_breaks (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  class_id uuid not null references classes(id) on delete cascade,
  section_id uuid not null references sections(id) on delete cascade,
  break_key text not null,
  label text not null,
  after_period int not null,
  tone text not null default 'interval',
  updated_by uuid references users(id),
  updated_at timestamptz not null default now(),
  unique (section_id, break_key)
);

create table if not exists timetable_periods (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  class_id uuid not null references classes(id) on delete cascade,
  section_id uuid not null references sections(id) on delete cascade,
  day_name text not null,
  period_no int not null,
  subject text not null,
  updated_by uuid references users(id),
  updated_at timestamptz not null default now(),
  unique (section_id, day_name, period_no)
);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references schools(id) on delete cascade,
  audience_role text not null,
  user_id uuid references users(id) on delete cascade,
  title text not null,
  body text not null,
  event_type text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  conversation_type text not null,
  sender_id uuid references users(id),
  recipient_id uuid references users(id),
  class_id uuid references classes(id),
  section_id uuid references sections(id),
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists sms_delivery_logs (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references schools(id) on delete cascade,
  student_id uuid references students(id) on delete set null,
  to_phone text not null,
  body text not null,
  provider text not null default 'twilio',
  provider_message_id text,
  status text not null default 'queued',
  error_message text,
  created_at timestamptz not null default now()
);

create table if not exists safety_protocols (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  role_key text not null check (role_key in ('parent', 'teacher')),
  label text not null,
  checked boolean not null default false,
  submitted boolean not null default false,
  active boolean not null default true,
  created_by uuid references users(id),
  updated_by uuid references users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_users_school_role on users(school_id, role_id);
create index if not exists idx_students_school_class_section on students(school_id, class_id, section_id);
create index if not exists idx_attendance_date on attendance_records(school_id, attendance_date, session);
create index if not exists idx_notifications_user on notifications(user_id, read_at, created_at desc);
create index if not exists idx_safety_protocols_role on safety_protocols(school_id, role_key, active);
