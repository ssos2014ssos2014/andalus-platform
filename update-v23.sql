-- =====================================================================
-- تحديث ٢٣: فصل بيانات المدرستين فصلًا تامًا
-- ١) لا يُضاف طالب/طالبة إلا لمدرسة حساب المعلم الحالي، ولا تتغير مدرسة طالب بأي تعديل أو استيراد.
-- ٢) أداة لإرجاع الطالبات اللاتي أُضفن خطأً إلى منصة الأندلس إلى منصة أسماء.
-- شغّله مرة واحدة في Supabase ← SQL Editor. لا يحذف أي بيانات.
-- =====================================================================

-- إلغاء القيمة الافتراضية: أي إضافة بلا مدرسة صريحة تُرفض بدل أن تذهب للأندلس تلقائيًا
alter table students alter column school drop default;

create or replace function students_school_guard() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    if new.school is null then
      if is_admin() then new.school := admin_school(); else raise exception 'school_required'; end if;
    end if;
    if is_admin() and new.school is distinct from admin_school() then raise exception 'wrong_school'; end if;
  elsif tg_op = 'UPDATE' then
    -- لا يغيّر أي تعديل أو استيراد مدرسة الطالب، إلا أداة النقل المخصصة
    if new.school is distinct from old.school and coalesce(current_setting('app.moving_school', true), '') <> '1' then
      new.school := old.school;
    end if;
  end if;
  return new;
end $$;

drop trigger if exists students_school_guard on students;
create trigger students_school_guard before insert or update on students
for each row execute function students_school_guard();

-- نقل طلاب من منصة المعلم الحالية إلى المنصة الأخرى (لتصحيح الأخطاء فقط)
create or replace function admin_move_students(p_ids text[], p_to text)
returns int language plpgsql security definer set search_path = public as $$
declare n int; me text := admin_school();
begin
  if not is_admin() then raise exception 'not_admin'; end if;
  if p_to not in ('andalus', 'asma') or p_to = me then raise exception 'bad_target'; end if;
  perform set_config('app.moving_school', '1', true);
  update students set school = p_to where national_id = any(p_ids) and school = me and not coalesce(is_test, false);
  get diagnostics n = row_count;
  -- الشهادات المحفوظة باسم المدرسة تنتقل معهم
  begin
    execute 'update certificates set school = $1 where national_id = any($2) and school = $3' using p_to, p_ids, me;
  exception when undefined_table or undefined_column then null;
  end;
  return n;
end $$;
grant execute on function admin_move_students(text[], text) to authenticated;

-- للمراجعة: عدد الطلاب في كل منصة
select school, count(*) from students group by school order by school;
