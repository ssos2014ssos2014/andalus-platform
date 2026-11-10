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

-- =====================================================================
-- تحديث ٦: إلغاء «تمت المشاهدة» ليعيد الطالب المحاضرة
-- شغّله مرة واحدة في Supabase → SQL Editor
-- =====================================================================
create or replace function unmark_watched(p_nid text, p_lid int) returns boolean
language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from students where national_id = p_nid) then raise exception 'student_not_found'; end if;
  delete from views where national_id = p_nid and lecture_id = p_lid;
  return true;
end $$;
grant execute on function unmark_watched(text, int) to anon, authenticated;

update lectures set exam_mode = 'generated', topic = 'قسمة الأعداد العشرية والضرب والقسمة على قوى العشرة' where id = 2;

-- =====================================================================
-- تحديث ٧: تفعيل الاختبار المحاكي للمحاضرة 2 وإضافة عنوانها
-- شغّله مرة واحدة في Supabase → SQL Editor
-- =====================================================================
update lectures
   set exam_mode = 'generated',
       topic = 'قسمة الأعداد العشرية والضرب والقسمة على قوى العشرة'
 where id = 2;


-- =====================================================================
-- تحديث ٨: حساب الطالب التجريبي (٠٠٠٠) للمعلم، واستبعاده من الإحصاءات،
--           وتصفير الطالب 1150307070 ليبدأ من جديد
-- شغّله مرة واحدة في Supabase → SQL Editor
-- =====================================================================
alter table students add column if not exists is_test boolean not null default false;

insert into students (national_id, full_name, details, is_test)
values ('0000', 'طالب تجريبي (حساب المعلم)', '[{"k": "ملاحظة", "v": "حساب تجربة لا يدخل في إحصاءات الطلاب"}]'::jsonb, true)
on conflict (national_id) do update set is_test = true, full_name = excluded.full_name;

-- لوحة المؤشرات بدون حساب التجربة، مع إحصاءاته منفصلة
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
    from students s where not s.is_test)
  select jsonb_build_object(
    'students', (select count(*) from st),
    'active',   (select count(*) from st where logins > 0),
    'with_phone', (select count(*) from students where phone is not null and not is_test),
    'logins',   (select coalesce(sum(logins), 0) from st),
    'seconds',  (select coalesce(sum(seconds), 0) from st),
    'tests',    (select coalesce(sum(tests), 0) from st),
    'avg',      (select round(avg(a.percent)) from attempts a join students s using (national_id) where a.submitted_at is not null and not s.is_test),
    'today',    (select count(distinct x.national_id) from sessions x join students s using (national_id) where x.started_at >= date_trunc('day', now()) and not s.is_test),
    'test',     (select _student_stats('0000')),
    'top_logins',   (select coalesce(jsonb_agg(to_jsonb(t)), '[]') from (select * from st where logins > 0 order by logins desc, seconds desc limit 10) t),
    'top_time',     (select coalesce(jsonb_agg(to_jsonb(t)), '[]') from (select * from st where seconds > 0 order by seconds desc limit 10) t),
    'top_tests',    (select coalesce(jsonb_agg(to_jsonb(t)), '[]') from (select * from st where tests > 0 order by tests desc, avg desc limit 10) t),
    'top_scores',   (select coalesce(jsonb_agg(to_jsonb(t)), '[]') from (select * from st where tests > 0 order by avg desc, tests desc limit 10) t),
    'low_scores',   (select coalesce(jsonb_agg(to_jsonb(t)), '[]') from (select * from st where tests > 0 order by avg asc, tests desc limit 10) t)
  ) into r;
  return r;
end $$;


grant execute on function admin_dashboard() to authenticated;


-- =====================================================================
-- تحديث ٩: عناوين المحاضرات ٣–٦ وتفعيل الاختبار المحاكي لها
-- شغّله مرة واحدة في Supabase → SQL Editor
-- =====================================================================
update lectures set exam_mode = 'generated', topic = 'قابلية القسمة والأعداد الأولية' where id = 3;
update lectures set exam_mode = 'generated', topic = 'الجذور: خصائصها وتبسيطها والمقارنة بينها' where id = 4;
update lectures set exam_mode = 'generated', topic = 'الأشكال الرباعية: المربع والمستطيل والمعين ومتوازي الأضلاع وشبه المنحرف' where id = 5;
update lectures set exam_mode = 'generated', topic = 'الزوجي والفردي، المتوسط، المثلث، الزوايا، الاحتمالات، الدوائر والسرعات' where id = 6;


-- =====================================================================
-- تحديث ١٠: رفع المقاطع مباشرة إلى المنصة (بدل Google Drive)
-- شغّله مرة واحدة في Supabase → SQL Editor
-- =====================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('lecture-videos', 'lecture-videos', true, 209715200, array['video/mp4', 'video/webm'])
on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists andalus_admin_files on storage.objects;
create policy andalus_admin_files on storage.objects for all to authenticated
  using (bucket_id in ('lecture-files', 'student-files', 'lecture-videos') and public.is_admin())
  with check (bucket_id in ('lecture-files', 'student-files', 'lecture-videos') and public.is_admin());


-- =====================================================================
-- تحديث ١١: التحويل التلقائي إلى مقاطع Google Drive حتى نهاية الشهر لتجنب أي تكاليف إضافية
-- شغّله مرة واحدة في Supabase → SQL Editor
-- =====================================================================
alter table settings add column if not exists video_mode text not null default 'auto';  -- auto | direct | drive
alter table settings add column if not exists drive_until date;                       -- حتى هذا التاريخ تُعرض مقاطع Drive

create table if not exists video_failures (
  id bigint generated always as identity primary key,
  national_id text not null,
  at timestamptz not null default now()
);
alter table video_failures enable row level security;
drop policy if exists teacher_all on video_failures;
create policy teacher_all on video_failures for all to authenticated using (is_admin()) with check (is_admin());

-- يبلّغ عنه متصفح الطالب إذا تعذر تشغيل المقطع المرفوع.
-- إذا تعذر عند ٥ طلاب مختلفين خلال ساعة (غالبًا بسبب الوصول لحد الاستهلاك) تتحول المنصة إلى Drive حتى بداية الشهر القادم.
create or replace function video_failed(p_nid text) returns boolean
language plpgsql security definer set search_path = public as $$
declare n int; m text; u date;
begin
  if not exists (select 1 from students where national_id = p_nid) then return false; end if;
  insert into video_failures (national_id) values (p_nid);
  delete from video_failures where at < now() - interval '2 days';
  select count(distinct national_id) into n from video_failures where at > now() - interval '1 hour';
  
-- =====================================================================
-- تحديث ١٢: عنوان المحاضرة ٧ وتفعيل الاختبار المحاكي لها
-- =====================================================================
update lectures set exam_mode = 'generated', topic = 'النسبة والنسبة المئوية والمتتابعات وخانة الآحاد والتباديل' where id = 7;

-- =====================================================================
-- تحديث ١٤: اختبار محاكي للمحاضرة الأولى في القسم اللفظي
-- =====================================================================
update lectures set exam_mode = 'generated', topic = 'التناظر اللفظي، إكمال الجمل، الخطأ السياقي، استيعاب المقروء' where id = 1001;

-- =====================================================================
-- تحديث ١٥: اختبارات محاكية للمحاضرات ٢ و٣ و٤ في القسم اللفظي
-- =====================================================================
update lectures set exam_mode = 'generated', topic = 'التناظر والإكمال والخطأ السياقي، ونصوص: القراءة الجهرية، الزعفران، الاحتكاك' where id = 1002;
update lectures set exam_mode = 'generated', topic = 'التناظر والإكمال والخطأ السياقي، ونصوص: الجمل، التغافل، الطحالب' where id = 1003;
update lectures set exam_mode = 'generated', topic = 'التناظر والإكمال والخطأ السياقي، ونصوص: فقر الأطفال، تناقص السكان، كسوة الكعبة' where id = 1004;

-- ---------- بريد المعلم (غيّره إلى بريدك ثم شغّل السطر) ----------
-- insert into admins (email) values ('teacher@example.com') on conflict do nothing;

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

-- =====================================================================
-- تحديث ١٧: الاختبارات التي ينشئها المعلم (ورقي/محوسب) + الاستعلام عن النتيجة برقم الهوية
-- =====================================================================
create table if not exists custom_exams (
  id         uuid primary key default gen_random_uuid(),
  code       text not null unique,
  title      text not null,
  school     text not null default 'andalus',
  delivery   text not null default 'computer',   -- computer | paper
  level      int  not null default 0,
  config     jsonb not null default '{}'::jsonb,
  sections   jsonb not null,
  is_open    boolean not null default true,
  created_at timestamptz not null default now()
);
create table if not exists custom_results (
  id           uuid primary key default gen_random_uuid(),
  exam_id      uuid not null references custom_exams(id) on delete cascade,
  national_id  text not null references students(national_id) on delete cascade,
  answers      jsonb not null,
  score        int not null, total int not null, percent int not null,
  source       text not null default 'computer',
  submitted_at timestamptz not null default now(),
  unique (exam_id, national_id)
);
alter table custom_exams enable row level security;
alter table custom_results enable row level security;
drop policy if exists teacher_all on custom_exams;   create policy teacher_all on custom_exams   for all to authenticated using (is_admin()) with check (is_admin());
drop policy if exists teacher_all on custom_results; create policy teacher_all on custom_results for all to authenticated using (is_admin()) with check (is_admin());

-- الأسئلة للطالب دون الإجابات الصحيحة
create or replace function custom_exam_get(p_code text, p_nid text) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare e custom_exams; s students; done boolean;
begin
  select * into e from custom_exams where code = upper(p_code);
  if e.id is null then raise exception 'exam_not_found'; end if;
  select * into s from students where national_id = p_nid;
  if s.national_id is null then raise exception 'student_not_found'; end if;
  done := exists (select 1 from custom_results r where r.exam_id = e.id and r.national_id = p_nid);
  return jsonb_build_object('title', e.title, 'code', e.code, 'delivery', e.delivery, 'is_open', e.is_open, 'done', done,
    'student', s.full_name, 'school', s.school,
    'sections', case when done or not e.is_open or e.delivery <> 'computer' then '[]'::jsonb else (
      select jsonb_agg(jsonb_build_object('name', x.s->'name', 'subject', x.s->'subject', 'minutes', x.s->'minutes',
        'questions', (select jsonb_agg(jsonb_build_object('body', q.q->'body', 'options', q.q->'options') order by q.o) from jsonb_array_elements(x.s->'questions') with ordinality q(q, o))) order by x.o)
      from jsonb_array_elements(e.sections) with ordinality x(s, o)) end);
end $$;
grant execute on function custom_exam_get(text, text) to anon, authenticated;

-- التسليم: التصحيح يتم في الخادم
create or replace function custom_exam_submit(p_code text, p_nid text, p_answers jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare e custom_exams; sc int := 0; tot int := 0; si int := 0; qi int; sec jsonb; q jsonb; a jsonb;
begin
  select * into e from custom_exams where code = upper(p_code);
  if e.id is null then raise exception 'exam_not_found'; end if;
  if not e.is_open then raise exception 'exam_closed'; end if;
  if not exists (select 1 from students where national_id = p_nid) then raise exception 'student_not_found'; end if;
  if exists (select 1 from custom_results where exam_id = e.id and national_id = p_nid) then raise exception 'already_submitted'; end if;
  for sec in select value from jsonb_array_elements(e.sections) loop
    qi := 0;
    for q in select value from jsonb_array_elements(sec->'questions') loop
      tot := tot + 1; a := p_answers -> si -> qi;
      if a is not null and jsonb_typeof(a) = 'number' and (a)::int = (q->>'correct')::int then sc := sc + 1; end if;
      qi := qi + 1;
    end loop;
    si := si + 1;
  end loop;
  insert into custom_results (exam_id, national_id, answers, score, total, percent)
  values (e.id, p_nid, p_answers, sc, tot, case when tot > 0 then round(sc * 100.0 / tot) else 0 end);
  return jsonb_build_object('score', sc, 'total', tot, 'percent', case when tot > 0 then round(sc * 100.0 / tot) else 0 end);
end $$;
grant execute on function custom_exam_submit(text, text, jsonb) to anon, authenticated;

-- الاستعلام عن النتيجة برقم الهوية: يعيد الاختبار كاملًا مع الإجابات والشرح بعد وجود نتيجة
create or replace function custom_result(p_code text, p_nid text) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare e custom_exams; r custom_results; s students;
begin
  select * into e from custom_exams where code = upper(p_code);
  if e.id is null then raise exception 'exam_not_found'; end if;
  select * into s from students where national_id = p_nid;
  if s.national_id is null then raise exception 'student_not_found'; end if;
  select * into r from custom_results where exam_id = e.id and national_id = p_nid;
  if r.id is null then raise exception 'no_result'; end if;
  return jsonb_build_object('title', e.title, 'code', e.code, 'level', e.level, 'student', s.full_name, 'school', s.school,
    'sections', e.sections, 'answers', r.answers, 'score', r.score, 'total', r.total, 'percent', r.percent, 'submitted_at', r.submitted_at);
end $$;
grant execute on function custom_result(text, text) to anon, authenticated;

-- =====================================================================
-- تحديث ١٨: فصل منصة ثانوية أسماء بنت أبي بكر عن منصة ثانوية الأندلس
-- المحتوى (المحاضرات والاختبارات والأسئلة والإعدادات) مشترك،
-- أما الطلاب/الطالبات والنتائج والإحصاءات والشهادات والاختبارات المنشأة فلكل مدرسة على حدة.
-- يعتمد على update-v16.sql و update-v17.sql
-- =====================================================================
alter table students add column if not exists school text not null default 'andalus';
alter table admins   add column if not exists school text not null default 'andalus';

-- مدرسة المعلم الحالي
create or replace function admin_school() returns text
language sql stable security definer set search_path = public as $$
  select coalesce((select school from admins where lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')) limit 1), 'andalus');
$$;
grant execute on function admin_school() to authenticated;
create or replace function is_super() returns boolean
language sql stable security definer set search_path = public as $$ select is_admin() and admin_school() = 'andalus'; $$;
grant execute on function is_super() to authenticated;

-- مدرسة الطالب (لصفحة الطالب)
create or replace function student_school(p_nid text) returns text
language sql stable security definer set search_path = public as $$ select school from students where national_id = trim(p_nid); $$;
grant execute on function student_school(text) to anon, authenticated;

-- حساب الطالبة التجريبي لمنصة أسماء
insert into students (national_id, full_name, details, is_test, school)
values ('0001', 'طالبة تجريبية (حساب المعلمة)', '[{"k":"ملاحظة","v":"حساب تجربة لا يدخل في إحصاءات الطالبات"}]'::jsonb, true, 'asma')
on conflict (national_id) do update set school = 'asma', is_test = true;

-- ---------- الصلاحيات حسب المدرسة ----------
drop policy if exists teacher_all on students;
create policy teacher_all on students for all to authenticated using (is_admin() and school = admin_school()) with check (is_admin() and school = admin_school());

do $$
declare t text;
begin
  foreach t in array array['attempts','views','sessions','watch_progress','student_files','certificates'] loop
    execute format('drop policy if exists teacher_all on %I', t);
    execute format('create policy teacher_all on %I for all to authenticated using (is_admin() and exists (select 1 from students s where s.national_id = %I.national_id and s.school = admin_school())) with check (is_admin() and exists (select 1 from students s where s.national_id = %I.national_id and s.school = admin_school()))', t, t, t);
  end loop;
end $$;

drop policy if exists teacher_all on custom_exams;
create policy teacher_all on custom_exams for all to authenticated using (is_admin() and school = admin_school()) with check (is_admin() and school = admin_school());
drop policy if exists teacher_all on custom_results;
create policy teacher_all on custom_results for all to authenticated
  using (is_admin() and exists (select 1 from custom_exams e where e.id = custom_results.exam_id and e.school = admin_school()))
  with check (is_admin() and exists (select 1 from custom_exams e where e.id = custom_results.exam_id and e.school = admin_school()));

-- المحتوى المشترك: يقرؤه الجميع، ويعدّله معلمو ثانوية الأندلس فقط (حتى لا تتعارض التحديثات)
do $$
declare t text;
begin
  foreach t in array array['lectures','questions','settings'] loop
    execute format('drop policy if exists teacher_all on %I', t);
    execute format('drop policy if exists teacher_read on %I', t);
    execute format('create policy teacher_read on %I for select to authenticated using (is_admin())', t);
    execute format('create policy teacher_all on %I for all to authenticated using (is_super()) with check (is_super())', t);
  end loop;
end $$;

-- ---------- لوحة المؤشرات حسب المدرسة ----------
create or replace function admin_dashboard() returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare r jsonb; sch text := admin_school(); tid text := case when admin_school() = 'asma' then '0001' else '0000' end;
begin
  if not is_admin() then raise exception 'not_admin'; end if;
  with st as (
    select s.national_id, s.full_name, s.phone,
      (select count(*) from sessions x where x.national_id = s.national_id) as logins,
      (select coalesce(sum(seconds), 0) from sessions x where x.national_id = s.national_id) as seconds,
      (select count(*) from attempts a where a.national_id = s.national_id and a.submitted_at is not null) as tests,
      (select round(avg(percent)) from attempts a where a.national_id = s.national_id and a.submitted_at is not null) as avg
    from students s where not s.is_test and s.school = sch)
  select jsonb_build_object(
    'students', (select count(*) from st),
    'active',   (select count(*) from st where logins > 0),
    'with_phone', (select count(*) from students where phone is not null and not is_test and school = sch),
    'logins',   (select coalesce(sum(logins), 0) from st),
    'seconds',  (select coalesce(sum(seconds), 0) from st),
    'tests',    (select coalesce(sum(tests), 0) from st),
    'avg',      (select round(avg(a.percent)) from attempts a join students s using (national_id) where a.submitted_at is not null and not s.is_test and s.school = sch),
    'today',    (select count(distinct x.national_id) from sessions x join students s using (national_id) where x.started_at >= date_trunc('day', now()) and not s.is_test and s.school = sch),
    'test',     (select _student_stats(tid)),
    'top_logins',   (select coalesce(jsonb_agg(to_jsonb(t)), '[]') from (select * from st where logins > 0 order by logins desc, seconds desc limit 10) t),
    'top_time',     (select coalesce(jsonb_agg(to_jsonb(t)), '[]') from (select * from st where seconds > 0 order by seconds desc limit 10) t),
    'top_tests',    (select coalesce(jsonb_agg(to_jsonb(t)), '[]') from (select * from st where tests > 0 order by tests desc, avg desc limit 10) t),
    'top_scores',   (select coalesce(jsonb_agg(to_jsonb(t)), '[]') from (select * from st where tests > 0 order by avg desc, tests desc limit 10) t),
    'low_scores',   (select coalesce(jsonb_agg(to_jsonb(t)), '[]') from (select * from st where tests > 0 order by avg asc, tests desc limit 10) t)
  ) into r;
  return r;
end $$;
grant execute on function admin_dashboard() to authenticated;

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
  from students s where coalesce(s.is_test, false) = false and s.school = admin_school()
  order by 6 desc, 5 desc, 2;
end $$;
grant execute on function admin_cert_stats() to authenticated;

-- ---------- الاختبارات المنشأة: لا تدخلها إلا طالبات/طلاب مدرستها ----------
create or replace function custom_exam_get(p_code text, p_nid text) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare e custom_exams; s students; done boolean;
begin
  select * into e from custom_exams where code = upper(p_code);
  if e.id is null then raise exception 'exam_not_found'; end if;
  select * into s from students where national_id = p_nid and school = e.school;
  if s.national_id is null then raise exception 'student_not_found'; end if;
  done := exists (select 1 from custom_results r where r.exam_id = e.id and r.national_id = p_nid);
  return jsonb_build_object('title', e.title, 'code', e.code, 'delivery', e.delivery, 'is_open', e.is_open, 'done', done,
    'student', s.full_name, 'school', s.school,
    'sections', case when done or not e.is_open or e.delivery <> 'computer' then '[]'::jsonb else (
      select jsonb_agg(jsonb_build_object('name', x.s->'name', 'subject', x.s->'subject', 'minutes', x.s->'minutes',
        'questions', (select jsonb_agg(jsonb_build_object('body', q.q->'body', 'options', q.q->'options') order by q.o) from jsonb_array_elements(x.s->'questions') with ordinality q(q, o))) order by x.o)
      from jsonb_array_elements(e.sections) with ordinality x(s, o)) end);
end $$;

create or replace function custom_exam_submit(p_code text, p_nid text, p_answers jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare e custom_exams; sc int := 0; tot int := 0; si int := 0; qi int; sec jsonb; q jsonb; a jsonb;
begin
  select * into e from custom_exams where code = upper(p_code);
  if e.id is null then raise exception 'exam_not_found'; end if;
  if not e.is_open then raise exception 'exam_closed'; end if;
  if not exists (select 1 from students where national_id = p_nid and school = e.school) then raise exception 'student_not_found'; end if;
  if exists (select 1 from custom_results where exam_id = e.id and national_id = p_nid) then raise exception 'already_submitted'; end if;
  for sec in select value from jsonb_array_elements(e.sections) loop
    qi := 0;
    for q in select value from jsonb_array_elements(sec->'questions') loop
      tot := tot + 1; a := p_answers -> si -> qi;
      if a is not null and jsonb_typeof(a) = 'number' and (a)::int = (q->>'correct')::int then sc := sc + 1; end if;
      qi := qi + 1;
    end loop;
    si := si + 1;
  end loop;
  insert into custom_results (exam_id, national_id, answers, score, total, percent)
  values (e.id, p_nid, p_answers, sc, tot, case when tot > 0 then round(sc * 100.0 / tot) else 0 end);
  return jsonb_build_object('score', sc, 'total', tot, 'percent', case when tot > 0 then round(sc * 100.0 / tot) else 0 end);
end $$;

create or replace function custom_result(p_code text, p_nid text) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare e custom_exams; r custom_results; s students;
begin
  select * into e from custom_exams where code = upper(p_code);
  if e.id is null then raise exception 'exam_not_found'; end if;
  select * into s from students where national_id = p_nid and school = e.school;
  if s.national_id is null then raise exception 'student_not_found'; end if;
  select * into r from custom_results where exam_id = e.id and national_id = p_nid;
  if r.id is null then raise exception 'no_result'; end if;
  return jsonb_build_object('title', e.title, 'code', e.code, 'level', e.level, 'student', s.full_name, 'school', s.school,
    'sections', e.sections, 'answers', r.answers, 'score', r.score, 'total', r.total, 'percent', r.percent, 'submitted_at', r.submitted_at);
end $$;

-- =====================================================================
-- إضافة حساب معلمة لثانوية أسماء (بعد إنشاء المستخدم في Authentication → Users):
-- insert into admins (email, school) values ('asma-teacher@example.com', 'asma');
-- =====================================================================

-- =====================================================================
-- تحديث ١٩: حساب يدير المنصتين (مثل حساب مشرف المنصة) + معلومات حساب المعلم
-- =====================================================================
alter table admins add column if not exists can_switch boolean not null default false;
alter table admins add column if not exists active_school text;

-- المدرسة الفعلية للحساب الآن: المنصة التي فتحها (لمن يدير المنصتين) أو مدرسته الأصلية
create or replace function admin_school() returns text
language sql stable security definer set search_path = public as $$
  select coalesce((select case when a.can_switch and a.active_school in ('andalus', 'asma') then a.active_school else a.school end
                   from admins a where lower(a.email) = lower(coalesce(auth.jwt() ->> 'email', '')) limit 1), 'andalus');
$$;
grant execute on function admin_school() to authenticated;

create or replace function admin_info() returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object('school', admin_school(), 'home', a.school, 'can_switch', a.can_switch)
  from admins a where lower(a.email) = lower(coalesce(auth.jwt() ->> 'email', '')) limit 1;
$$;
grant execute on function admin_info() to authenticated;

create or replace function admin_switch_school(p_school text) returns text
language plpgsql security definer set search_path = public as $$
begin
  if p_school not in ('andalus', 'asma') then raise exception 'bad_school'; end if;
  update admins set active_school = p_school
   where lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')) and can_switch;
  if not found then raise exception 'not_allowed'; end if;
  return p_school;
end $$;
grant execute on function admin_switch_school(text) to authenticated;

-- منح حساب صلاحية إدارة المنصتين (ضع البريد الصحيح):
-- update admins set can_switch = true where email = 'ssos2014ssos2014@gmail.com';

-- =====================================================================
-- تحديث ٢٠: إصلاح اختلاط الطلاب بين المنصتين
-- (١) مدرسة المعلم تُحدَّد من الصفحة المفتوحة في كل طلب، لا من آخر منصة فُتحت
-- (٢) أدوات فحص وتصحيح مدرسة الطلاب/الطالبات
-- =====================================================================
create or replace function admin_school() returns text
language plpgsql stable security definer set search_path = public as $$
declare a admins; hdr text;
begin
  select * into a from admins where lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')) limit 1;
  if a.email is null then return 'andalus'; end if;
  if a.can_switch then
    begin hdr := current_setting('request.headers', true)::json ->> 'x-school'; exception when others then hdr := null; end;
    if hdr in ('andalus', 'asma') then return hdr; end if;
  end if;
  return a.school;
end $$;
grant execute on function admin_school() to authenticated;

-- =====================================================================
