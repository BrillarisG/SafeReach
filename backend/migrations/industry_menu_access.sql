create table if not exists industry_menu_access (
  school_id text not null,
  menu_key text not null,
  enabled boolean not null default true,
  updated_by text null,
  updated_at timestamptz not null default now(),
  primary key (school_id, menu_key)
);

create index if not exists idx_industry_menu_access_school
  on industry_menu_access(school_id);
