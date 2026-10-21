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
