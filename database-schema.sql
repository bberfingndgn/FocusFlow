-- ============================================================
-- FocusFlow - Supabase Database Schema (tam versiyon)
-- Supabase Dashboard > SQL Editor'da bir kez çalıştır
-- ============================================================

create extension if not exists "uuid-ossp";

-- ============================================================
-- USERS tablosu
-- ============================================================
create table if not exists public.users (
  id               uuid references auth.users(id) on delete cascade primary key,
  username         text,
  email            text,
  created_at       timestamptz default now(),
  total_study_time bigint  default 0,
  companion_clicks integer default 0,
  date_of_birth    date,
  parent_email     text,
  otp_code         text,
  otp_expires_at   timestamptz
);

-- ============================================================
-- STUDY_SESSIONS tablosu
-- ============================================================
create table if not exists public.study_sessions (
  id          uuid        default uuid_generate_v4() primary key,
  user_id     uuid        references public.users(id) on delete cascade not null,
  subject_id  text        not null,
  start_time  timestamptz not null,
  end_time    timestamptz not null,
  duration    integer     not null,  -- dakika cinsinden
  is_verified boolean     not null default false,
  created_at  timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.users          enable row level security;
alter table public.study_sessions enable row level security;

drop policy if exists "users_select_own"    on public.users;
drop policy if exists "users_insert_own"    on public.users;
drop policy if exists "users_update_own"    on public.users;
drop policy if exists "sessions_select_own" on public.study_sessions;
drop policy if exists "sessions_insert_own" on public.study_sessions;
drop policy if exists "sessions_update_own" on public.study_sessions;
drop policy if exists "sessions_delete_own" on public.study_sessions;

-- Users policies
create policy "users_select_own" on public.users
  for select using (auth.uid() = id);

create policy "users_insert_own" on public.users
  for insert with check (auth.uid() = id);

create policy "users_update_own" on public.users
  for update using (auth.uid() = id);

-- Study sessions policies
create policy "sessions_select_own" on public.study_sessions
  for select using (auth.uid() = user_id);

create policy "sessions_insert_own" on public.study_sessions
  for insert with check (auth.uid() = user_id);

create policy "sessions_update_own" on public.study_sessions
  for update using (auth.uid() = user_id);

create policy "sessions_delete_own" on public.study_sessions
  for delete using (auth.uid() = user_id);

-- ============================================================
-- OTOMATİK KULLANICI PROFİLİ TRIGGER
-- Yeni kullanıcı kayıt olunca users satırı otomatik oluşturulur
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, username, email, total_study_time, companion_clicks)
  values (
    new.id,
    new.raw_user_meta_data->>'username',
    new.email,
    0,
    0
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- Mevcut kullanıcılar için eksik sütunları ekle (migration)
-- ============================================================
alter table public.users
  add column if not exists date_of_birth   date,
  add column if not exists parent_email    text,
  add column if not exists otp_code        text,
  add column if not exists otp_expires_at  timestamptz;

alter table public.study_sessions
  add column if not exists is_verified boolean not null default false;

-- İndeksler
create index if not exists idx_study_sessions_user_id    on public.study_sessions(user_id);
create index if not exists idx_study_sessions_subject_id on public.study_sessions(subject_id);
