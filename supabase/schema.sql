create table if not exists public.user_profiles (
  email text primary key,
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
