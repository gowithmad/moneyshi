-- MoneyShi · supabase/schema.sql
-- Run this once in your Supabase project (SQL Editor -> New query -> paste -> Run).
-- It creates the two tables the app uses and the row-level security rules that
-- keep every user's entries private to them. Safe to re-run: it only creates
-- things that do not already exist, except where noted.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  username text,
  display text,
  role text not null default 'user' check (role in ('user','admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.entries (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  d date not null,
  t text default '',
  a text not null,
  dir text not null check (dir in ('in','out')),
  amt numeric(12,2) not null check (amt > 0),
  n text not null,
  c text not null,
  i boolean not null default false,
  note text default '',
  u text default '',
  created_at timestamptz not null default now()
);
create index if not exists entries_user_idx on public.entries(user_id);
create index if not exists entries_user_date_idx on public.entries(user_id, d);

create table if not exists public.user_meta (
  user_id uuid not null references auth.users(id) on delete cascade,
  k text not null,
  v jsonb not null,
  primary key (user_id, k)
);

-- Creates a profile row automatically whenever someone signs up.
-- The very first person to sign up becomes an administrator; everyone after
-- that starts as an ordinary member (change roles later on the Users admin page).
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, username, display, role)
  values (
    new.id, new.email,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email,'@',1)),
    coalesce(new.raw_user_meta_data->>'display', split_part(new.email,'@',1)),
    case when (select count(*) from public.profiles) = 0 then 'admin' else 'user' end
  );
  return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Lets an administrator delete their OWN account from the app's Account page
-- (deleting other people's sign-in records needs the service_role key, which
-- never belongs in the site itself -- do that from the Supabase dashboard instead).
create or replace function public.delete_my_account()
returns void language plpgsql security definer set search_path = public as $$
begin
  delete from public.entries where user_id = auth.uid();
  delete from public.user_meta where user_id = auth.uid();
  delete from public.profiles where id = auth.uid();
end; $$;

-- Lets the Users admin page show how many entries each person has,
-- without giving administrators access to the entries themselves.
create or replace function public.admin_user_stats()
returns table(id uuid, entries bigint) language sql security definer set search_path = public as $$
  select e.user_id, count(*) from public.entries e
  where exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  group by e.user_id;
$$;

alter table public.profiles enable row level security;
alter table public.entries enable row level security;
alter table public.user_meta enable row level security;

drop policy if exists "read own profile" on public.profiles;
create policy "read own profile" on public.profiles for select using (
  id = auth.uid() or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);
drop policy if exists "update own profile" on public.profiles;
create policy "update own profile" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
drop policy if exists "admin update any profile" on public.profiles;
create policy "admin update any profile" on public.profiles for update using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

drop policy if exists "own entries" on public.entries;
create policy "own entries" on public.entries for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "own meta" on public.user_meta;
create policy "own meta" on public.user_meta for all using (user_id = auth.uid()) with check (user_id = auth.uid());
