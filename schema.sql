-- =====================================================================
-- منصة تأسيس القدرات — ثانوية الأندلس بترقش
-- انسخ هذا الملف كاملًا والصقه في Supabase → SQL Editor ثم اضغط Run
-- (يمكن تشغيله أكثر من مرة دون ضرر)
-- =====================================================================
create extension if not exists pgcrypto;

-- ---------- الجداول ----------
create table if not exists settings (
  id int primary key default 1 check (id = 1),
  pass_mark int not null default 70,
  questions_per_quiz int not null default 10,
  school_name text not null default 'ثانوية الأندلس بترقش',
  course_name text not null default 'تأسيس القدرات — القسم الكمي'
);
insert into settings (id) values (1) on conflict do nothing;

create table if not exists admins (
  email text primary key
);

create table if not exists students (
  national_id text primary key,
  full_name   text not null,
  details     jsonb not null default '[]'::jsonb,   -- [{ "k": "اسم العمود", "v": "القيمة" }, ...]
  created_at  timestamptz not null default now()
);

create table if not exists lectures (
  id     int primary key,                 -- رقم المحاضرة وترتيبها
  title  text not null,
  topic  text not null default '',
  parts  jsonb not null default '[]'::jsonb -- [{ "label": "...", "drive_id": "..." }]
);

create table if not exists questions (
  id          bigint generated always as identity primary key,
  lecture_id  int not null references lectures(id) on delete cascade,
  body        text not null,
  options     jsonb not null,             -- ["الخيار أ", "الخيار ب", ...]
  correct     int not null,               -- رقم الخيار الصحيح يبدأ من 0
  explanation text not null default '',
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);
create index if not exists questions_lecture_idx on questions(lecture_id);

create table if not exists views (
  national_id text not null references students(national_id) on delete cascade on update cascade,
  lecture_id  int  not null references lectures(id) on delete cascade,
  watched_at  timestamptz not null default now(),
  primary key (national_id, lecture_id)
);

create table if not exists attempts (
  id           uuid primary key default gen_random_uuid(),
  national_id  text not null references students(national_id) on delete cascade on update cascade,
  lecture_id   int  not null references lectures(id) on delete cascade,
  question_ids bigint[] not null,
  answers      jsonb,
  score        int,
  total        int,
  percent      int,
  passed       boolean,
  started_at   timestamptz not null default now(),
  submitted_at timestamptz
);
create index if not exists attempts_student_idx on attempts(national_id, lecture_id);

-- ---------- الصلاحيات: لا أحد يقرأ الجداول مباشرة إلا المعلم ----------
create or replace function is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from admins where lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));
$$;

alter table settings  enable row level security;
alter table admins    enable row level security;
alter table students  enable row level security;
alter table lectures  enable row level security;
alter table questions enable row level security;
alter table views     enable row level security;
alter table attempts  enable row level security;

do $$
declare t text;
begin
  foreach t in array array['settings','students','lectures','questions','views','attempts'] loop
    execute format('drop policy if exists teacher_all on %I', t);
    execute format('create policy teacher_all on %I for all to authenticated using (is_admin()) with check (is_admin())', t);
  end loop;
  drop policy if exists admin_self on admins;
  create policy admin_self on admins for select to authenticated using (is_admin());
end $$;

-- ---------- دوال مساعدة ----------
create or replace function _lecture_done(p_nid text, p_lid int) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from attempts a where a.national_id = p_nid and a.lecture_id = p_lid and a.passed)
      or ( not exists (select 1 from questions q where q.lecture_id = p_lid and q.active)
           and exists (select 1 from views v where v.national_id = p_nid and v.lecture_id = p_lid) );
$$;

create or replace function _unlocked(p_nid text, p_lid int) returns boolean
language sql stable security definer set search_path = public as $$
  select case
    when not exists (select 1 from lectures where id < p_lid) then true
    else _lecture_done(p_nid, (select max(id) from lectures where id < p_lid))
  end;
$$;

-- ---------- دوال الطالب (تعمل برقم الهوية فقط وتعيد بياناته هو فقط) ----------
create or replace function student_portal(p_nid text) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare s students;
begin
  select * into s from students where national_id = trim(p_nid);
  if not found then return null; end if;
  return jsonb_build_object(
    'student',  jsonb_build_object('national_id', s.national_id, 'full_name', s.full_name, 'details', s.details),
    'settings', (select jsonb_build_object('pass_mark', pass_mark, 'questions_per_quiz', questions_per_quiz,
                                           'school_name', school_name, 'course_name', course_name)
                 from settings where id = 1),
    'lectures', coalesce((
      select jsonb_agg(to_jsonb(x) order by x.id) from (
        select l.id, l.title, l.topic, l.parts,
          (select count(*) from questions q where q.lecture_id = l.id and q.active) as question_count,
          exists (select 1 from views v where v.national_id = s.national_id and v.lecture_id = l.id) as watched,
          _lecture_done(s.national_id, l.id) as done,
          (select max(a.percent) from attempts a where a.national_id = s.national_id and a.lecture_id = l.id and a.submitted_at is not null) as best,
          (select count(*) from attempts a where a.national_id = s.national_id and a.lecture_id = l.id and a.submitted_at is not null) as attempts_count
        from lectures l
      ) x), '[]'::jsonb)
  );
end $$;

create or replace function mark_watched(p_nid text, p_lid int) returns boolean
language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from students where national_id = p_nid) then raise exception 'student_not_found'; end if;
  if not _unlocked(p_nid, p_lid) then raise exception 'lecture_locked'; end if;
  insert into views (national_id, lecture_id) values (p_nid, p_lid) on conflict do nothing;
  return true;
end $$;

-- يسحب أسئلة لم تظهر للطالب في محاولاته السابقة لنفس المحاضرة أولًا،
-- وإذا نفدت يكمل بالأسئلة الأقدم ظهورًا، ولا يرسل الإجابات الصحيحة للمتصفح.
create or replace function start_quiz(p_nid text, p_lid int) returns jsonb
language plpgsql security definer set search_path = public as $$
declare n int; ids bigint[]; att uuid; qs jsonb; pm int;
begin
  if not exists (select 1 from students where national_id = p_nid) then raise exception 'student_not_found'; end if;
  if not _unlocked(p_nid, p_lid) then raise exception 'lecture_locked'; end if;
  select questions_per_quiz, pass_mark into n, pm from settings where id = 1;

  with seen as (
    select qid, max(a.started_at) as last_seen
    from attempts a, unnest(a.question_ids) as qid
    where a.national_id = p_nid and a.lecture_id = p_lid
    group by qid
  )
  select array_agg(t.id) into ids from (
    select q.id from questions q
    left join seen on seen.qid = q.id
    where q.lecture_id = p_lid and q.active
    order by (seen.qid is not null), seen.last_seen nulls first, random()
    limit n
  ) t;

  if ids is null then raise exception 'no_questions'; end if;

  insert into attempts (national_id, lecture_id, question_ids) values (p_nid, p_lid, ids) returning id into att;

  select jsonb_agg(jsonb_build_object('id', q.id, 'body', q.body, 'options', q.options) order by random())
    into qs from questions q where q.id = any(ids);

  return jsonb_build_object('attempt_id', att, 'pass_mark', pm, 'questions', qs);
end $$;

create or replace function submit_quiz(p_attempt uuid, p_nid text, p_answers jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare a attempts; sc int; tot int; pct int; pm int; rv jsonb;
begin
  select * into a from attempts where id = p_attempt and national_id = p_nid;
  if not found then raise exception 'attempt_not_found'; end if;
  if a.submitted_at is not null then raise exception 'already_submitted'; end if;

  tot := coalesce(array_length(a.question_ids, 1), 0);
  select count(*) into sc from questions q
    where q.id = any(a.question_ids) and (p_answers ->> q.id::text)::int = q.correct;
  pct := case when tot > 0 then round(sc * 100.0 / tot) else 0 end;
  select pass_mark into pm from settings where id = 1;

  update attempts set answers = p_answers, score = sc, total = tot, percent = pct,
         passed = (pct >= pm), submitted_at = now()
   where id = p_attempt;

  select jsonb_agg(jsonb_build_object('id', q.id, 'correct', q.correct, 'explanation', q.explanation))
    into rv from questions q where q.id = any(a.question_ids);

  return jsonb_build_object('score', sc, 'total', tot, 'percent', pct, 'passed', pct >= pm, 'pass_mark', pm, 'review', rv);
end $$;

revoke execute on function _lecture_done(text, int), _unlocked(text, int) from public, anon;
grant execute on function student_portal(text), mark_watched(text, int), start_quiz(text, int), submit_quiz(uuid, text, jsonb) to anon, authenticated;
grant execute on function is_admin() to authenticated;

-- ---------- المحاضرات المستخرجة من صفحة المدرسة (57 محاضرة / 60 مقطعًا) ----------
insert into lectures (id, title, topic, parts) values
(1, 'المحاضرة 1', '', '[{"label": "المحاضرة", "drive_id": "11lm-3DrDUb3mgjmZ5bS48TrS8Op_tSZa"}]'::jsonb),
(2, 'المحاضرة 2', '', '[{"label": "المحاضرة", "drive_id": "1DhWzrq1DfQGWxGQoeGhz6zLA3oz0nMsR"}]'::jsonb),
(3, 'المحاضرة 3', '', '[{"label": "المحاضرة", "drive_id": "14hlw-j2_YI64ygISfcnCtGqSi8gv7MIm"}]'::jsonb),
(4, 'المحاضرة 4', '', '[{"label": "المحاضرة", "drive_id": "135K8_J2dOjIA1S8QtGw2KjfcBiwEgJWJ"}]'::jsonb),
(5, 'المحاضرة 5', '', '[{"label": "المحاضرة", "drive_id": "1AYy9cP5vWnaXm7qezKm2g8hFxxbHBtZg"}]'::jsonb),
(6, 'المحاضرة 6', '', '[{"label": "المحاضرة", "drive_id": "1EouR7NkWDJNe5-3eID4Pf0NR7Ptjj3o-"}]'::jsonb),
(7, 'المحاضرة 7', '', '[{"label": "المحاضرة", "drive_id": "1IG_-ov_JY0BT1typ4DMWGOD3K5wbpMB4"}]'::jsonb),
(8, 'المحاضرة 8', '', '[{"label": "المحاضرة", "drive_id": "1TIKbGQlNz9ICn19Uc5SG_5eMNhr0OXAc"}]'::jsonb),
(9, 'المحاضرة 9', '', '[{"label": "المحاضرة", "drive_id": "1-GJ9jwwqG9-mWX1dcV4O1W25pCsc_CyC"}]'::jsonb),
(10, 'المحاضرة 10', '', '[{"label": "المحاضرة", "drive_id": "1g3y5YSsIXUIYRCzjZewBlRSdTKFmSbtV"}]'::jsonb),
(11, 'المحاضرة 11', '', '[{"label": "المحاضرة", "drive_id": "1B9mKzxav0FO_QJubu0VRjhQKleN05Zhy"}]'::jsonb),
(12, 'المحاضرة 12', '', '[{"label": "المحاضرة", "drive_id": "1C2bVNPPNe6HoyxqvuLQRHSd6ZP7f8HRf"}]'::jsonb),
(13, 'المحاضرة 13', '', '[{"label": "المحاضرة", "drive_id": "1R8z2RdpBdWdVEqXG3cYIStApEdW_Bav8"}]'::jsonb),
(14, 'المحاضرة 14', '', '[{"label": "المحاضرة", "drive_id": "1fCSIVVgakbdHzK5RtA3nTcuYAsmPG9-s"}]'::jsonb),
(15, 'المحاضرة 15', '', '[{"label": "المحاضرة", "drive_id": "1KXK5s0jbT8maKO6y50WITsdalpJsnyqu"}]'::jsonb),
(16, 'المحاضرة 16', '', '[{"label": "المحاضرة", "drive_id": "1clAjjhMpbu497tvkxv2Jswqqr9od8kI2"}]'::jsonb),
(17, 'المحاضرة 17', '', '[{"label": "المحاضرة", "drive_id": "1aKYaRqZG658AToKp6LSJzpQKo8oVKI2L"}]'::jsonb),
(18, 'المحاضرة 18', '', '[{"label": "المحاضرة", "drive_id": "1EBpxneKdlct_bOr_Rve-thdFrdqXQCfo"}]'::jsonb),
(19, 'المحاضرة 19', '', '[{"label": "المحاضرة", "drive_id": "11r423x-icO3XAUsXUpNanepuAzUZZp_H"}]'::jsonb),
(20, 'المحاضرة 20', '', '[{"label": "المحاضرة", "drive_id": "1JhahdkeHYzTSIB_6-qN-MSTxCixntpsj"}]'::jsonb),
(21, 'المحاضرة 21', '', '[{"label": "المحاضرة", "drive_id": "1oXrQHVV2mzXpwL__7LGGTk68IFQnz04u"}]'::jsonb),
(22, 'المحاضرة 22', '', '[{"label": "المحاضرة", "drive_id": "1Xpqg3a3qiYIsdCtuZSwD1UAbiHOnuvwx"}]'::jsonb),
(23, 'المحاضرة 23', '', '[{"label": "المحاضرة", "drive_id": "1299YNWSg4vE8eqiI8xuXbPs4gzoALalU"}]'::jsonb),
(24, 'المحاضرة 24', '', '[{"label": "الجزء الأول", "drive_id": "1FL5l5tAfsyPfe0pcm1aW0rDq5ClefOJQ"}, {"label": "الجزء الثاني (تابع)", "drive_id": "1oTGFfkL8kNCusF8yJhsZDtT_Pn115Fo9"}]'::jsonb),
(25, 'المحاضرة 25', '', '[{"label": "المحاضرة", "drive_id": "1b4wcM6Oz-AN_PqYRvE-nq1nOwDcagsSn"}]'::jsonb),
(26, 'المحاضرة 26', '', '[{"label": "المحاضرة", "drive_id": "1OXS7mSMj-sbK4sqoR0djVuDPOYBLjbXb"}]'::jsonb),
(27, 'المحاضرة 27', '', '[{"label": "الجزء الأول", "drive_id": "10SGZWvX8CTxUztsy33uOtmCn3kCpaZgX"}, {"label": "الجزء الثاني (تابع)", "drive_id": "1uTztM1_IJa7F3hYhIrWua23j7eRoc8qJ"}]'::jsonb),
(28, 'المحاضرة 28', '', '[{"label": "المحاضرة", "drive_id": "19YokQ_2GNiBbq5MAGZvd-B6QkazC6XK5"}]'::jsonb),
(29, 'المحاضرة 29', '', '[{"label": "المحاضرة", "drive_id": "1LeNM19X_tV3yoGNhRsS1AM5Z76BS28I_"}]'::jsonb),
(30, 'المحاضرة 30', '', '[{"label": "المحاضرة", "drive_id": "1rsu45G7v4rBxkO1eFiw8sjffzWW8N65-"}]'::jsonb),
(31, 'المحاضرة 31', '', '[{"label": "المحاضرة", "drive_id": "1rQKGDwZ9qKhd3oWKJyOIrrJYKpc8v35E"}]'::jsonb),
(32, 'المحاضرة 32', '', '[{"label": "المحاضرة", "drive_id": "1jQdQoK91nAQ2n1vaVRQ5lyu3b0HlOSiB"}]'::jsonb),
(33, 'المحاضرة 33', '', '[{"label": "المحاضرة", "drive_id": "1egVKVJNgrLkpOsf9pbD2yNuLpX1ie_Qt"}]'::jsonb),
(34, 'المحاضرة 34', '', '[{"label": "المحاضرة", "drive_id": "1myJL2sbO5jnzo03G6pOlRGb9mtTFQT0_"}]'::jsonb),
(35, 'المحاضرة 35', '', '[{"label": "المحاضرة", "drive_id": "19ta55WsvHVVgcFf8LDjFYwGQMkondinS"}]'::jsonb),
(36, 'المحاضرة 36', '', '[{"label": "المحاضرة", "drive_id": "10jfvLpY6C6VAwK5i0Z2H5lsYq0qDzNxF"}]'::jsonb),
(37, 'المحاضرة 37', '', '[{"label": "المحاضرة", "drive_id": "1BBE5Rf1ALdk0sQ8eDdEcwbzzbC2harX5"}]'::jsonb),
(38, 'المحاضرة 38', '', '[{"label": "المحاضرة", "drive_id": "19_Gos5YeyFnPXlRfEMHJpbdBnIMTRtra"}]'::jsonb),
(39, 'المحاضرة 39', '', '[{"label": "المحاضرة", "drive_id": "1WVVBRzx3PSB0LlojBwISTb8-MK2ZI_WG"}]'::jsonb),
(40, 'المحاضرة 40', '', '[{"label": "المحاضرة", "drive_id": "1ImSMaAtuhw-NgespBalGzDBCLjqfL9CP"}]'::jsonb),
(41, 'المحاضرة 41', '', '[{"label": "المحاضرة", "drive_id": "1ftL8hWgGWHKqCbqAW97-u6zgNb0YW0dV"}]'::jsonb),
(42, 'المحاضرة 42', '', '[{"label": "المحاضرة", "drive_id": "1Mbm4kqz-fdgJPNIsFHkZu6ld-ZDEAE74"}]'::jsonb),
(43, 'المحاضرة 43', '', '[{"label": "المحاضرة", "drive_id": "1yJ3QBL7ulBQJf_MifhvkDh9PriOf_eEu"}]'::jsonb),
(44, 'المحاضرة 44', '', '[{"label": "المحاضرة", "drive_id": "1M0bbWqmcmVxCh8N2VGQaUL9KB5GlF5yJ"}]'::jsonb),
(45, 'المحاضرة 45', '', '[{"label": "المحاضرة", "drive_id": "1rHAC5CEDI7XPW1R3k3Esx-oCs2R_ip7U"}]'::jsonb),
(46, 'المحاضرة 46', '', '[{"label": "الجزء الأول", "drive_id": "1eL6gq3kTcfj_K-fuWNZKFjGZr2ppSDn4"}, {"label": "الجزء الثاني (تابع)", "drive_id": "1V6bhG98y6D3Qyue7I5m4HtGZfx6k1eE1"}]'::jsonb),
(47, 'المحاضرة 47', '', '[{"label": "المحاضرة", "drive_id": "15c7LvFYrq061EejMbTEPFUoaYIK30FoQ"}]'::jsonb),
(48, 'المحاضرة 48', '', '[{"label": "المحاضرة", "drive_id": "1kG9LjnYvbr55yB-EVcbLxW8howa1S7an"}]'::jsonb),
(49, 'المحاضرة 49', '', '[{"label": "المحاضرة", "drive_id": "1mqucpD_SnSAI86rKTg0bBhppD8N1ZuFx"}]'::jsonb),
(50, 'المحاضرة 50', '', '[{"label": "المحاضرة", "drive_id": "1Ks1V8yJyNWzVpSaMxs6mdybghls8k-KE"}]'::jsonb),
(51, 'المحاضرة 51', '', '[{"label": "المحاضرة", "drive_id": "12Fg-yCHOra2GoOvdKtT71ARUoWdOH-uc"}]'::jsonb),
(52, 'المحاضرة 52', '', '[{"label": "المحاضرة", "drive_id": "1LUrHyzSOhTfuQPUHQ_Rx7GxJuh7eUC3r"}]'::jsonb),
(53, 'المحاضرة 53', '', '[{"label": "المحاضرة", "drive_id": "1FbGkE_Ikp_HVks_WV2LNDoK8oXdzjPvy"}]'::jsonb),
(54, 'المحاضرة 54', '', '[{"label": "المحاضرة", "drive_id": "1Yb4NRgKCAt761jFXuTqNIzpgO2Z8mlti"}]'::jsonb),
(55, 'المحاضرة 55', '', '[{"label": "المحاضرة", "drive_id": "1XOMKKjO9wDt4aJuL4xqNk5KxAWOkOyUZ"}]'::jsonb),
(56, 'المحاضرة 56', '', '[{"label": "المحاضرة", "drive_id": "1mcZ2ZZ6Mv05pOkU00zu28WDfTEA0xuNX"}]'::jsonb),
(57, 'المحاضرة 57', '', '[{"label": "المحاضرة", "drive_id": "1W7ew2CbVcn6OtQrRwSjY6bqRc21zZe-x"}]'::jsonb)
on conflict (id) do nothing;

-- =====================================================================
-- تحديث: ملفات PDF (ملزمة لكل محاضرة + ملفات خاصة بكل طالب)
-- شغّله مرة واحدة في Supabase → SQL Editor (لا يحذف أي بيانات)
-- =====================================================================

-- ملفات المحاضرات: [{ "name": "...", "url": "...", "path": "..." }]
alter table lectures add column if not exists files jsonb not null default '[]'::jsonb;

-- ملفات الطلاب
create table if not exists student_files (
  id          bigint generated always as identity primary key,
  national_id text not null references students(national_id) on delete cascade on update cascade,
  title       text not null,
  path        text not null,
  url         text not null,
  created_at  timestamptz not null default now()
);
create index if not exists student_files_nid_idx on student_files(national_id);
alter table student_files enable row level security;
drop policy if exists teacher_all on student_files;
create policy teacher_all on student_files for all to authenticated using (is_admin()) with check (is_admin());

-- مخازن الملفات (روابط الملفات عشوائية لا تُخمَّن، ولا يمكن استعراض محتوى المخزن)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('lecture-files', 'lecture-files', true, 52428800, array['application/pdf']),
       ('student-files', 'student-files', true, 52428800, array['application/pdf'])
on conflict (id) do update set public = true, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists andalus_admin_files on storage.objects;
create policy andalus_admin_files on storage.objects for all to authenticated
  using (bucket_id in ('lecture-files', 'student-files') and public.is_admin())
  with check (bucket_id in ('lecture-files', 'student-files') and public.is_admin());

-- بوابة الطالب: تضيف ملفاته وملفات كل محاضرة
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
                                           'school_name', school_name, 'course_name', course_name)
                 from settings where id = 1),
    'lectures', coalesce((
      select jsonb_agg(to_jsonb(x) order by x.id) from (
        select l.id, l.title, l.topic, l.parts,
          (select coalesce(jsonb_agg(jsonb_build_object('name', e->>'name', 'url', e->>'url')), '[]'::jsonb)
             from jsonb_array_elements(l.files) e) as files,
          (select count(*) from questions q where q.lecture_id = l.id and q.active) as question_count,
          exists (select 1 from views v where v.national_id = s.national_id and v.lecture_id = l.id) as watched,
          _lecture_done(s.national_id, l.id) as done,
          (select max(a.percent) from attempts a where a.national_id = s.national_id and a.lecture_id = l.id and a.submitted_at is not null) as best,
          (select count(*) from attempts a where a.national_id = s.national_id and a.lecture_id = l.id and a.submitted_at is not null) as attempts_count
        from lectures l
      ) x), '[]'::jsonb)
  );
end $$;
grant execute on function student_portal(text) to anon, authenticated;

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

-- =====================================================================
-- تحديث ٤: حفظ مكان توقف الطالب في كل مقطع
-- شغّله مرة واحدة في Supabase → SQL Editor (لا يحذف أي بيانات)
-- =====================================================================
create table if not exists watch_progress (
  national_id  text not null references students(national_id) on delete cascade on update cascade,
  lecture_id   int  not null references lectures(id) on delete cascade,
  part         int  not null default 0,
  position_sec int  not null default 0,
  updated_at   timestamptz not null default now(),
  primary key (national_id, lecture_id, part)
);
alter table watch_progress enable row level security;
drop policy if exists teacher_all on watch_progress;
create policy teacher_all on watch_progress for all to authenticated using (is_admin()) with check (is_admin());

create or replace function save_position(p_nid text, p_lid int, p_part int, p_pos int) returns boolean
language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from students where national_id = p_nid) then raise exception 'student_not_found'; end if;
  if not _unlocked(p_nid, p_lid) then raise exception 'lecture_locked'; end if;
  insert into watch_progress (national_id, lecture_id, part, position_sec, updated_at)
  values (p_nid, p_lid, greatest(p_part, 0), least(greatest(p_pos, 0), 36000), now())
  on conflict (national_id, lecture_id, part) do update set position_sec = excluded.position_sec, updated_at = now();
  return true;
end $$;

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
          (select coalesce(jsonb_object_agg(w.part::text, w.position_sec), '{}'::jsonb) from watch_progress w
            where w.national_id = s.national_id and w.lecture_id = l.id) as positions,
          (select max(a.percent) from attempts a where a.national_id = s.national_id and a.lecture_id = l.id and a.submitted_at is not null) as best,
          (select count(*) from attempts a where a.national_id = s.national_id and a.lecture_id = l.id and a.submitted_at is not null) as attempts_count
        from lectures l
      ) x), '[]'::jsonb)
  );
end $$;


grant execute on function save_position(text, int, int, int), student_portal(text) to anon, authenticated;

-- =====================================================================
-- تحديث ٥: القسمان (الكمي واللفظي)، واسم المنصة، وحفظ مكان التوقف بالثانية الفعلية
-- يتطلب تشغيل update-v4.sql قبله. شغّله مرة واحدة في Supabase → SQL Editor (لا يحذف أي بيانات)
-- =====================================================================
alter table lectures add column if not exists section text not null default 'quant';
alter table lectures drop constraint if exists lectures_section_chk;
alter table lectures add constraint lectures_section_chk check (section in ('quant', 'verbal'));
alter table watch_progress add column if not exists duration_sec int;

update settings set platform_name = 'التأسيس والتدريب لاختبار القدرات العامة'
 where id = 1 and (platform_name is null or platform_name in ('منصة إتقان', ''));
alter table settings alter column platform_name set default 'التأسيس والتدريب لاختبار القدرات العامة';

-- فتح المحاضرات داخل القسم نفسه فقط
create or replace function _unlocked(p_nid text, p_lid int) returns boolean
language plpgsql stable security definer set search_path = public as $$
declare m text; prev int; sec text;
begin
  select access_mode into m from settings where id = 1;
  if m = 'open' then return true; end if;
  select section into sec from lectures where id = p_lid;
  select max(id) into prev from lectures where id < p_lid and section = sec;
  if prev is null then return true; end if;
  if m = 'watch' then
    return exists (select 1 from views where national_id = p_nid and lecture_id = prev);
  end if;
  return _lecture_done(p_nid, prev);
end $$;

-- حفظ الثانية الفعلية التي وصل إليها المقطع، مع مدة المقطع
drop function if exists save_position(text, int, int, int);
create or replace function save_position(p_nid text, p_lid int, p_part int, p_pos int, p_dur int default null) returns boolean
language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from students where national_id = p_nid) then raise exception 'student_not_found'; end if;
  if not _unlocked(p_nid, p_lid) then raise exception 'lecture_locked'; end if;
  insert into watch_progress (national_id, lecture_id, part, position_sec, duration_sec, updated_at)
  values (p_nid, p_lid, greatest(p_part, 0), least(greatest(p_pos, 0), 36000), nullif(least(greatest(coalesce(p_dur, 0), 0), 36000), 0), now())
  on conflict (national_id, lecture_id, part) do update
    set position_sec = excluded.position_sec,
        duration_sec = coalesce(excluded.duration_sec, watch_progress.duration_sec),
        updated_at = now();
  return true;
end $$;

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
        select l.id, l.section, l.title, l.topic, l.parts, l.exam_mode,
          (select coalesce(jsonb_agg(jsonb_build_object('name', e->>'name', 'url', e->>'url')), '[]'::jsonb) from jsonb_array_elements(l.files) e) as files,
          (select count(*) from questions q where q.lecture_id = l.id and q.active) as question_count,
          exists (select 1 from views v where v.national_id = s.national_id and v.lecture_id = l.id) as watched,
          _lecture_done(s.national_id, l.id) as done,
          _unlocked(s.national_id, l.id) as unlocked,
          (select coalesce(jsonb_object_agg(w.part::text, w.position_sec), '{}'::jsonb) from watch_progress w
            where w.national_id = s.national_id and w.lecture_id = l.id) as positions,
          (select coalesce(jsonb_object_agg(w.part::text, w.duration_sec), '{}'::jsonb) from watch_progress w
            where w.national_id = s.national_id and w.lecture_id = l.id and w.duration_sec is not null) as durations,
          (select max(a.percent) from attempts a where a.national_id = s.national_id and a.lecture_id = l.id and a.submitted_at is not null) as best,
          (select count(*) from attempts a where a.national_id = s.national_id and a.lecture_id = l.id and a.submitted_at is not null) as attempts_count
        from lectures l
      ) x), '[]'::jsonb)
  );
end $$;



grant execute on function save_position(text, int, int, int, int), student_portal(text) to anon, authenticated;

-- ---------- بريد المعلم (غيّره إلى بريدك ثم شغّل السطر) ----------
-- insert into admins (email) values ('teacher@example.com') on conflict do nothing;
