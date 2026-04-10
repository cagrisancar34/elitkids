create table if not exists public.enrollment_session_allocations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  enrollment_id uuid not null references public.enrollments(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  session_id uuid not null references public.sessions(id) on delete cascade,
  session_series_id uuid references public.session_series(id) on delete set null,
  sequence_no integer not null check (sequence_no > 0),
  source text not null default 'initial' check (source in ('initial', 'bonus', 'renewal')),
  status text not null default 'planned' check (status in ('planned', 'consumed', 'cancelled')),
  consumed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (enrollment_id, session_id)
);

create index if not exists enrollment_session_allocations_enrollment_idx
  on public.enrollment_session_allocations (enrollment_id, sequence_no);

create index if not exists enrollment_session_allocations_session_idx
  on public.enrollment_session_allocations (session_id, status);

create index if not exists enrollment_session_allocations_student_idx
  on public.enrollment_session_allocations (student_id, status);

create index if not exists enrollment_session_allocations_org_idx
  on public.enrollment_session_allocations (organization_id, status);

with ranked_sessions as (
  select
    e.id as enrollment_id,
    e.student_id,
    e.session_series_id,
    p.organization_id,
    s.id as session_id,
    row_number() over (
      partition by e.id
      order by s.starts_at
    ) as sequence_no,
    case
      when s.starts_at < now() then 'consumed'
      else 'planned'
    end as allocation_status
  from public.enrollments e
  join public.programs p
    on p.id = e.program_id
  join public.sessions s
    on s.session_series_id = e.session_series_id
   and s.program_id = e.program_id
   and s.cancelled_at is null
   and s.starts_at::date >= coalesce(e.starts_on, s.starts_at::date)
  where e.status = 'active'
    and e.session_series_id is not null
), bounded_ranked_sessions as (
  select
    ranked_sessions.*,
    row_number() over (
      partition by ranked_sessions.enrollment_id
      order by ranked_sessions.sequence_no
    ) as quota_order
  from ranked_sessions
)
insert into public.enrollment_session_allocations (
  organization_id,
  enrollment_id,
  student_id,
  session_id,
  session_series_id,
  sequence_no,
  source,
  status,
  consumed_at
)
select
  bounded_ranked_sessions.organization_id,
  bounded_ranked_sessions.enrollment_id,
  bounded_ranked_sessions.student_id,
  bounded_ranked_sessions.session_id,
  bounded_ranked_sessions.session_series_id,
  bounded_ranked_sessions.sequence_no,
  'initial',
  bounded_ranked_sessions.allocation_status,
  case
    when bounded_ranked_sessions.allocation_status = 'consumed' then now()
    else null
  end
from bounded_ranked_sessions
join public.enrollments e
  on e.id = bounded_ranked_sessions.enrollment_id
join public.programs p
  on p.id = e.program_id
where bounded_ranked_sessions.quota_order <= greatest(coalesce(p.monthly_lesson_quota, 8), 1)
on conflict (enrollment_id, session_id) do nothing;
