-- ============================================================
-- Dharya Chat — Supabase Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- ── Extensions ────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── Enums ─────────────────────────────────────────────────
create type message_status as enum ('sending','sent','delivered','read');
create type media_type      as enum ('image','video','audio','document');

-- ── profiles (mirrors auth.users) ─────────────────────────
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  display_name  text not null,
  avatar_url    text,
  last_seen     timestamptz default now(),
  theme         text default 'dark',       -- 'dark' | 'light'
  created_at    timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "profiles: owner can read/write"
  on public.profiles for all
  using  (auth.uid() = id)
  with check (auth.uid() = id);
-- partner can read our profile
create policy "profiles: partner can read"
  on public.profiles for select
  using (
    exists (
      select 1 from public.chat_members cm
      where cm.user_id = auth.uid()
        and cm.chat_id in (
          select chat_id from public.chat_members where user_id = profiles.id
        )
    )
  );

-- ── chats ─────────────────────────────────────────────────
create table public.chats (
  id          uuid primary key default uuid_generate_v4(),
  created_at  timestamptz default now()
);
alter table public.chats enable row level security;
create policy "chats: members can read"
  on public.chats for select
  using (
    exists (
      select 1 from public.chat_members
      where chat_id = chats.id and user_id = auth.uid()
    )
  );

-- ── chat_members ──────────────────────────────────────────
create table public.chat_members (
  chat_id   uuid references public.chats(id) on delete cascade,
  user_id   uuid references auth.users(id)   on delete cascade,
  primary key (chat_id, user_id)
);
alter table public.chat_members enable row level security;
create policy "chat_members: own rows"
  on public.chat_members for select
  using (user_id = auth.uid());
create policy "chat_members: insert own"
  on public.chat_members for insert
  with check (user_id = auth.uid());

-- ── messages ──────────────────────────────────────────────
create table public.messages (
  id            uuid primary key default uuid_generate_v4(),
  chat_id       uuid not null references public.chats(id) on delete cascade,
  sender_id     uuid not null references auth.users(id),
  content       text,
  media_url     text,
  media_type    media_type,
  media_caption text,
  reply_to_id   uuid references public.messages(id),
  status        message_status not null default 'sent',
  delivered_at  timestamptz,
  read_at       timestamptz,
  edited_at     timestamptz,
  deleted_for   uuid[] default '{}',
  view_once     boolean default false,
  viewed        boolean default false,
  created_at    timestamptz default now()
);
alter table public.messages enable row level security;
create policy "messages: chat members can read"
  on public.messages for select
  using (
    exists (
      select 1 from public.chat_members
      where chat_id = messages.chat_id and user_id = auth.uid()
    )
    and not (auth.uid() = any(deleted_for))
  );
create policy "messages: sender can insert"
  on public.messages for insert
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.chat_members
      where chat_id = messages.chat_id and user_id = auth.uid()
    )
  );
create policy "messages: members can update (status, reactions, delete)"
  on public.messages for update
  using (
    exists (
      select 1 from public.chat_members
      where chat_id = messages.chat_id and user_id = auth.uid()
    )
  );

-- ── reactions ─────────────────────────────────────────────
create table public.reactions (
  id          uuid primary key default uuid_generate_v4(),
  message_id  uuid not null references public.messages(id) on delete cascade,
  user_id     uuid not null references auth.users(id),
  emoji       text not null,
  created_at  timestamptz default now(),
  unique(message_id, user_id)   -- one reaction per user per message
);
alter table public.reactions enable row level security;
create policy "reactions: chat members can read"
  on public.reactions for select
  using (
    exists (
      select 1 from public.messages m
      join  public.chat_members cm on cm.chat_id = m.chat_id
      where m.id = reactions.message_id and cm.user_id = auth.uid()
    )
  );
create policy "reactions: own reactions"
  on public.reactions for all
  using  (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ── chat_settings ─────────────────────────────────────────
create table public.chat_settings (
  chat_id       uuid references public.chats(id) on delete cascade,
  user_id       uuid references auth.users(id),
  wallpaper_url text,
  muted_until   timestamptz,
  primary key (chat_id, user_id)
);
alter table public.chat_settings enable row level security;
create policy "chat_settings: own rows"
  on public.chat_settings for all
  using  (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ── invite_codes (pairing) ────────────────────────────────
create table public.invite_codes (
  code       text primary key,
  owner_id   uuid not null references auth.users(id),
  chat_id    uuid references public.chats(id),
  used_by    uuid references auth.users(id),
  created_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '24 hours')
);
alter table public.invite_codes enable row level security;
create policy "invite_codes: anyone can read unexpired"
  on public.invite_codes for select
  using (expires_at > now() and used_by is null);
create policy "invite_codes: owner can insert"
  on public.invite_codes for insert
  with check (owner_id = auth.uid());
create policy "invite_codes: owner can update"
  on public.invite_codes for update
  using (owner_id = auth.uid() or auth.uid() is not null);

-- ── Full-text search index on messages ───────────────────
create index messages_fts_idx
  on public.messages
  using gin(to_tsvector('english', coalesce(content,'')));

-- ── Realtime ─────────────────────────────────────────────
-- Enable Realtime for these tables in the Supabase Dashboard:
-- Supabase → Database → Replication → Tables → toggle:
--   messages, reactions, profiles, chat_settings
-- Or run:
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime for table
    public.messages,
    public.reactions,
    public.profiles,
    public.chat_settings;
commit;

-- ── Storage buckets ──────────────────────────────────────
-- Run these in the Supabase Dashboard → Storage → New Bucket
-- OR via API. Schema shown for reference:
--   bucket: "chat-media"   (private, authenticated access)
--   allowed MIME types: image/*, video/*, audio/*, application/pdf, etc.
-- RLS on objects:
insert into storage.buckets (id, name, public) values ('chat-media', 'chat-media', false)
  on conflict do nothing;

create policy "chat-media: authenticated users can upload"
  on storage.objects for insert
  with check (bucket_id = 'chat-media' and auth.role() = 'authenticated');

create policy "chat-media: authenticated users can read"
  on storage.objects for select
  using (bucket_id = 'chat-media' and auth.role() = 'authenticated');

create policy "chat-media: owner can delete"
  on storage.objects for delete
  using (bucket_id = 'chat-media' and auth.uid()::text = (storage.foldername(name))[1]);
