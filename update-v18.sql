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
