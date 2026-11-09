-- =====================================================================
-- تحديث ٢١: تحليل نتائج التدريب في لوحة المعلم
-- يعيد محاولات اختبارات المحاضرات لطلاب مدرسة المعلم فقط، مع ملخص المهارات لكل محاولة
-- (دون إرسال نصوص الأسئلة كاملة، حتى تبقى الصفحة سريعة).
-- شغّله مرة واحدة في Supabase → SQL Editor. لا يحذف ولا يغيّر أي بيانات.
-- =====================================================================
create or replace function admin_training_attempts(p_lecture int default null, p_nid text default null, p_days int default null)
returns table (id uuid, national_id text, full_name text, phone text, lecture_id int, mode text, score int, total int, percent int,
               passed boolean, duration_sec int, submitted_at timestamptz, skills jsonb)
language sql stable security definer set search_path = public as $$
  select a.id, a.national_id, s.full_name, s.phone, a.lecture_id, a.mode, a.score, a.total, a.percent, a.passed, a.duration_sec, a.submitted_at,
         case when a.mode = 'generated' and jsonb_typeof(a.items) = 'array' then (
           select jsonb_object_agg(x.k, jsonb_build_array(x.ok, x.n))
           from (select coalesce(e->>'skill', '?') as k,
                        count(*) filter (where (e->>'chosen') is not null and (e->>'chosen') = (e->>'correct')) as ok,
                        count(*) as n
                 from jsonb_array_elements(a.items) e group by 1) x) end
  from attempts a
  join students s on s.national_id = a.national_id
  where is_admin()
    and s.school = admin_school()
    and not coalesce(s.is_test, false)
    and a.submitted_at is not null
    and (p_lecture is null or a.lecture_id = p_lecture)
    and (p_nid is null or a.national_id = p_nid)
    and (p_days is null or a.submitted_at >= now() - make_interval(days => p_days))
  order by a.submitted_at desc
  limit 20000;
$$;
grant execute on function admin_training_attempts(int, text, int) to authenticated;
