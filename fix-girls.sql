-- =====================================================================
-- إصلاح استيراد طالبات ثانوية أسماء
-- السبب: يوجد في قاعدة البيانات قيد باسم "sch_isolate" ليس من ملفات المنصة الحالية
-- (أُضيف من تجربة سابقة)، وهو يتعارض مع نظام الفصل الحالي فيمنع الاستيراد.
-- الفصل بين المنصتين مضمون بقيود المنصة نفسها (teacher_all)، فلا حاجة لهذا القيد.
-- شغّل الملف كاملًا مرة واحدة.
-- =====================================================================

-- (١) حفظ نسخة من القيود الغريبة قبل إزالتها (للرجوع إليها عند الحاجة)
create table if not exists _removed_policies as
  select now() as removed_at, schemaname, tablename, policyname, permissive, cmd, qual, with_check
  from pg_policies where false;
insert into _removed_policies
  select now(), schemaname, tablename, policyname, permissive, cmd, qual, with_check
  from pg_policies where policyname = 'sch_isolate';

-- (٢) إزالة القيد من كل الجداول الموجود عليها
do $$
declare r record;
begin
  for r in select schemaname, tablename from pg_policies where policyname = 'sch_isolate' loop
    execute format('drop policy if exists sch_isolate on %I.%I', r.schemaname, r.tablename);
  end loop;
end $$;

-- (٣) نقل كل الطالبات المسجلات خطأً على الأندلس إلى أسماء
--     (أسماء الطالبات في كشوف نور تحتوي «بنت»، وأسماء الطلاب «بن»)
update students set school = 'asma'
where not is_test and school <> 'asma' and full_name like '% بنت %';

-- (٤) للتأكد: عدد الطلاب والطالبات في كل منصة، وأي قيود متبقية على جدول الطلاب
select school as "المنصة", count(*) as "العدد",
       count(*) filter (where full_name like '% بنت %') as "أسماء فيها «بنت»"
from students where not is_test group by school;

select policyname, permissive, cmd from pg_policies where tablename = 'students';
