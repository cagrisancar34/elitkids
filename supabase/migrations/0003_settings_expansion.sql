create table if not exists public.branches (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  slug text not null,
  location text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (organization_id, slug)
);

create table if not exists public.seasons (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  starts_on date not null,
  ends_on date not null,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  check (ends_on >= starts_on)
);

alter table public.branches enable row level security;
alter table public.seasons enable row level security;

drop policy if exists "branches scoped read" on public.branches;
create policy "branches scoped read"
on public.branches
for select
using (public.is_admin_or_manager());

drop policy if exists "branches admin manage" on public.branches;
create policy "branches admin manage"
on public.branches
for all
using (public.current_role() = 'admin')
with check (public.current_role() = 'admin');

drop policy if exists "seasons scoped read" on public.seasons;
create policy "seasons scoped read"
on public.seasons
for select
using (public.is_admin_or_manager());

drop policy if exists "seasons admin manage" on public.seasons;
create policy "seasons admin manage"
on public.seasons
for all
using (public.current_role() = 'admin')
with check (public.current_role() = 'admin');
