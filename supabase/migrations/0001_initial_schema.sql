create extension if not exists "pgcrypto";

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  locale text not null default 'tr-TR',
  timezone text not null default 'Europe/Istanbul',
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  full_name text not null,
  phone text,
  created_at timestamptz not null default now()
);

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('admin', 'manager', 'coach', 'parent')),
  created_at timestamptz not null default now()
);

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  full_name text not null,
  birth_date date,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.parent_student_links (
  id uuid primary key default gen_random_uuid(),
  parent_profile_id uuid not null references public.profiles(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  relationship text,
  unique (parent_profile_id, student_id)
);

create table if not exists public.programs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  age_band text,
  capacity integer not null default 0,
  monthly_price numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  program_id uuid not null references public.programs(id) on delete cascade,
  status text not null default 'active',
  starts_on date,
  ends_on date
);

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs(id) on delete cascade,
  coach_profile_id uuid references public.profiles(id) on delete set null,
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  location text
);

create table if not exists public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  status text not null check (status in ('present', 'absent', 'late', 'excused')),
  note text
);

create table if not exists public.fee_plans (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  amount numeric(12,2) not null,
  cadence text not null default 'monthly'
);

create table if not exists public.charges (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.enrollments(id) on delete cascade,
  fee_plan_id uuid references public.fee_plans(id) on delete set null,
  amount numeric(12,2) not null,
  due_date date,
  status text not null default 'pending'
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  charge_id uuid references public.charges(id) on delete set null,
  amount numeric(12,2) not null,
  payment_method text not null default 'manual',
  receipt_path text,
  created_at timestamptz not null default now()
);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  body text not null,
  audience_role text,
  published_at timestamptz
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text,
  channel text not null default 'in_app',
  read_at timestamptz
);

create table if not exists public.support_threads (
  id uuid primary key default gen_random_uuid(),
  parent_profile_id uuid not null references public.profiles(id) on delete cascade,
  subject text not null,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create table if not exists public.support_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.support_threads(id) on delete cascade,
  author_profile_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.students enable row level security;
alter table public.parent_student_links enable row level security;
alter table public.programs enable row level security;
alter table public.enrollments enable row level security;
alter table public.sessions enable row level security;
alter table public.attendance_records enable row level security;
alter table public.fee_plans enable row level security;
alter table public.charges enable row level security;
alter table public.payments enable row level security;
alter table public.announcements enable row level security;
alter table public.notifications enable row level security;
alter table public.support_threads enable row level security;
alter table public.support_messages enable row level security;

create or replace function public.current_role()
returns text
language sql
stable
as $$
  select role
  from public.user_roles
  where profile_id = auth.uid()
  order by created_at asc
  limit 1;
$$;

create policy "profiles self access"
on public.profiles
for select
using (id = auth.uid() or public.current_role() in ('admin', 'manager'));

create policy "students visible to operational roles"
on public.students
for select
using (
  public.current_role() in ('admin', 'manager')
  or exists (
    select 1
    from public.parent_student_links psl
    where psl.student_id = students.id
      and psl.parent_profile_id = auth.uid()
  )
);

create policy "announcements readable by audience"
on public.announcements
for select
using (
  public.current_role() in ('admin', 'manager')
  or audience_role is null
  or audience_role = public.current_role()
);

create policy "notifications self access"
on public.notifications
for select
using (profile_id = auth.uid() or public.current_role() in ('admin', 'manager'));
