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
