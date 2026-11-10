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
