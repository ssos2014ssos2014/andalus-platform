-- =====================================================================
-- تحديث: الاختبار المحاكي (٢٤ سؤالًا في ٢٥ دقيقة بأسئلة متجددة)
-- شغّله مرة واحدة في Supabase → SQL Editor (لا يحذف أي بيانات)
-- =====================================================================
alter table lectures add column if not exists files jsonb not null default '[]'::jsonb;
alter table lectures add column if not exists exam_mode text not null default 'bank';   -- bank | generated
alter table attempts add column if not exists mode text not null default 'bank';
alter table attempts add column if not exists items jsonb;
alter table attempts add column if not exists duration_sec int;
alter table attempts alter column question_ids drop not null;

create table if not exists student_files (
  id bigint generated always as identity primary key,
  national_id text not null references students(national_id) on delete cascade on update cascade,
  title text not null, path text not null, url text not null, created_at timestamptz not null default now()
);
alter table student_files enable row level security;
drop policy if exists teacher_all on student_files;
create policy teacher_all on student_files for all to authenticated using (is_admin()) with check (is_admin());

-- المحاضرة 1 تعمل بالاختبار المحاكي المتجدد
update lectures set exam_mode = 'generated', topic = 'العمليات على الأعداد العشرية' where id = 1;

create or replace function _lecture_done(p_nid text, p_lid int) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from attempts a where a.national_id = p_nid and a.lecture_id = p_lid and a.passed)
      or ( (select exam_mode from lectures where id = p_lid) = 'bank'
           and not exists (select 1 from questions q where q.lecture_id = p_lid and q.active)
           and exists (select 1 from views v where v.national_id = p_nid and v.lecture_id = p_lid) );
$$;

create or replace function student_portal(p_nid text) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare s students;
begin
  select * into s from students where national_id = trim(p_nid);
  if not found then return null; end if;
  return jsonb_build_object(
    'student',  jsonb_build_object('national_id', s.national_id, 'full_name', s.full_name, 'details', s.details),
    'files',    coalesce((select jsonb_agg(jsonb_build_object('title', f.title, 'url', f.url) order by f.created_at)
                          from student_files f where f.national_id = s.national_id), '[]'::jsonb),
    'settings', (select jsonb_build_object('pass_mark', pass_mark, 'questions_per_quiz', questions_per_quiz,
                                           'school_name', school_name, 'course_name', course_name) from settings where id = 1),
    'lectures', coalesce((
      select jsonb_agg(to_jsonb(x) order by x.id) from (
        select l.id, l.title, l.topic, l.parts, l.exam_mode,
          (select coalesce(jsonb_agg(jsonb_build_object('name', e->>'name', 'url', e->>'url')), '[]'::jsonb) from jsonb_array_elements(l.files) e) as files,
          (select count(*) from questions q where q.lecture_id = l.id and q.active) as question_count,
          exists (select 1 from views v where v.national_id = s.national_id and v.lecture_id = l.id) as watched,
          _lecture_done(s.national_id, l.id) as done,
          (select max(a.percent) from attempts a where a.national_id = s.national_id and a.lecture_id = l.id and a.submitted_at is not null) as best,
          (select count(*) from attempts a where a.national_id = s.national_id and a.lecture_id = l.id and a.submitted_at is not null) as attempts_count
        from lectures l
      ) x), '[]'::jsonb)
  );
end $$;

-- بدء اختبار محاكي: يعيد بصمات الأسئلة التي ظهرت للطالب سابقًا حتى لا تتكرر
create or replace function start_practice(p_nid text, p_lid int) returns jsonb
language plpgsql security definer set search_path = public as $$
declare att uuid;
begin
  if not exists (select 1 from students where national_id = p_nid) then raise exception 'student_not_found'; end if;
  if not _unlocked(p_nid, p_lid) then raise exception 'lecture_locked'; end if;
  insert into attempts (national_id, lecture_id, mode) values (p_nid, p_lid, 'generated') returning id into att;
  return jsonb_build_object(
    'attempt_id', att,
    'seed', floor(random() * 2147483647)::bigint,
    'pass_mark', (select pass_mark from settings where id = 1),
    'used', coalesce((select jsonb_agg(distinct e->>'sig') from attempts a, jsonb_array_elements(a.items) e
                      where a.national_id = p_nid and a.lecture_id = p_lid and a.items is not null), '[]'::jsonb));
end $$;

-- تسليم الاختبار المحاكي مع كل أسئلته وإجاباته
create or replace function submit_practice(p_attempt uuid, p_nid text, p_items jsonb, p_duration int) returns jsonb
language plpgsql security definer set search_path = public as $$
declare a attempts; sc int; tot int; pct int; pm int;
begin
  select * into a from attempts where id = p_attempt and national_id = p_nid and mode = 'generated';
  if not found then raise exception 'attempt_not_found'; end if;
  if a.submitted_at is not null then raise exception 'already_submitted'; end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 or jsonb_array_length(p_items) > 60 then raise exception 'bad_items'; end if;
  tot := jsonb_array_length(p_items);
  select count(*) into sc from jsonb_array_elements(p_items) e
    where (e->>'chosen') is not null and (e->>'chosen') = (e->>'correct');
  pct := round(sc * 100.0 / tot);
  select pass_mark into pm from settings where id = 1;
  update attempts set items = p_items, score = sc, total = tot, percent = pct, passed = (pct >= pm),
         duration_sec = least(greatest(coalesce(p_duration, 0), 0), 7200), submitted_at = now()
   where id = p_attempt;
  return jsonb_build_object('score', sc, 'total', tot, 'percent', pct, 'passed', pct >= pm, 'pass_mark', pm);
end $$;

grant execute on function student_portal(text), start_practice(text, int), submit_practice(uuid, text, jsonb, int) to anon, authenticated;
