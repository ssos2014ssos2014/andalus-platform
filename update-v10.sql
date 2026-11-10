-- =====================================================================
-- تحديث ١٠: رفع المقاطع مباشرة إلى المنصة (بدل Google Drive)
-- شغّله مرة واحدة في Supabase → SQL Editor
-- =====================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('lecture-videos', 'lecture-videos', true, 209715200, array['video/mp4', 'video/webm'])
on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists andalus_admin_files on storage.objects;
create policy andalus_admin_files on storage.objects for all to authenticated
  using (bucket_id in ('lecture-files', 'student-files', 'lecture-videos') and public.is_admin())
  with check (bucket_id in ('lecture-files', 'student-files', 'lecture-videos') and public.is_admin());

select id, public, file_size_limit from storage.buckets where id = 'lecture-videos';
