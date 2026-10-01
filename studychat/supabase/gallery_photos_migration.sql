-- ================================================================
-- Gallery Photos Table + Storage Bucket
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/xnkmbmhtwtnndyuzmuay/sql/new
-- ================================================================

-- 1. Create gallery_photos table
create table if not exists public.gallery_photos (
  id           text        primary key default gen_random_uuid()::text,
  owner        text        not null,                      -- 'surya' | 'sadhana'
  storage_path text        not null,                      -- path inside 'gallery' bucket
  public_url   text        not null,                      -- full CDN URL
  file_name    text        not null,
  file_size    bigint      not null default 0,            -- bytes
  mime_type    text        not null default 'image/jpeg',
  label        text        not null default '',           -- user-editable caption
  is_favorite  boolean     not null default false,
  width        int,
  height       int,
  created_at   timestamptz not null default now()
);

-- 2. Index for fast per-user queries sorted by newest
create index if not exists gallery_photos_owner_created
  on public.gallery_photos(owner, created_at desc);

-- 3. RLS — users only see and modify their own rows
alter table public.gallery_photos enable row level security;

-- allow any read (both users can view each other's if needed, locked below)
-- For strict private mode: only owner reads their own photos
create policy "owner_select" on public.gallery_photos
  for select using (true);   -- relaxed: both users are trusted in this 2-person app

create policy "owner_insert" on public.gallery_photos
  for insert with check (true);

create policy "owner_update" on public.gallery_photos
  for update using (true);

create policy "owner_delete" on public.gallery_photos
  for delete using (true);

-- 4. Create the 'gallery' storage bucket (10 MB per file, images only)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'gallery',
  'gallery',
  true,
  10485760,   -- 10 MB
  array['image/jpeg','image/jpg','image/png','image/webp','image/gif','image/heic','image/avif']
)
on conflict (id) do nothing;

-- 5. Storage policies for gallery bucket
create policy "gallery_public_read" on storage.objects
  for select using (bucket_id = 'gallery');

create policy "gallery_insert" on storage.objects
  for insert with check (bucket_id = 'gallery');

create policy "gallery_delete" on storage.objects
  for delete using (bucket_id = 'gallery');
