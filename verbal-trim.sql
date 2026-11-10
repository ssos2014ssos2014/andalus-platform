-- =====================================================================
-- القسم اللفظي: الإبقاء على المحاضرات ١–٢٤ فقط، وحذف ٢٥–٣٥
-- (تُحذف معها مشاهداتها واختباراتها وأماكن التوقف وملفاتها إن وُجدت)
-- =====================================================================
delete from watch_progress where lecture_id between 1025 and 1099;
delete from views          where lecture_id between 1025 and 1099;
delete from attempts       where lecture_id between 1025 and 1099;
delete from questions      where lecture_id between 1025 and 1099;
delete from lectures       where id between 1025 and 1099 and section = 'verbal';

-- للتأكد: يجب أن يظهر ٢٤
select count(*) as "محاضرات اللفظي المتبقية" from lectures where section = 'verbal';
