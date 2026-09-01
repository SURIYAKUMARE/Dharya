-- =========================================================
-- Dharya Chat — Supabase SQL Setup
-- Run this in: Supabase Dashboard → SQL Editor → Run
-- =========================================================

-- 1. Create the messages table
create table if not exists public.messages (
  id              text        primary key default gen_random_uuid()::text,
  chat_id         text        not null default 'dharya-surya-sadhana',
  sender_id       text        not null,   -- 'dharya' or 'sadhana'
  content         text,
  status          text        not null default 'sent',
  reply_to        text        references public.messages(id) on delete set null,
  reactions       jsonb       not null default '{}',
  edited_at       timestamptz,
  deleted_for     text[]      not null default '{}',
  deleted_for_all boolean     not null default false,
  created_at      timestamptz not null default now()
);

-- 2. Index for fast ordered queries
create index if not exists messages_chat_created
  on public.messages (chat_id, created_at asc);

-- 3. Enable Row Level Security (open access since this is a 2-person private app)
alter table public.messages enable row level security;

-- Allow all operations (both users share one table, no auth needed)
create policy "allow_all" on public.messages
  for all using (true) with check (true);

-- 4. Enable Realtime on this table
-- Go to: Supabase Dashboard → Database → Replication
-- Toggle ON the "messages" table under "Source"
-- OR run:
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime for table public.messages;
commit;

-- =========================================================
-- That's all! The chat app will now:
--   • INSERT rows when a message is sent
--   • Receive realtime events via Supabase channels
--   • UPDATE rows for read receipts, edits, reactions, deletes
-- =========================================================
