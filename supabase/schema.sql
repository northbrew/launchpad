create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  slug text not null unique check (slug in ('james', 'cory')),
  full_name text not null,
  email text not null unique,
  timezone text not null,
  initials text not null,
  color_token text not null check (color_token in ('james', 'cory')),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.library_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  note text not null,
  type text not null check (type in ('loom', 'screenshot', 'doc', 'figma', 'link')),
  source_url text,
  storage_path text,
  mime_type text,
  file_ext text,
  poster_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.library_item_tags (
  library_item_id uuid not null references public.library_items(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (library_item_id, tag_id)
);

create table if not exists public.decisions (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  context text not null,
  status text not null check (status in ('open', 'blocking', 'resolved')),
  waiting_on_user_id uuid references public.users(id) on delete set null,
  waiting_on_both boolean not null default false,
  resolution text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  done boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  completed_at timestamptz
);

create table if not exists public.decision_positions (
  id uuid primary key default gen_random_uuid(),
  decision_id uuid not null references public.decisions(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  vote text not null,
  take text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (decision_id, user_id)
);

create index if not exists library_items_created_at_idx on public.library_items (created_at desc);
create index if not exists library_items_type_idx on public.library_items (type);
create index if not exists tags_slug_idx on public.tags (slug);
create index if not exists decisions_status_idx on public.decisions (status);
create index if not exists decisions_waiting_on_user_id_idx on public.decisions (waiting_on_user_id);
create index if not exists tasks_owner_id_idx on public.tasks (owner_id);
create index if not exists tasks_done_idx on public.tasks (done);

alter table public.users enable row level security;
alter table public.tags enable row level security;
alter table public.library_items enable row level security;
alter table public.library_item_tags enable row level security;
alter table public.decisions enable row level security;
alter table public.decision_positions enable row level security;
alter table public.tasks enable row level security;

drop policy if exists "authenticated users can read tasks" on public.tasks;
create policy "authenticated users can read tasks" on public.tasks for select to authenticated using (true);
drop policy if exists "authenticated users can manage tasks" on public.tasks;
create policy "authenticated users can manage tasks" on public.tasks for all to authenticated using (true) with check (true);

drop policy if exists "authenticated users can read users" on public.users;
create policy "authenticated users can read users" on public.users for select to authenticated using (true);
drop policy if exists "authenticated users can manage users" on public.users;
create policy "authenticated users can manage users" on public.users for all to authenticated using (true) with check (true);

drop policy if exists "authenticated users can read tags" on public.tags;
create policy "authenticated users can read tags" on public.tags for select to authenticated using (true);
drop policy if exists "authenticated users can manage tags" on public.tags;
create policy "authenticated users can manage tags" on public.tags for all to authenticated using (true) with check (true);

drop policy if exists "authenticated users can read library items" on public.library_items;
create policy "authenticated users can read library items" on public.library_items for select to authenticated using (true);
drop policy if exists "authenticated users can manage library items" on public.library_items;
create policy "authenticated users can manage library items" on public.library_items for all to authenticated using (true) with check (true);

drop policy if exists "authenticated users can read library item tags" on public.library_item_tags;
create policy "authenticated users can read library item tags" on public.library_item_tags for select to authenticated using (true);
drop policy if exists "authenticated users can manage library item tags" on public.library_item_tags;
create policy "authenticated users can manage library item tags" on public.library_item_tags for all to authenticated using (true) with check (true);

drop policy if exists "authenticated users can read decisions" on public.decisions;
create policy "authenticated users can read decisions" on public.decisions for select to authenticated using (true);
drop policy if exists "authenticated users can manage decisions" on public.decisions;
create policy "authenticated users can manage decisions" on public.decisions for all to authenticated using (true) with check (true);

drop policy if exists "authenticated users can read decision positions" on public.decision_positions;
create policy "authenticated users can read decision positions" on public.decision_positions for select to authenticated using (true);
drop policy if exists "authenticated users can manage decision positions" on public.decision_positions;
create policy "authenticated users can manage decision positions" on public.decision_positions for all to authenticated using (true) with check (true);

insert into storage.buckets (id, name, public)
values ('library-files', 'library-files', true)
on conflict (id) do nothing;

drop policy if exists "authenticated users can read library files" on storage.objects;
create policy "authenticated users can read library files"
on storage.objects for select
to authenticated
using (bucket_id = 'library-files');

drop policy if exists "authenticated users can upload library files" on storage.objects;
create policy "authenticated users can upload library files"
on storage.objects for insert
to authenticated
with check (bucket_id = 'library-files');

drop policy if exists "authenticated users can update library files" on storage.objects;
create policy "authenticated users can update library files"
on storage.objects for update
to authenticated
using (bucket_id = 'library-files')
with check (bucket_id = 'library-files');

drop policy if exists "authenticated users can delete library files" on storage.objects;
create policy "authenticated users can delete library files"
on storage.objects for delete
to authenticated
using (bucket_id = 'library-files');
