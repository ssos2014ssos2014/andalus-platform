-- =====================================================================
-- تحديث ٨: حساب الطالب التجريبي (٠٠٠٠) للمعلم، واستبعاده من الإحصاءات،
--           وتصفير الطالب 1150307070 ليبدأ من جديد
-- شغّله مرة واحدة في Supabase → SQL Editor
-- =====================================================================
alter table students add column if not exists is_test boolean not null default false;

insert into students (national_id, full_name, details, is_test)
values ('0000', 'طالب تجريبي (حساب المعلم)', '[{"k": "ملاحظة", "v": "حساب تجربة لا يدخل في إحصاءات الطلاب"}]'::jsonb, true)
on conflict (national_id) do update set is_test = true, full_name = excluded.full_name;

-- تصفير الطالب 1150307070: حذف محاولاته ومشاهداته ودخوله وأماكن توقفه ورقم الجوال
delete from attempts       where national_id = '1150307070';
delete from views          where national_id = '1150307070';
delete from sessions       where national_id = '1150307070';
delete from watch_progress where national_id = '1150307070';
update students set phone = null where national_id = '1150307070';

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

select national_id, full_name, phone, is_test,
       (select count(*) from attempts a where a.national_id = s.national_id) as "محاولات"
from students s where national_id in ('0000', '1150307070');
