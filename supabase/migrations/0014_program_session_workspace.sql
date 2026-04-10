create table if not exists public.program_types (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  slug text not null,
  created_at timestamptz not null default now(),
  unique (organization_id, slug)
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  slug text not null,
  created_at timestamptz not null default now(),
  unique (organization_id, slug)
);

create table if not exists public.sports_branches (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  slug text not null,
  created_at timestamptz not null default now(),
  unique (organization_id, slug)
);

create table if not exists public.areas (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  branch_id uuid references public.branches(id) on delete set null,
  name text not null,
  slug text not null,
  created_at timestamptz not null default now(),
  unique (organization_id, slug)
);

create table if not exists public.session_series (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  program_id uuid not null references public.programs(id) on delete cascade,
  coach_profile_id uuid references public.profiles(id) on delete set null,
  area_id uuid references public.areas(id) on delete set null,
  title text not null,
  starts_on date not null,
  ends_on date not null,
  start_time time not null,
  end_time time not null,
  weekdays smallint[] not null default '{}',
  status text not null default 'active' check (status in ('active', 'paused', 'cancelled')),
  notes text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.student_package_cycles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  enrollment_id uuid not null references public.enrollments(id) on delete cascade,
  program_id uuid not null references public.programs(id) on delete cascade,
  cycle_start date not null,
  cycle_end date not null,
  total_lessons integer not null default 8 check (total_lessons > 0),
  used_lessons integer not null default 0 check (used_lessons >= 0),
  status text not null default 'active' check (status in ('active', 'closed')),
  created_at timestamptz not null default now()
);

alter table public.programs
add column if not exists program_type_id uuid references public.program_types(id) on delete set null,
add column if not exists season_id uuid references public.seasons(id) on delete set null,
add column if not exists category_id uuid references public.categories(id) on delete set null,
add column if not exists branch_id uuid references public.branches(id) on delete set null,
add column if not exists sports_branch_id uuid references public.sports_branches(id) on delete set null,
add column if not exists coach_profile_id uuid references public.profiles(id) on delete set null,
add column if not exists area_id uuid references public.areas(id) on delete set null,
add column if not exists status text not null default 'active',
add column if not exists notes text not null default '',
add column if not exists monthly_lesson_quota integer not null default 8;

alter table public.sessions
add column if not exists session_series_id uuid references public.session_series(id) on delete set null,
add column if not exists area_id uuid references public.areas(id) on delete set null,
add column if not exists notes text not null default '';

create index if not exists program_types_org_idx on public.program_types (organization_id, name);
create index if not exists categories_org_idx on public.categories (organization_id, name);
create index if not exists sports_branches_org_idx on public.sports_branches (organization_id, name);
create index if not exists areas_org_idx on public.areas (organization_id, name);
create index if not exists session_series_org_idx on public.session_series (organization_id, starts_on, ends_on);
create index if not exists sessions_series_idx on public.sessions (session_series_id, starts_at);
create index if not exists student_package_cycles_student_idx on public.student_package_cycles (student_id, cycle_start desc);

insert into public.program_types (organization_id, name, slug)
select organizations.id, defaults.name, defaults.slug
from public.organizations
cross join (
  values
    ('Grup Dersi', 'grup-dersi'),
    ('Ozel Ders', 'ozel-ders'),
    ('Deneme Dersi', 'deneme-dersi')
) as defaults(name, slug)
where not exists (
  select 1
  from public.program_types
  where program_types.organization_id = organizations.id
    and program_types.slug = defaults.slug
);

insert into public.categories (organization_id, name, slug)
select organizations.id, defaults.name, defaults.slug
from public.organizations
cross join (
  values
    ('Hokey A', 'hokey-a'),
    ('Yildiz B', 'yildiz-b'),
    ('Baslangic', 'baslangic')
) as defaults(name, slug)
where not exists (
  select 1
  from public.categories
  where categories.organization_id = organizations.id
    and categories.slug = defaults.slug
);

insert into public.sports_branches (organization_id, name, slug)
select organizations.id, defaults.name, defaults.slug
from public.organizations
cross join (
  values
    ('Yuzme', 'yuzme'),
    ('Jimnastik', 'jimnastik'),
    ('Buz Pateni', 'buz-pateni')
) as defaults(name, slug)
where not exists (
  select 1
  from public.sports_branches
  where sports_branches.organization_id = organizations.id
    and sports_branches.slug = defaults.slug
);

insert into public.areas (organization_id, branch_id, name, slug)
select branches.organization_id, branches.id, branches.name, branches.slug
from public.branches
where not exists (
  select 1
  from public.areas
  where areas.organization_id = branches.organization_id
    and areas.slug = branches.slug
);
