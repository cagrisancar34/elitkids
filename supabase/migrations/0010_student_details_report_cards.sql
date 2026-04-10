alter table public.students
add column if not exists gender text check (gender in ('female', 'male', 'other'));

create table if not exists public.student_detail_profiles (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null unique references public.students(id) on delete cascade,
  category text,
  club_name text,
  technical_score integer check (technical_score between 1 and 10),
  discipline_score integer check (discipline_score between 1 and 10),
  participation_score integer check (participation_score between 1 and 10),
  strengths text,
  improvement_areas text,
  coach_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.report_cards (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null unique references public.students(id) on delete cascade,
  detail_profile_id uuid not null references public.student_detail_profiles(id) on delete cascade,
  summary text not null,
  generated_at timestamptz not null default now(),
  payload jsonb not null default '{}'::jsonb
);

alter table public.student_detail_profiles enable row level security;
alter table public.report_cards enable row level security;
