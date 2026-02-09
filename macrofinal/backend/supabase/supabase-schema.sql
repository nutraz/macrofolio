-- Macrofolio Supabase Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ===========================================
-- USERS TABLE
-- ===========================================
create table public.users (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  wallet_address text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- ===========================================
-- ASSETS TABLE
-- ===========================================
create table public.assets (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  name text not null,
  symbol text,
  type text not null,
  quantity numeric default 0,
  purchase_price numeric default 0,
  purchase_date date,
  current_price numeric default 0,
  notes text,
  is_premium boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- ===========================================
-- TRANSACTIONS TABLE
-- ===========================================
create table public.transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  asset_id uuid references public.assets(id) on delete set null,
  type text not null,
  quantity numeric not null,
  price numeric not null,
  fee numeric default 0,
  tx_hash text,
  status text default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- ===========================================
-- ALERTS TABLE
-- ===========================================
create table public.alerts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  asset_id uuid references public.assets(id) on delete set null,
  type text not null,
  target_price numeric,
  message text,
  is_active boolean default true,
  triggered_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- ===========================================
-- ANCHORS TABLE (Blockchain Proofs)
// ==========================================
create table public.anchors (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  asset_id uuid references public.assets(id) on delete set null,
  tx_hash text not null,
  block_number bigint,
  verified_at timestamp with time zone default timezone('utc'::text, now())
);

-- ===========================================
-- RLS POLICIES
-- ===========================================
alter table public.users enable row level security;
alter table public.assets enable row level security;
alter table public.transactions enable row level security;
alter table public.alerts enable row level security;
alter table public.anchors enable row level security;

-- Users can only see their own data
create policy "Users can view own users" on public.users for select using (auth.uid() = id);
create policy "Users can view own assets" on public.assets for select using (auth.uid() = user_id);
create policy "Users can view own transactions" on public.transactions for select using (auth.uid() = user_id);
create policy "Users can view own alerts" on public.alerts for select using (auth.uid() = user_id);
create policy "Users can view own anchors" on public.anchors for select using (auth.uid() = user_id);

-- Users can CRUD their own data
create policy "Users can insert own assets" on public.assets for insert with check (auth.uid() = user_id);
create policy "Users can update own assets" on public.assets for update using (auth.uid() = user_id);
create policy "Users can delete own assets" on public.assets for delete using (auth.uid() = user_id);

create policy "Users can insert own transactions" on public.transactions for insert with check (auth.uid() = user_id);
create policy "Users can update own transactions" on public.transactions for update using (auth.uid() = user_id);

create policy "Users can insert own alerts" on public.alerts for insert with check (auth.uid() = user_id);
create policy "Users can update own alerts" on public.alerts for update using (auth.uid() = user_id);
create policy "Users can delete own alerts" on public.alerts for delete using (auth.uid() = user_id);

create policy "Users can insert own anchors" on public.anchors for insert with check (auth.uid() = user_id);

-- ===========================================
-- AUTOMATIC USER CREATION
-- ===========================================
-- Function to create user record on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, wallet_address)
  values (new.id, new.email, new.raw_user_meta_data->>'wallet_address');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ===========================================
-- INDEXES
-- ===========================================
create index idx_assets_user_id on public.assets(user_id);
create index idx_assets_type on public.assets(type);
create index idx_transactions_user_id on public.transactions(user_id);
create index idx_alerts_user_id on public.alerts(user_id);
create index idx_anchors_user_id on public.anchors(user_id);

