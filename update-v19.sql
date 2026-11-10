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
