create table if not exists public.user_profiles (
  email text primary key,
  friend_code text unique not null default upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8)),
  name text,
  image text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gustambito_progress (
  email text not null references public.user_profiles(email) on delete cascade,
  gustambito_id integer not null,
  variant_label text not null,
  level integer not null default 0 check (level between 0 and 5),
  updated_at timestamptz not null default now(),
  primary key (email, gustambito_id, variant_label)
);

alter table public.user_profiles enable row level security;
alter table public.gustambito_progress enable row level security;

alter table public.user_profiles add column if not exists friend_code text;
update public.user_profiles set friend_code = upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8)) where friend_code is null;
alter table public.user_profiles alter column friend_code set not null;
create unique index if not exists user_profiles_friend_code_idx on public.user_profiles(friend_code);

create table if not exists public.user_friends (
  owner_email text not null references public.user_profiles(email) on delete cascade,
  friend_email text not null references public.user_profiles(email) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (owner_email, friend_email),
  check (owner_email <> friend_email)
);

alter table public.user_friends enable row level security;

grant usage on schema public to service_role;
grant select, insert, update, delete on public.user_profiles, public.gustambito_progress, public.user_friends to service_role;

do $$
begin
  alter publication supabase_realtime add table public.gustambito_progress;
exception when duplicate_object then
  null;
end $$;
