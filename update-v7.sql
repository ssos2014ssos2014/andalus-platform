-- =====================================================================
-- تحديث ٧: تفعيل الاختبار المحاكي للمحاضرة 2 وإضافة عنوانها
-- شغّله مرة واحدة في Supabase → SQL Editor
-- =====================================================================
update lectures
   set exam_mode = 'generated',
       topic = 'قسمة الأعداد العشرية والضرب والقسمة على قوى العشرة'
 where id = 2;

select id, title, topic, exam_mode from lectures where id in (1, 2) order by id;
