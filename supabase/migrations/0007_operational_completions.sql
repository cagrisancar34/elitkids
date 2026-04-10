create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  actor_profile_id uuid references public.profiles(id) on delete set null,
  actor_role text,
  event_type text not null,
  scope text not null,
  entity_type text,
  entity_id uuid,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.lead_submissions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text not null,
  branch_interest text,
  message text,
  status text not null default 'new' check (status in ('new', 'contacted', 'qualified', 'closed')),
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_org_created_at_idx
  on public.audit_logs (organization_id, created_at desc);

create index if not exists lead_submissions_org_created_at_idx
  on public.lead_submissions (organization_id, created_at desc);

alter table public.audit_logs enable row level security;
alter table public.lead_submissions enable row level security;

drop policy if exists "audit logs admin read" on public.audit_logs;
create policy "audit logs admin read"
on public.audit_logs
for select
using (public.current_role() = 'admin');

drop policy if exists "lead submissions admin manager read" on public.lead_submissions;
create policy "lead submissions admin manager read"
on public.lead_submissions
for select
using (public.is_admin_or_manager());

drop policy if exists "lead submissions admin manager manage" on public.lead_submissions;
create policy "lead submissions admin manager manage"
on public.lead_submissions
for all
using (public.is_admin_or_manager())
with check (public.is_admin_or_manager());
