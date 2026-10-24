-- =====================================================================
-- تحديث ١١: التحويل التلقائي إلى مقاطع Google Drive حتى نهاية الشهر لتجنب أي تكاليف إضافية
-- شغّله مرة واحدة في Supabase → SQL Editor
-- =====================================================================
alter table settings add column if not exists video_mode text not null default 'auto';  -- auto | direct | drive
alter table settings add column if not exists drive_until date;                       -- حتى هذا التاريخ تُعرض مقاطع Drive

create table if not exists video_failures (
  id bigint generated always as identity primary key,
  national_id text not null,
  at timestamptz not null default now()
);
alter table video_failures enable row level security;
drop policy if exists teacher_all on video_failures;
create policy teacher_all on video_failures for all to authenticated using (is_admin()) with check (is_admin());

-- يبلّغ عنه متصفح الطالب إذا تعذر تشغيل المقطع المرفوع.
-- إذا تعذر عند ٥ طلاب مختلفين خلال ساعة (غالبًا بسبب الوصول لحد الاستهلاك) تتحول المنصة إلى Drive حتى بداية الشهر القادم.
create or replace function video_failed(p_nid text) returns boolean
language plpgsql security definer set search_path = public as $$
declare n int; m text; u date;
begin
  if not exists (select 1 from students where national_id = p_nid) then return false; end if;
  insert into video_failures (national_id) values (p_nid);
  delete from video_failures where at < now() - interval '2 days';
  select count(distinct national_id) into n from video_failures where at > now() - interval '1 hour';
  select video_mode, drive_until into m, u from settings where id = 1;
  if n >= 5 and m = 'auto' and (u is null or u <= current_date) then
    update settings set drive_until = (date_trunc('month', now()) + interval '1 month')::date where id = 1;
    return true;
  end if;
  return false;
end $$;

create or replace function public_settings() returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object('platform_name', platform_name, 'school_name', school_name, 'course_name', course_name, 'pass_mark', pass_mark,
                            'access_mode', access_mode, 'video_mode', video_mode, 'drive_until', drive_until, 'today', current_date)
  from settings where id = 1;
$$;
grant execute on function video_failed(text), public_settings() to anon, authenticated;

select video_mode, drive_until from settings where id = 1;
