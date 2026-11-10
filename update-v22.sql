-- =====================================================================
-- تحديث ٢٢: الطالب المستقل
-- حساب يضيفه المعلم وله خصائص الحساب التجريبي (لا يدخل في إحصاءات طلاب المدرسة)،
-- برقم هوية مولَّد من ٦ أرقام يستطيع الطالب تغييره مرة واحدة عند أول دخول.
-- شغّله مرة واحدة في Supabase → SQL Editor. لا يحذف أي بيانات.
-- =====================================================================
alter table students add column if not exists independent boolean not null default false;
alter table students add column if not exists id_locked  boolean not null default true;
alter table students add column if not exists created_at timestamptz default now();

-- تغيير رقم الهوية يجب أن ينتقل إلى كل الجداول المرتبطة (المحاولات، المشاهدات، الشهادات، النتائج...)
do $$
declare r record;
begin
  for r in
    select c.conname, c.conrelid::regclass as tbl, a.attname as col
    from pg_constraint c
    join pg_attribute a on a.attrelid = c.conrelid and a.attnum = c.conkey[1]
    where c.contype = 'f' and c.confrelid = 'students'::regclass and c.confupdtype <> 'c'
  loop
    execute format('alter table %s drop constraint %I', r.tbl, r.conname);
    execute format('alter table %s add constraint %I foreign key (%I) references students(national_id) on delete cascade on update cascade', r.tbl, r.conname, r.col);
  end loop;
end $$;

-- المعلم: إضافة طالب مستقل برقم مولَّد من ٦ أرقام
create or replace function admin_add_independent(p_name text, p_phone text default null)
returns text language plpgsql security definer set search_path = public as $$
declare v text; n int := 0;
begin
  if not is_admin() then raise exception 'not_admin'; end if;
  if coalesce(trim(p_name), '') = '' then raise exception 'name_required'; end if;
  if p_phone is not null and p_phone <> '' and p_phone !~ '^05[0-9]{8}$' then raise exception 'bad_phone'; end if;
  loop
    v := lpad((floor(random() * 900000) + 100000)::int::text, 6, '0');
    exit when not exists (select 1 from students where national_id = v);
    n := n + 1; if n > 50 then raise exception 'id_generation_failed'; end if;
  end loop;
  insert into students (national_id, full_name, school, is_test, independent, id_locked, phone, details)
  values (v, trim(p_name), admin_school(), true, true, false, nullif(p_phone, ''), '[{"k":"نوع الحساب","v":"طالب مستقل"}]'::jsonb);
  return v;
end $$;

-- المعلم: قائمة الطلاب المستقلين وإحصاءاتهم (منفصلة عن طلاب المدرسة)
create or replace function admin_independents()
returns table (national_id text, full_name text, phone text, id_locked boolean, created_at timestamptz,
               logins bigint, last_seen timestamptz, tests bigint, passed bigint, avg_pct int, watched bigint)
language sql stable security definer set search_path = public as $$
  select s.national_id, s.full_name, s.phone, s.id_locked, s.created_at,
         (select count(*) from sessions x where x.national_id = s.national_id),
         (select max(x.last_seen) from sessions x where x.national_id = s.national_id),
         (select count(*) from attempts a where a.national_id = s.national_id and a.submitted_at is not null),
         (select count(*) from attempts a where a.national_id = s.national_id and a.submitted_at is not null and a.passed),
         (select round(avg(a.percent))::int from attempts a where a.national_id = s.national_id and a.submitted_at is not null),
         (select count(*) from views w where w.national_id = s.national_id)
  from students s
  where is_admin() and s.independent and s.school = admin_school()
  order by s.created_at desc nulls last, s.full_name;
$$;

-- المعلم: تغيير رقم هوية طالب مستقل (أو إعادة فتح التغيير له)
create or replace function admin_set_independent_id(p_old text, p_new text, p_unlock boolean default false)
returns text language plpgsql security definer set search_path = public as $$
begin
  if not is_admin() then raise exception 'not_admin'; end if;
  if not exists (select 1 from students where national_id = p_old and independent and school = admin_school()) then raise exception 'student_not_found'; end if;
  if p_unlock then update students set id_locked = false where national_id = p_old; return p_old; end if;
  if p_new !~ '^[0-9]{1,20}$' then raise exception 'bad_id'; end if;
  if p_new <> p_old and exists (select 1 from students where national_id = p_new) then raise exception 'id_taken'; end if;
  update students set national_id = p_new where national_id = p_old;
  return p_new;
end $$;

-- الطالب: حالة رقم الهوية (هل هو مستقل ولم يعتمد رقمه بعد)
create or replace function student_id_status(p_nid text)
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object('independent', independent, 'locked', id_locked) from students where national_id = p_nid;
$$;

-- الطالب: تغيير رقمه مرة واحدة عند أول دخول، أو اعتماد الرقم الحالي
create or replace function student_change_id(p_old text, p_new text)
returns text language plpgsql security definer set search_path = public as $$
declare v_new text := coalesce(nullif(trim(p_new), ''), p_old);
begin
  if not exists (select 1 from students where national_id = p_old and independent and not id_locked) then raise exception 'id_change_not_allowed'; end if;
  if v_new !~ '^[0-9]{1,20}$' then raise exception 'bad_id'; end if;
  if v_new <> p_old and exists (select 1 from students where national_id = v_new) then raise exception 'id_taken'; end if;
  update students set national_id = v_new, id_locked = true where national_id = p_old;
  return v_new;
end $$;

grant execute on function admin_add_independent(text, text) to authenticated;
grant execute on function admin_independents() to authenticated;
grant execute on function admin_set_independent_id(text, text, boolean) to authenticated;
grant execute on function student_id_status(text) to anon, authenticated;
grant execute on function student_change_id(text, text) to anon, authenticated;
