create table if not exists public.homepage_settings (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  content jsonb not null default '{}'::jsonb,
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now()
);

alter table public.homepage_settings enable row level security;

drop policy if exists "homepage public read" on public.homepage_settings;
create policy "homepage public read"
on public.homepage_settings
for select
using (true);

drop policy if exists "homepage admin manage" on public.homepage_settings;
create policy "homepage admin manage"
on public.homepage_settings
for all
using (public.current_role() = 'admin')
with check (public.current_role() = 'admin');
