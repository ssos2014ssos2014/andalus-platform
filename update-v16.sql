-- =====================================================================
-- تحديث ١٦: الشهادات (إصدار، صفحة الطالب، الاحتفال) + المدرسة لكل طالب
-- =====================================================================
alter table students add column if not exists school text not null default 'andalus';
do $$ begin
  alter table students add constraint students_school_chk check (school in ('andalus', 'asma'));
exception when duplicate_object then null; end $$;

create table if not exists certificates (
  id          uuid primary key default gen_random_uuid(),
  national_id text not null references students(national_id) on delete cascade,
  kind        text not null,
  title       text not null,
  body        text not null,
  stats       jsonb not null default '{}'::jsonb,
  school      text not null default 'andalus',
  issued_at   timestamptz not null default now(),
  seen_at     timestamptz
);
create index if not exists certificates_nid on certificates(national_id, issued_at desc);
alter table certificates enable row level security;
drop policy if exists teacher_all on certificates;
create policy teacher_all on certificates for all to authenticated using (is_admin()) with check (is_admin());

-- إحصاءات الطلاب لاختيار المتميزين (للمعلم فقط)
create or replace function admin_cert_stats() returns table (national_id text, full_name text, phone text, school text, watched int, passed int, tests int, avg_best int, certs int)
language plpgsql stable security definer set search_path = public as $$
begin
  if not is_admin() then raise exception 'not_admin'; end if;
  return query
  select s.national_id, s.full_name, s.phone, s.school,
    (select count(distinct v.lecture_id)::int from views v where v.national_id = s.national_id),
    (select count(distinct a.lecture_id)::int from attempts a where a.national_id = s.national_id and a.passed),
    (select count(*)::int from attempts a where a.national_id = s.national_id and a.submitted_at is not null),
    (select round(avg(b.best))::int from (select max(a.percent) as best from attempts a where a.national_id = s.national_id and a.submitted_at is not null group by a.lecture_id) b),
    (select count(*)::int from certificates c where c.national_id = s.national_id)
  from students s where coalesce(s.is_test, false) = false
  order by 6 desc, 5 desc, 2;
end $$;
grant execute on function admin_cert_stats() to authenticated;

-- شهادات الطالب (لصفحة الطالب)
create or replace function student_certificates(p_nid text) returns jsonb
language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object('id', c.id, 'kind', c.kind, 'title', c.title, 'body', c.body, 'stats', c.stats,
    'school', c.school, 'issued_at', c.issued_at, 'seen_at', c.seen_at, 'full_name', s.full_name) order by c.issued_at desc), '[]'::jsonb)
  from certificates c join students s on s.national_id = c.national_id where c.national_id = p_nid;
$$;
grant execute on function student_certificates(text) to anon, authenticated;

create or replace function cert_seen(p_nid text, p_ids uuid[]) returns void
language sql security definer set search_path = public as $$
  update certificates set seen_at = now() where national_id = p_nid and id = any(p_ids) and seen_at is null;
$$;
grant execute on function cert_seen(text, uuid[]) to anon, authenticated;

-- لتعيين طالبات ثانوية أسماء بنت أبي بكر (مثال):
-- update students set school = 'asma' where national_id in ('1234567890', '...');
