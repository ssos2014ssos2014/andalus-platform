-- =====================================================================
-- تحديث ٦: إلغاء «تمت المشاهدة» ليعيد الطالب المحاضرة
-- شغّله مرة واحدة في Supabase → SQL Editor
-- =====================================================================
create or replace function unmark_watched(p_nid text, p_lid int) returns boolean
language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from students where national_id = p_nid) then raise exception 'student_not_found'; end if;
  delete from views where national_id = p_nid and lecture_id = p_lid;
  return true;
end $$;
grant execute on function unmark_watched(text, int) to anon, authenticated;
