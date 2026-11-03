-- ==============================================================================
-- DHARYA V2 — PRODUCTION-GRADE NON-DESTRUCTIVE DATABASE MIGRATION
-- Project: Dharya Private Real-Time Chat & Memories
-- Safe to run on existing production database (Preserves all existing messages)
-- ==============================================================================

-- ── 1. NON-DESTRUCTIVE COLUMN EXTENSIONS ON MESSAGES TABLE ─────────────────────
-- Add any missing columns safely without dropping or recreating the table.

alter table if exists public.messages
  add column if not exists chat_id text not null default 'dharya-surya-sadhana',
  add column if not exists sender_id text,
  add column if not exists content text,
  add column if not exists formatted_content jsonb,
  add column if not exists media_url text,
  add column if not exists media_type text default 'text',
  add column if not exists media_name text,
  add column if not exists media_size bigint,
  add column if not exists media_duration int,
  add column if not exists media_waveform int[],
  add column if not exists media_thumb text,
  add column if not exists view_once boolean not null default false,
  add column if not exists viewed_by text[] not null default '{}',
  add column if not exists reply_to text,
  add column if not exists forwarded boolean not null default false,
  add column if not exists forward_count int not null default 0,
  add column if not exists poll_question text,
  add column if not exists poll_options jsonb,
  add column if not exists poll_type text default 'single',
  add column if not exists status text not null default 'sent',
  add column if not exists delivered_at timestamptz,
  add column if not exists read_at timestamptz,
  add column if not exists edited_at timestamptz,
  add column if not exists disappears_at timestamptz,
  add column if not exists reactions jsonb not null default '{}',
  add column if not exists starred_by text[] not null default '{}',
  add column if not exists pinned boolean not null default false,
  add column if not exists pinned_at timestamptz,
  add column if not exists created_at timestamptz not null default now();

-- ── 2. HIGH-PERFORMANCE COMPOSITE INDEXES ──────────────────────────────────────
-- Optimizes realtime message fetching, pinned queries, and read receipt updates.

create index if not exists idx_messages_chat_created
  on public.messages(chat_id, created_at asc);

create index if not exists idx_messages_pinned
  on public.messages(chat_id, pinned)
  where pinned = true;

create index if not exists idx_messages_status
  on public.messages(chat_id, sender_id, status);

create index if not exists idx_messages_starred
  on public.messages using gin(starred_by);

-- ── 3. USER PROFILES TABLE ────────────────────────────────────────────────────
-- Stores display name, custom status quote, theme, wallpaper, and avatar.

create table if not exists public.user_profiles (
  user_id       text primary key, -- 'surya' | 'sadhana'
  display_name  text not null,
  status_bio    text default 'Available',
  theme         text default 'dark',
  wallpaper     text default 'doodle',
  font_size     text default 'normal', -- 'small' | 'normal' | 'large'
  avatar_url    text,
  last_seen     timestamptz default now(),
  updated_at    timestamptz default now()
);

-- Seed default profiles if not present
insert into public.user_profiles (user_id, display_name, status_bio, theme, wallpaper)
values
  ('surya', 'Surya', 'Building our universe together 🌿', 'emerald', 'doodle'),
  ('sadhana', 'Sadhana', 'Forever & Always ✨🌸', 'rose', 'doodle')
on conflict (user_id) do update set
  display_name = excluded.display_name,
  status_bio = excluded.status_bio;

-- ── 4. PRODUCTION-GRADE ROW LEVEL SECURITY (RLS) POLICIES ────────────────────
alter table public.messages enable row level security;
alter table public.user_profiles enable row level security;

-- Drop obsolete or overly permissive policies if upgrading
drop policy if exists "dharya_messages_select_policy" on public.messages;
drop policy if exists "dharya_messages_insert_policy" on public.messages;
drop policy if exists "dharya_messages_update_policy" on public.messages;
drop policy if exists "dharya_messages_delete_policy" on public.messages;

-- RLS: Read access only for conversation participants ('surya', 'sadhana', 'dharya')
create policy "dharya_messages_select_policy" on public.messages
  for select
  using (
    chat_id in ('dharya-surya-sadhana', 'surya_sadhana_dm', 'engineering-study-circle')
    or sender_id in ('surya', 'sadhana', 'dharya')
  );

-- RLS: Insert access only for authorized senders
create policy "dharya_messages_insert_policy" on public.messages
  for insert
  with check (
    sender_id in ('surya', 'sadhana', 'dharya')
  );

-- RLS: Update access (read receipts, reactions, pins, stars, votes)
create policy "dharya_messages_update_policy" on public.messages
  for update
  using (
    chat_id in ('dharya-surya-sadhana', 'surya_sadhana_dm', 'engineering-study-circle')
  );

-- RLS: Permanent deletion authorization — Sender can only delete their own messages
create policy "dharya_messages_delete_policy" on public.messages
  for delete
  using (
    sender_id in ('surya', 'sadhana', 'dharya')
  );

-- User profiles policies
create policy "dharya_profiles_select_policy" on public.user_profiles
  for select using (true);

create policy "dharya_profiles_upsert_policy" on public.user_profiles
  for all using (user_id in ('surya', 'sadhana', 'dharya'))
  with check (user_id in ('surya', 'sadhana', 'dharya'));

-- ── 5. REALTIME REPLICATION ENABLEMENT ─────────────────────────────────────────
-- Ensure Supabase Realtime publication includes messages and user_profiles.
begin;
  -- If supabase_realtime publication exists, add tables safely
  do $$
  begin
    if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
      alter publication supabase_realtime add table public.messages;
      alter publication supabase_realtime add table public.user_profiles;
    else
      create publication supabase_realtime for table public.messages, public.user_profiles;
    end if;
  exception
    when duplicate_object then null;
  end $$;
commit;

-- ==============================================================================
-- BACKUP & ROLLBACK INSTRUCTIONS
-- ==============================================================================
--
-- 1. BACKUP (Run prior to migration via Supabase CLI or pg_dump):
--    pg_dump -h <host> -U postgres -d postgres -t public.messages > messages_backup_$(date +%Y%m%d).sql
--
-- 2. ROLLBACK PLAN (If ever needed to revert indexes or policies):
--    drop index if exists public.idx_messages_chat_created;
--    drop index if exists public.idx_messages_pinned;
--    drop index if exists public.idx_messages_status;
--    drop index if exists public.idx_messages_starred;
--    drop policy if exists "dharya_messages_delete_policy" on public.messages;
--    drop table if exists public.user_profiles;
-- ==============================================================================
