create table if not exists incident_logs (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  student_id uuid references students(id) on delete set null,
  incident_code text unique not null,
  incident_type text not null,
  level text not null,
  priority text not null,
  status text not null default 'pending',
  handler_name text,
  incident_time timestamptz not null default now(),
  detail text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists safety_reports (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  class_id uuid references classes(id) on delete set null,
  section_id uuid references sections(id) on delete set null,
  report_title text not null,
  safety_score int not null default 0,
  alert_count int not null default 0,
  attendance_percent numeric(5,2) not null default 0,
  report_text text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists api_test_results (
  id uuid primary key default gen_random_uuid(),
  test_name text not null,
  service_name text not null,
  status text not null,
  detail text,
  created_at timestamptz not null default now()
);

create index if not exists idx_incident_logs_school_time on incident_logs(school_id, incident_time desc);
create index if not exists idx_safety_reports_school_class on safety_reports(school_id, class_id, section_id);
