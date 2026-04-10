alter table public.programs
add column if not exists archived_at timestamptz;

alter table public.sessions
add column if not exists cancelled_at timestamptz;
