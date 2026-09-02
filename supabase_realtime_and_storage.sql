-- ================================================================
-- Run this SECOND SQL in Supabase SQL Editor
-- https://supabase.com/dashboard/project/xnkmbmhtwtnndyuzmuay/sql/new
-- ================================================================

-- 1. Enable Realtime on messages table
alter publication supabase_realtime add table public.messages;

-- 2. Create chat-media storage bucket (public for direct URL access)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'chat-media',
  'chat-media',
  true,
  52428800,   -- 50 MB limit
  array['image/*','video/*','audio/*','application/pdf','application/zip',
        'application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain']
)
on conflict (id) do nothing;

-- 3. Storage policies (allow all authenticated-ish access since this is a private 2-person app)
create policy "public_read" on storage.objects
  for select using (bucket_id = 'chat-media');

create policy "public_insert" on storage.objects
  for insert with check (bucket_id = 'chat-media');

create policy "public_update" on storage.objects
  for update using (bucket_id = 'chat-media');

create policy "public_delete" on storage.objects
  for delete using (bucket_id = 'chat-media');
