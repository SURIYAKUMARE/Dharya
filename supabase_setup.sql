-- ================================================================
-- Dharya Chat — Full Schema (run in Supabase SQL Editor)
-- ================================================================

-- ── Messages table (drop & recreate for clean upgrade) ──────────
drop table if exists public.messages cascade;

create table public.messages (
  id               text        primary key default gen_random_uuid()::text,
  chat_id          text        not null default 'dharya-surya-sadhana',
  sender_id        text        not null,   -- 'dharya' | 'sadhana'

  -- content
  content          text,
  formatted_content jsonb,               -- [{type:'bold'|'italic'|'strike'|'mono'|'mention',text,start,end}]
  media_url        text,
  media_type       text,                 -- 'image'|'video'|'audio'|'document'|'sticker'|'gif'
  media_name       text,
  media_size       bigint,
  media_duration   int,                  -- seconds for audio/video
  media_waveform   int[],                -- amplitude samples for voice notes
  media_thumb      text,                 -- thumbnail URL for video
  view_once        boolean     not null default false,
  viewed_by        text[]      not null default '{}',

  -- reply / forward
  reply_to         text        references public.messages(id) on delete set null,
  forwarded        boolean     not null default false,
  forward_count    int         not null default 0,

  -- poll
  poll_question    text,
  poll_options     jsonb,               -- [{id,text,votes:[userIds]}]
  poll_type        text default 'single', -- 'single'|'multi'

  -- status
  status           text        not null default 'sent',
  delivered_at     timestamptz,
  read_at          timestamptz,

  -- lifecycle
  edited_at        timestamptz,
  disappears_at    timestamptz,         -- null = never
  deleted_for      text[]      not null default '{}',
  deleted_for_all  boolean     not null default false,

  -- engagement
  reactions        jsonb       not null default '{}',  -- {emoji:[userIds]}
  starred_by       text[]      not null default '{}',
  pinned           boolean     not null default false,
  pinned_at        timestamptz,

  created_at       timestamptz not null default now()
);

-- ── Indexes ─────────────────────────────────────────────────────
create index messages_chat_created on public.messages(chat_id, created_at asc);
create index messages_disappears   on public.messages(disappears_at) where disappears_at is not null;
create index messages_pinned       on public.messages(chat_id, pinned) where pinned = true;

-- ── RLS ─────────────────────────────────────────────────────────
alter table public.messages enable row level security;
create policy "allow_all" on public.messages
  for all using (true) with check (true);

-- ── Chat settings table ─────────────────────────────────────────
drop table if exists public.chat_settings cascade;
create table public.chat_settings (
  id                     text primary key default 'dharya-surya-sadhana',
  disappear_mode         text default 'off',   -- 'off'|'24h'|'7d'|'90d'
  pinned_message_id      text,
  -- per-user settings stored as json keyed by user id
  user_settings          jsonb not null default '{}'
  -- user_settings schema per user:
  -- { read_receipts: bool, last_seen: bool, chat_lock_hash: string|null,
  --   pin_verified_until: number, two_step_hash: string|null,
  --   starred_ids: string[] }
);
alter table public.chat_settings enable row level security;
create policy "allow_all_settings" on public.chat_settings
  for all using (true) with check (true);

-- Insert default row
insert into public.chat_settings(id) values ('dharya-surya-sadhana')
  on conflict(id) do nothing;

-- ── Realtime ─────────────────────────────────────────────────────
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime
    for table public.messages, public.chat_settings;
commit;

-- ── Cron: auto-delete disappeared messages (optional) ────────────
-- Requires pg_cron extension. Enable in Supabase Dashboard → Extensions.
-- select cron.schedule('delete-disappeared','*/5 * * * *',
--   $$delete from public.messages where disappears_at < now()$$);
