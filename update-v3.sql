-- =====================================================================
-- تحديث ٣: الجوال، وإحصاءات الدخول والوقت، ولوحة المؤشرات، وطريقة فتح المحاضرات
-- شغّله مرة واحدة في Supabase → SQL Editor (لا يحذف أي بيانات)
-- =====================================================================
alter table students add column if not exists phone text;
alter table settings add column if not exists access_mode text not null default 'pass';   -- open | watch | pass
alter table settings add column if not exists platform_name text not null default 'منصة إتقان';
alter table lectures add column if not exists exam_mode text not null default 'bank';
alter table lectures add column if not exists files jsonb not null default '[]'::jsonb;

create table if not exists sessions (
  id          uuid primary key default gen_random_uuid(),
  national_id text not null references students(national_id) on delete cascade on update cascade,
  started_at  timestamptz not null default now(),
  last_seen   timestamptz not null default now(),
  seconds     int not null default 0
);
create index if not exists sessions_nid_idx on sessions(national_id);
alter table sessions enable row level security;
drop policy if exists teacher_all on sessions;
create policy teacher_all on sessions for all to authenticated using (is_admin()) with check (is_admin());

-- طريقة فتح المحاضرات: open = كلها مفتوحة، watch = بعد مشاهدة السابقة، pass = بعد اجتياز اختبار السابقة
create or replace function _unlocked(p_nid text, p_lid int) returns boolean
language plpgsql stable security definer set search_path = public as $$
declare m text; prev int;
begin
  select access_mode into m from settings where id = 1;
  if m = 'open' then return true; end if;
  select max(id) into prev from lectures where id < p_lid;
  if prev is null then return true; end if;
  if m = 'watch' then
    return exists (select 1 from views where national_id = p_nid and lecture_id = prev);
  end if;
  return _lecture_done(p_nid, prev);
end $$;

-- إحصاءات الطالب
create or replace function _student_stats(p_nid text) returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'logins',  (select count(*) from sessions where national_id = p_nid),
    'seconds', (select coalesce(sum(seconds), 0) from sessions where national_id = p_nid),
    'tests',   count(*),
    'max', max(percent), 'min', min(percent), 'avg', round(avg(percent)))
  from attempts where national_id = p_nid and submitted_at is not null;
$$;

create or replace function student_portal(p_nid text) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare s students;
begin
  select * into s from students where national_id = trim(p_nid);
  if not found then return null; end if;
  return jsonb_build_object(
    'student',  jsonb_build_object('national_id', s.national_id, 'full_name', s.full_name, 'details', s.details, 'phone', s.phone),
    'stats',    _student_stats(s.national_id),
    'files',    coalesce((select jsonb_agg(jsonb_build_object('title', f.title, 'url', f.url) order by f.created_at)
                          from student_files f where f.national_id = s.national_id), '[]'::jsonb),
    'settings', (select jsonb_build_object('pass_mark', pass_mark, 'questions_per_quiz', questions_per_quiz, 'access_mode', access_mode,
                                           'platform_name', platform_name, 'school_name', school_name, 'course_name', course_name) from settings where id = 1),
    'lectures', coalesce((
      select jsonb_agg(to_jsonb(x) order by x.id) from (
        select l.id, l.title, l.topic, l.parts, l.exam_mode,
          (select coalesce(jsonb_agg(jsonb_build_object('name', e->>'name', 'url', e->>'url')), '[]'::jsonb) from jsonb_array_elements(l.files) e) as files,
          (select count(*) from questions q where q.lecture_id = l.id and q.active) as question_count,
          exists (select 1 from views v where v.national_id = s.national_id and v.lecture_id = l.id) as watched,
          _lecture_done(s.national_id, l.id) as done,
          _unlocked(s.national_id, l.id) as unlocked,
          (select max(a.percent) from attempts a where a.national_id = s.national_id and a.lecture_id = l.id and a.submitted_at is not null) as best,
          (select count(*) from attempts a where a.national_id = s.national_id and a.lecture_id = l.id and a.submitted_at is not null) as attempts_count
        from lectures l
      ) x), '[]'::jsonb)
  );
end $$;

-- بداية جلسة دخول
create or replace function student_login(p_nid text) returns uuid
language plpgsql security definer set search_path = public as $$
declare sid uuid;
begin
  if not exists (select 1 from students where national_id = trim(p_nid)) then return null; end if;
  insert into sessions (national_id) values (trim(p_nid)) returning id into sid;
  return sid;
end $$;

-- نبضة كل دقيقة أثناء وجود الطالب في الصفحة (لا تُحتسب أكثر من ٧٥ ثانية للنبضة)
create or replace function student_ping(p_session uuid, p_nid text) returns boolean
language sql security definer set search_path = public as $$
  update sessions set seconds = seconds + least(greatest(extract(epoch from now() - last_seen), 0), 75)::int, last_seen = now()
   where id = p_session and national_id = p_nid
  returning true;
$$;

create or replace function set_phone(p_nid text, p_phone text) returns boolean
language plpgsql security definer set search_path = public as $$
begin
  if p_phone !~ '^05[0-9]{8}$' then raise exception 'bad_phone'; end if;
  update students set phone = p_phone where national_id = p_nid;
  return found;
end $$;

-- لوحة المؤشرات للمعلم
create or replace function admin_dashboard() returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare r jsonb;
begin
  if not is_admin() then raise exception 'not_admin'; end if;
  with st as (
    select s.national_id, s.full_name, s.phone,
      (select count(*) from sessions x where x.national_id = s.national_id) as logins,
      (select coalesce(sum(seconds), 0) from sessions x where x.national_id = s.national_id) as seconds,
      (select count(*) from attempts a where a.national_id = s.national_id and a.submitted_at is not null) as tests,
      (select round(avg(percent)) from attempts a where a.national_id = s.national_id and a.submitted_at is not null) as avg
    from students s)
  select jsonb_build_object(
    'students', (select count(*) from st),
    'active',   (select count(*) from st where logins > 0),
    'with_phone', (select count(*) from students where phone is not null),
    'logins',   (select coalesce(sum(logins), 0) from st),
    'seconds',  (select coalesce(sum(seconds), 0) from st),
    'tests',    (select coalesce(sum(tests), 0) from st),
    'avg',      (select round(avg(percent)) from attempts where submitted_at is not null),
    'today',    (select count(distinct national_id) from sessions where started_at >= date_trunc('day', now())),
    'top_logins',   (select coalesce(jsonb_agg(to_jsonb(t)), '[]') from (select * from st where logins > 0 order by logins desc, seconds desc limit 10) t),
    'top_time',     (select coalesce(jsonb_agg(to_jsonb(t)), '[]') from (select * from st where seconds > 0 order by seconds desc limit 10) t),
    'top_tests',    (select coalesce(jsonb_agg(to_jsonb(t)), '[]') from (select * from st where tests > 0 order by tests desc, avg desc limit 10) t),
    'top_scores',   (select coalesce(jsonb_agg(to_jsonb(t)), '[]') from (select * from st where tests > 0 order by avg desc, tests desc limit 10) t),
    'low_scores',   (select coalesce(jsonb_agg(to_jsonb(t)), '[]') from (select * from st where tests > 0 order by avg asc, tests desc limit 10) t)
  ) into r;
  return r;
end $$;

grant execute on function student_portal(text), student_login(text), student_ping(uuid, text), set_phone(text, text) to anon, authenticated;
grant execute on function admin_dashboard() to authenticated;

-- اسم المنصة والمدرسة لصفحة الدخول (بدون بيانات طلاب)
create or replace function public_settings() returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object('platform_name', platform_name, 'school_name', school_name, 'course_name', course_name, 'pass_mark', pass_mark, 'access_mode', access_mode)
  from settings where id = 1;
$$;
grant execute on function public_settings() to anon, authenticated;
