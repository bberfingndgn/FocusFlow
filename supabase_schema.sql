-- ============================================================
-- FocusFlow - Supabase Database Schema
-- Supabase Dashboard > SQL Editor'da çalıştır
-- ============================================================

-- UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- USERS tablosu (kullanıcı profili)
-- ============================================================
create table if not exists public.users (
  id               uuid references auth.users(id) on delete cascade primary key,
  username         text,
  email            text,
  created_at       timestamptz default now(),
  total_study_time bigint  default 0,   -- saniye cinsinden toplam (sadece doğrulanmış)
  companion_clicks integer default 0,
  date_of_birth    date,                -- ebeveyn kilidi için yaş hesabı
  parent_pin       text                 -- 15 yaş altı kullanıcılar için ebeveyn PIN'i
);

-- ============================================================
-- STUDY_SESSIONS tablosu (çalışma oturumları)
-- ============================================================
create table if not exists public.study_sessions (
  id          uuid        default uuid_generate_v4() primary key,
  user_id     uuid        references public.users(id) on delete cascade not null,
  subject_id  text        not null,    -- "Mathematics", "Science", vb.
  start_time  timestamptz not null,
  end_time    timestamptz not null,
  duration    integer     not null,    -- dakika cinsinden süre
  is_verified boolean     not null default false,  -- ebeveyn onayı
  created_at  timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) — kullanıcılar sadece kendi verisini görsün
-- ============================================================
alter table public.users          enable row level security;
alter table public.study_sessions enable row level security;

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
-- OTOMATİK KULLANICI PROFİLİ — kayıt olunca users tablosuna satır ekle
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

-- Trigger: yeni auth kullanıcısı oluştuğunda tetikle
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
