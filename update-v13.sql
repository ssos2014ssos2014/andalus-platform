-- =====================================================================
-- تحديث ١٣: حساب الدخول المباشر من «نظام إدارة ثانوية الأندلس» إلى لوحة المعلم
-- قبل تشغيله: أنشئ المستخدم من Authentication → Users → Add user → Create new user
--   البريد: portal@andalus-school.sa  وكلمة المرور كما في الرسالة، وفعّل Auto Confirm User
-- =====================================================================
insert into admins (email) values ('portal@andalus-school.sa') on conflict do nothing;

-- إن أنشأت المستخدم دون تأكيد البريد، هذا السطر يؤكده:
update auth.users set email_confirmed_at = coalesce(email_confirmed_at, now()) where email = 'portal@andalus-school.sa';

select email, email_confirmed_at is not null as "مؤكد" from auth.users where email = 'portal@andalus-school.sa';
