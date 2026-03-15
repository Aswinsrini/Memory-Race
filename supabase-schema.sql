-- ============================================================
-- MemoryRace — Supabase Schema
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- 1. Profiles (extends auth.users)
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  username    text unique not null,
  display_name text,
  avatar_url  text,
  games_played integer default 0,
  games_won   integer default 0,
  best_time_ms integer,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', 'player_' || substr(new.id::text, 1, 8)),
    coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'username', 'Player')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. Rooms
create table if not exists public.rooms (
  id          uuid primary key default gen_random_uuid(),
  code        text unique not null,
  status      text default 'waiting' check (status in ('waiting', 'playing', 'finished')),
  difficulty  text default 'medium' check (difficulty in ('easy', 'medium', 'hard')),
  max_players integer default 10,
  created_by  uuid references public.profiles(id),
  created_at  timestamptz default now(),
  started_at  timestamptz,
  finished_at timestamptz
);

alter table public.rooms enable row level security;

create policy "Rooms are viewable by everyone"
  on public.rooms for select using (true);

create policy "Authenticated users can create rooms"
  on public.rooms for insert with check (auth.uid() = created_by);

create policy "Room creator can update room"
  on public.rooms for update using (auth.uid() = created_by);

-- Also allow any authenticated user to update room status (for game flow)
create policy "Authenticated users can update room status"
  on public.rooms for update using (auth.uid() is not null);

-- 3. Room Players (who is in each room)
create table if not exists public.room_players (
  id            uuid primary key default gen_random_uuid(),
  room_id       uuid references public.rooms(id) on delete cascade,
  user_id       uuid references public.profiles(id) on delete cascade,
  status        text default 'waiting' check (status in ('waiting', 'ready', 'playing', 'finished', 'dnf')),
  matched_pairs integer default 0,
  total_pairs   integer default 0,
  moves         integer default 0,
  elapsed_ms    integer default 0,
  finish_rank   integer,
  joined_at     timestamptz default now(),
  finished_at   timestamptz,
  unique(room_id, user_id)
);

alter table public.room_players enable row level security;

create policy "Room players are viewable by everyone"
  on public.room_players for select using (true);

create policy "Users can join rooms"
  on public.room_players for insert with check (auth.uid() = user_id);

create policy "Users can update own room player record"
  on public.room_players for update using (auth.uid() = user_id);

create policy "Any auth user can update room_players"
  on public.room_players for update using (auth.uid() is not null);

create policy "Users can leave rooms"
  on public.room_players for delete using (auth.uid() = user_id);

-- 4. Game Results (historical record of completed games)
create table if not exists public.game_results (
  id            uuid primary key default gen_random_uuid(),
  room_id       uuid references public.rooms(id) on delete cascade,
  room_code     text not null,
  user_id       uuid references public.profiles(id) on delete cascade,
  username      text not null,
  difficulty    text not null,
  finish_rank   integer not null,
  total_players integer not null,
  matched_pairs integer not null,
  total_pairs   integer not null,
  moves         integer not null,
  elapsed_ms    integer not null,
  is_winner     boolean default false,
  created_at    timestamptz default now()
);

alter table public.game_results enable row level security;

create policy "Game results are viewable by everyone"
  on public.game_results for select using (true);

create policy "Authenticated users can insert game results"
  on public.game_results for insert with check (auth.uid() is not null);

-- 5. Indexes for performance
create index if not exists idx_rooms_status on public.rooms(status);
create index if not exists idx_rooms_code on public.rooms(code);
create index if not exists idx_room_players_room on public.room_players(room_id);
create index if not exists idx_room_players_user on public.room_players(user_id);
create index if not exists idx_game_results_user on public.game_results(user_id);
create index if not exists idx_game_results_room on public.game_results(room_id);

-- 6. Function to generate short room codes
create or replace function public.generate_room_code()
returns text as $$
declare
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text := '';
  i integer;
begin
  for i in 1..6 loop
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  end loop;
  return result;
end;
$$ language plpgsql;

-- 7. Enable Realtime on rooms and room_players
alter publication supabase_realtime add table public.rooms;
alter publication supabase_realtime add table public.room_players;
