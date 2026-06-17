create extension if not exists pgcrypto;

create or replace function prevent_db2_mutation()
returns trigger as $$
begin
  raise exception 'DB-2 is protected mirror storage. Update/delete operations are not allowed.';
end;
$$ language plpgsql;

do $$
declare
  table_name text;
  protected_tables text[] := array[
    'schools',
    'roles',
    'permissions',
    'role_permissions',
    'users',
    'school_registration_requests',
    'classes',
    'sections',
    'teachers',
    'teacher_assignments',
    'parents',
    'students',
    'attendance_records',
    'student_travel_status',
    'timetable_breaks',
    'timetable_periods',
    'notifications',
    'messages',
    'sms_delivery_logs',
    'incident_logs',
    'safety_reports',
    'api_test_results'
  ];
begin
  foreach table_name in array protected_tables loop
    if to_regclass(table_name) is not null then
      execute format('drop trigger if exists %I on %I', table_name || '_db2_no_update_delete', table_name);
      execute format(
        'create trigger %I before update or delete on %I for each row execute function prevent_db2_mutation()',
        table_name || '_db2_no_update_delete',
        table_name
      );
    end if;
  end loop;
end $$;
