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
