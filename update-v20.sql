-- =====================================================================
-- تحديث ٢٠: فحص وتصحيح مدرسة الطلاب والطالبات
-- لا يُحذف أي طالب أو طالبة؛ الأسماء التي «اختفت» موجودة لكنها مسجلة على المدرسة الأخرى
-- =====================================================================

-- (١) الفحص: كل دفعة استيراد مع مدرستها ووقتها وعددها وأمثلة من أسمائها
select school as "المدرسة", to_char(date_trunc('minute', created_at), 'YYYY-MM-DD HH24:MI') as "وقت الاستيراد",
       count(*) as "العدد", left(string_agg(full_name, ' ، ' order by full_name), 300) as "أمثلة من الأسماء"
from students where not is_test
group by 1, 2 order by 2;

-- (٢) حسابات المعلمين ومدارسهم
select email, school, can_switch, active_school from admins order by school, email;
