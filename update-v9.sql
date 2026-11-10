-- =====================================================================
-- تحديث ٩: عناوين المحاضرات ٣–٦ وتفعيل الاختبار المحاكي لها
-- شغّله مرة واحدة في Supabase → SQL Editor
-- =====================================================================
update lectures set exam_mode = 'generated', topic = 'قابلية القسمة والأعداد الأولية' where id = 3;
update lectures set exam_mode = 'generated', topic = 'الجذور: خصائصها وتبسيطها والمقارنة بينها' where id = 4;
update lectures set exam_mode = 'generated', topic = 'الأشكال الرباعية: المربع والمستطيل والمعين ومتوازي الأضلاع وشبه المنحرف' where id = 5;
update lectures set exam_mode = 'generated', topic = 'الزوجي والفردي، المتوسط، المثلث، الزوايا، الاحتمالات، الدوائر والسرعات' where id = 6;

select id, topic, exam_mode from lectures where id between 1 and 6 order by id;
