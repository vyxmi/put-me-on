-- Initial schema for Put Me On V1, per the approved docs/ARCHITECTURE.md
-- (§5 conceptual schema, §6 fields/constraints, §7 indexes, §8 RLS).
--
-- Not yet applied to any live project from this session (no DB credentials
-- available). Apply with `supabase db push` (linked to the target project)
-- or paste directly into the Supabase SQL editor. Run against
-- `put-me-on-dev` first per docs/ARCHITECTURE.md §14.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  handle text not null unique,
  display_name text,
  is_founder boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select
  using (auth.uid() = id);

-- Broadens row visibility (not columns — see the view below) so the
-- recipient picker can resolve other people's handle/display_name.
-- display_name is required not-null here specifically to exclude
-- anonymous/incomplete accounts, matching docs/ARCHITECTURE.md §5/§8.
create policy "profiles_select_public" on public.profiles
  for select
  using (display_name is not null);

-- Column-limited convenience view for the recipient picker. Note this is a
-- plain (security-invoker) view: the RLS policies above are what actually
-- gate which ROWS are visible; this view only narrows which COLUMNS the
-- picker query needs to select. A client could still query is_founder /
-- created_at directly from `profiles` for any row the policies above make
-- visible — acceptable for the friend beta per docs/V1_SCOPE.md §16
-- ("cheapest reasonable implementation" / "do not overbuild moderation
-- tooling"), since neither column is sensitive.
create view public.public_profiles as
  select id, handle, display_name
  from public.profiles
  where display_name is not null;

-- ---------------------------------------------------------------------------
-- tracks
-- ---------------------------------------------------------------------------

create table public.tracks (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  provider_track_id text not null,
  source_url text not null,
  title text,
  artist_display text,
  album text,
  artwork_url text,
  duration_ms integer,
  metadata_status text not null default 'pending' check (metadata_status in ('ok', 'failed', 'pending')),
  metadata_fetched_at timestamptz,
  created_at timestamptz not null default now(),
  unique (provider, provider_track_id)
);

alter table public.tracks enable row level security;

create policy "tracks_select_authenticated" on public.tracks
  for select
  to authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- recommendations
-- ---------------------------------------------------------------------------

create table public.recommendations (
  id uuid primary key default gen_random_uuid(),
  public_id text not null unique,
  sender_id uuid not null references public.profiles (id),
  recipient_type text not null check (recipient_type in ('registered', 'guest')),
  recipient_user_id uuid references public.profiles (id),
  recipient_guest_name text,
  track_id uuid not null references public.tracks (id),
  note text,
  source_recommendation_id uuid references public.recommendations (id),
  idempotency_key text,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  constraint recommendations_recipient_shape check (
    (recipient_type = 'registered' and recipient_user_id is not null and recipient_guest_name is null)
    or
    (recipient_type = 'guest' and recipient_guest_name is not null and recipient_user_id is null)
  ),
  unique (sender_id, idempotency_key)
);

create index recommendations_sender_id_idx on public.recommendations (sender_id);
create index recommendations_recipient_user_id_idx on public.recommendations (recipient_user_id);
create index recommendations_source_recommendation_id_idx on public.recommendations (source_recommendation_id);
create index recommendations_track_id_idx on public.recommendations (track_id);

alter table public.recommendations enable row level security;

create policy "recommendations_select_own" on public.recommendations
  for select
  using (auth.uid() = sender_id or auth.uid() = recipient_user_id);

-- No insert/update/delete policy for anon/authenticated: every write goes
-- through a Server Action using the service-role client in
-- src/lib/supabase/admin.ts, per docs/ARCHITECTURE.md §8/§11/§12.

-- ---------------------------------------------------------------------------
-- responses
-- ---------------------------------------------------------------------------

create table public.responses (
  id uuid primary key default gen_random_uuid(),
  recommendation_id uuid not null unique references public.recommendations (id),
  response_type text not null check (response_type in ('already_knew', 'not_for_me', 'liked_it', 'put_me_on')),
  responder_user_id uuid not null references public.profiles (id),
  response_origin text not null check (response_origin in ('guest', 'authenticated')),
  identity_assurance text not null check (identity_assurance in ('none', 'recipient_confirmed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index responses_responder_user_id_idx on public.responses (responder_user_id);

alter table public.responses enable row level security;

create policy "responses_select_related" on public.responses
  for select
  using (
    auth.uid() = responder_user_id
    or exists (
      select 1
      from public.recommendations r
      where r.id = responses.recommendation_id
        and (r.sender_id = auth.uid() or r.recipient_user_id = auth.uid())
    )
  );

-- No insert/update/delete policy here either — submitResponse/editResponse
-- are Server Actions using the service-role client (docs/ARCHITECTURE.md §11).
