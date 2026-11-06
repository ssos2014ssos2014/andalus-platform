-- =====================================================================
-- update-schools.sql — تعدد المدارس في منصة القدرات
-- المحاضرات والأسئلة والإعدادات مشتركة، والطلاب والنتائج معزولة لكل مدرسة.
-- قبل التشغيل: أنشئ حساب المعلمة من Authentication > Users > Add user
-- بالبريد الموجود في السطر v_email أدناه (فعّل Auto Confirm User).
-- الملف آمن لإعادة التشغيل.
-- =====================================================================

-- 1) المدارس وحسابات معلميها
create table if not exists public.schools (
  id text primary key,
  name text not null,
  created_at timestamptz default now()
);
insert into public.schools (id, name) values
  ('andalus', 'ثانوية الأندلس بترقش'),
  ('asma',    'ثانوية أسماء بنت أبي بكر')
on conflict (id) do update set name = excluded.name;
alter table public.schools enable row level security;
drop policy if exists schools_read on public.schools;
create policy schools_read on public.schools for select using (true);

-- أي حساب معلم غير مذكور هنا يُعامل كحساب الأندلس (حساباتك الحالية والدخول المباشر)
create table if not exists public.school_admins (
  email text primary key,
  school_id text not null references public.schools(id)
);
alter table public.school_admins enable row level security; -- بلا سياسات: تُقرأ عبر الدوال فقط

-- 2) ربط كل طالب بمدرسته (الطلاب الحاليون كلهم للأندلس)
alter table public.students add column if not exists school_id text not null default 'andalus' references public.schools(id);
create index if not exists students_school_idx on public.students (school_id);

-- 3) الدوال
create or replace function public.my_school() returns text
language sql stable security definer set search_path = public as $$
  select coalesce(
    (select school_id from public.school_admins
      where email = lower(coalesce(auth.jwt() ->> 'email', ''))),
    'andalus')
$$;
grant execute on function public.my_school() to authenticated;

-- مدرسة الطالب لعرض اسمها وشعارها بعد دخوله
create or replace function public.student_school(p_nid text) returns text
language sql stable security definer set search_path = public as $$
  select school_id from public.students where national_id::text = p_nid
$$;
grant execute on function public.student_school(text) to anon, authenticated;

-- أرقام هوية مسجلة في مدرسة أخرى (تُستبعد عند الاستيراد)
create or replace function public.foreign_student_ids(p_ids text[]) returns text[]
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'not_admin'; end if;
  return coalesce((select array_agg(national_id::text) from public.students
                    where national_id::text = any (p_ids) and school_id <> public.my_school()), '{}');
end $$;
grant execute on function public.foreign_student_ids(text[]) to authenticated;

-- الطالب الجديد يُسجل تلقائيًا في مدرسة المعلم الذي استورده
create or replace function public.students_set_school() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null then new.school_id := public.my_school(); end if;
  return new;
end $$;
drop trigger if exists students_set_school on public.students;
create trigger students_set_school before insert on public.students
  for each row execute function public.students_set_school();

-- 4) العزل في قاعدة البيانات (سياسات RLS)
do $$
declare
  t text;
  per_student text[] := array['attempts', 'views', 'sessions', 'watch_progress', 'student_files'];
  shared text[] := array['lectures', 'questions', 'settings'];
  rls boolean;
begin
  foreach t in array array['students'] || per_student || shared loop
    if to_regclass('public.' || t) is null then
      raise notice 'الجدول % غير موجود — تخطيت', t; continue;
    end if;
    select relrowsecurity into rls from pg_class where oid = ('public.' || t)::regclass;
    if not rls then
      -- كان الجدول بلا RLS: نفعّلها مع إبقاء الصلاحيات كما كانت، ثم نضيف قيود المدارس
      execute format('alter table public.%I enable row level security', t);
      execute format('drop policy if exists sch_keep_anon on public.%I', t);
      execute format('create policy sch_keep_anon on public.%I for all to anon using (true) with check (true)', t);
      execute format('drop policy if exists sch_keep_auth on public.%I', t);
      execute format('create policy sch_keep_auth on public.%I for all to authenticated using (true) with check (true)', t);
    end if;
    -- صلاحية المعلم (تضمن عمل لوحة المؤشرات بعد تحويلها أدناه)
    if t = 'students' or t = any (per_student) then
      execute format('drop policy if exists sch_admin_all on public.%I', t);
      execute format('create policy sch_admin_all on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t);
    end if;
  end loop;

  -- الطلاب: كل معلم يرى طلاب مدرسته فقط
  execute 'drop policy if exists sch_isolate on public.students';
  execute 'create policy sch_isolate on public.students as restrictive for all to authenticated
           using (school_id = public.my_school()) with check (school_id = public.my_school())';

  -- المحاولات والمشاهدات والدخول والملفات: تتبع مدرسة الطالب
  foreach t in array per_student loop
    if to_regclass('public.' || t) is null then continue; end if;
    if not exists (select 1 from information_schema.columns
                    where table_schema = 'public' and table_name = t and column_name = 'national_id') then
      raise notice 'الجدول % بلا عمود national_id — تخطيت', t; continue;
    end if;
    execute format('drop policy if exists sch_isolate on public.%I', t);
    execute format('create policy sch_isolate on public.%I as restrictive for all to authenticated
      using (exists (select 1 from public.students s where s.national_id = %I.national_id and s.school_id = public.my_school()))
      with check (exists (select 1 from public.students s where s.national_id = %I.national_id and s.school_id = public.my_school()))', t, t, t);
  end loop;

  -- المحتوى المشترك: يقرؤه الجميع، ويعدّله حساب الأندلس فقط
  foreach t in array shared loop
    if to_regclass('public.' || t) is null then continue; end if;
    execute format('drop policy if exists sch_owner_ins on public.%I', t);
    execute format('create policy sch_owner_ins on public.%I as restrictive for insert to authenticated with check (public.my_school() = ''andalus'')', t);
    execute format('drop policy if exists sch_owner_upd on public.%I', t);
    execute format('create policy sch_owner_upd on public.%I as restrictive for update to authenticated using (public.my_school() = ''andalus'') with check (public.my_school() = ''andalus'')', t);
    execute format('drop policy if exists sch_owner_del on public.%I', t);
    execute format('create policy sch_owner_del on public.%I as restrictive for delete to authenticated using (public.my_school() = ''andalus'')', t);
  end loop;
end $$;

-- مخازن الفيديو وملفات المحاضرات: التعديل لحساب الأندلس فقط
do $$
begin
  drop policy if exists sch_owner_storage_ins on storage.objects;
  create policy sch_owner_storage_ins on storage.objects as restrictive for insert to authenticated
    with check (bucket_id not in ('lecture-videos', 'lecture-files') or public.my_school() = 'andalus');
  drop policy if exists sch_owner_storage_upd on storage.objects;
  create policy sch_owner_storage_upd on storage.objects as restrictive for update to authenticated
    using (bucket_id not in ('lecture-videos', 'lecture-files') or public.my_school() = 'andalus');
  drop policy if exists sch_owner_storage_del on storage.objects;
  create policy sch_owner_storage_del on storage.objects as restrictive for delete to authenticated
    using (bucket_id not in ('lecture-videos', 'lecture-files') or public.my_school() = 'andalus');
exception when others then
  raise notice 'تعذر إضافة سياسات التخزين (%). الواجهة تخفي المحاضرات عن حساب المعلمة على أي حال.', sqlerrm;
end $$;

-- 5) لوحة المؤشرات تُحسب بصلاحية المعلم نفسه، فتعرض أرقام مدرسته فقط
-- (للتراجع: alter function public.admin_dashboard() security definer;)
do $$
begin
  alter function public.admin_dashboard() security invoker;
exception when others then
  raise notice 'تعذر تعديل admin_dashboard (%)', sqlerrm;
end $$;

-- 6) حساب معلمة ثانوية أسماء بنت أبي بكر
do $$
declare
  v_email text := 'asma.teacher@andalus-platform.app';   -- ← غيّره إن أنشأت الحساب ببريد آخر
  v_uid uuid;
  cols text[];
  ins_cols text[] := '{}';
  ins_vals text[] := '{}';
  id_type text;
begin
  v_email := lower(v_email);
  select id into v_uid from auth.users where lower(email) = v_email;
  if v_uid is null then
    raise exception 'لم أجد الحساب %. أنشئه أولًا من Authentication > Users > Add user ثم أعد تشغيل الملف.', v_email;
  end if;

  insert into public.school_admins (email, school_id) values (v_email, 'asma')
  on conflict (email) do update set school_id = 'asma';

  select array_agg(column_name::text) into cols
    from information_schema.columns where table_schema = 'public' and table_name = 'admins';
  select data_type into id_type
    from information_schema.columns where table_schema = 'public' and table_name = 'admins' and column_name = 'id';

  if 'user_id' = any (cols) then ins_cols := array_append(ins_cols, 'user_id'); ins_vals := array_append(ins_vals, quote_literal(v_uid::text)); end if;
  if 'email'   = any (cols) then ins_cols := array_append(ins_cols, 'email'); ins_vals := array_append(ins_vals, quote_literal(v_email)); end if;
  if not ('user_id' = any (cols)) and id_type = 'uuid' then ins_cols := array_append(ins_cols, 'id'); ins_vals := array_append(ins_vals, quote_literal(v_uid::text)); end if;
  if array_length(ins_cols, 1) is null then
    raise exception 'لم أتعرف على أعمدة جدول admins: %', cols;
  end if;

  execute format('insert into public.admins (%s) select %s where not exists (select 1 from public.admins where %I::text = %s)',
    array_to_string(ins_cols, ', '),
    array_to_string(array(select v || '::' || (select udt_name from information_schema.columns
                                               where table_schema = 'public' and table_name = 'admins' and column_name = c)
                           from unnest(ins_vals, ins_cols) as x(v, c)), ', '),
    ins_cols[1], ins_vals[1]);
  raise notice 'تم: حساب % مرتبط بثانوية أسماء بنت أبي بكر.', v_email;
end $$;

-- 7) تحقق سريع
select s.id as school, s.name, count(st.national_id) as students
  from public.schools s left join public.students st on st.school_id = s.id
 group by s.id, s.name order by s.id;
