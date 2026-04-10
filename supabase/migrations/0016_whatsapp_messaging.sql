create table if not exists public.whatsapp_contacts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete cascade,
  lead_submission_id uuid references public.lead_submissions(id) on delete cascade,
  pre_registration_id uuid references public.pre_registrations(id) on delete cascade,
  full_name text,
  phone text,
  normalized_phone text,
  recipient_type text not null check (recipient_type in ('profile', 'lead', 'pre_registration')),
  opt_in_status text not null default 'unknown' check (opt_in_status in ('opted_in', 'opted_out', 'unknown')),
  opt_in_source text,
  last_opt_in_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, normalized_phone)
);

create table if not exists public.whatsapp_templates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  event_key text not null check (
    event_key in (
      'registration_completed',
      'attendance_absent_manual',
      'payment_reminder_manual',
      'report_card_updated',
      'bulk_broadcast'
    )
  ),
  locale text not null default 'tr',
  meta_template_name text,
  enabled boolean not null default false,
  variable_schema jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, event_key, locale)
);

create table if not exists public.message_campaigns (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  audience_type text not null check (
    audience_type in (
      'all_parents',
      'all_users',
      'debt_parents',
      'program_parents',
      'branch_parents',
      'all_staff',
      'coaches',
      'managers'
    )
  ),
  filters_json jsonb not null default '{}'::jsonb,
  template_or_freeform text not null default '',
  created_by_profile_id uuid references public.profiles(id) on delete set null,
  status text not null default 'queued' check (status in ('draft', 'queued', 'processing', 'completed', 'failed')),
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

create table if not exists public.message_dispatches (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  campaign_id uuid references public.message_campaigns(id) on delete set null,
  channel text not null default 'whatsapp' check (channel in ('whatsapp')),
  event_key text not null check (
    event_key in (
      'registration_completed',
      'attendance_absent_manual',
      'payment_reminder_manual',
      'report_card_updated',
      'bulk_broadcast'
    )
  ),
  recipient_ref jsonb not null default '{}'::jsonb,
  recipient_name text,
  recipient_phone text,
  normalized_phone text,
  payload_json jsonb not null default '{}'::jsonb,
  status text not null default 'queued' check (status in ('blocked', 'queued', 'processing', 'sent', 'delivered', 'read', 'failed')),
  scheduled_for timestamptz not null default now(),
  processed_at timestamptz,
  sent_at timestamptz,
  delivered_at timestamptz,
  read_at timestamptz,
  provider_message_id text,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.message_logs (
  id uuid primary key default gen_random_uuid(),
  dispatch_id uuid not null references public.message_dispatches(id) on delete cascade,
  provider_status text not null,
  provider_payload jsonb not null default '{}'::jsonb,
  delivered_at timestamptz,
  failed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists whatsapp_contacts_org_phone_idx
  on public.whatsapp_contacts (organization_id, normalized_phone);

create index if not exists whatsapp_templates_org_event_idx
  on public.whatsapp_templates (organization_id, event_key, locale);

create index if not exists message_campaigns_org_created_idx
  on public.message_campaigns (organization_id, created_at desc);

create index if not exists message_dispatches_org_status_idx
  on public.message_dispatches (organization_id, status, scheduled_for asc);

create index if not exists message_dispatches_provider_idx
  on public.message_dispatches (provider_message_id);

create index if not exists message_logs_dispatch_created_idx
  on public.message_logs (dispatch_id, created_at desc);

alter table public.whatsapp_contacts enable row level security;
alter table public.whatsapp_templates enable row level security;
alter table public.message_campaigns enable row level security;
alter table public.message_dispatches enable row level security;
alter table public.message_logs enable row level security;

drop policy if exists "whatsapp contacts org read" on public.whatsapp_contacts;
create policy "whatsapp contacts org read"
on public.whatsapp_contacts
for select
using (
  public.has_organization_access(organization_id)
  and public.current_security_role() in ('admin', 'manager', 'super_admin')
);

drop policy if exists "whatsapp contacts org manage" on public.whatsapp_contacts;
create policy "whatsapp contacts org manage"
on public.whatsapp_contacts
for all
using (
  public.current_security_role() = 'super_admin'
  or (
    public.has_organization_access(organization_id)
    and public.current_security_role() in ('admin', 'manager')
  )
)
with check (
  public.current_security_role() = 'super_admin'
  or (
    public.has_organization_access(organization_id)
    and public.current_security_role() in ('admin', 'manager')
  )
);

drop policy if exists "whatsapp templates org read" on public.whatsapp_templates;
create policy "whatsapp templates org read"
on public.whatsapp_templates
for select
using (
  public.has_organization_access(organization_id)
  and public.current_security_role() in ('admin', 'manager', 'super_admin')
);

drop policy if exists "whatsapp templates admin manage" on public.whatsapp_templates;
create policy "whatsapp templates admin manage"
on public.whatsapp_templates
for all
using (
  public.current_security_role() = 'super_admin'
  or (
    public.has_organization_access(organization_id)
    and public.current_security_role() = 'admin'
  )
)
with check (
  public.current_security_role() = 'super_admin'
  or (
    public.has_organization_access(organization_id)
    and public.current_security_role() = 'admin'
  )
);

drop policy if exists "message campaigns org read" on public.message_campaigns;
create policy "message campaigns org read"
on public.message_campaigns
for select
using (
  public.has_organization_access(organization_id)
  and public.current_security_role() in ('admin', 'manager', 'super_admin')
);

drop policy if exists "message campaigns org manage" on public.message_campaigns;
create policy "message campaigns org manage"
on public.message_campaigns
for all
using (
  public.current_security_role() = 'super_admin'
  or (
    public.has_organization_access(organization_id)
    and public.current_security_role() in ('admin', 'manager')
  )
)
with check (
  public.current_security_role() = 'super_admin'
  or (
    public.has_organization_access(organization_id)
    and public.current_security_role() in ('admin', 'manager')
  )
);

drop policy if exists "message dispatches org read" on public.message_dispatches;
create policy "message dispatches org read"
on public.message_dispatches
for select
using (
  public.has_organization_access(organization_id)
  and public.current_security_role() in ('admin', 'manager', 'super_admin')
);

drop policy if exists "message dispatches org manage" on public.message_dispatches;
create policy "message dispatches org manage"
on public.message_dispatches
for all
using (
  public.current_security_role() = 'super_admin'
  or (
    public.has_organization_access(organization_id)
    and public.current_security_role() in ('admin', 'manager')
  )
)
with check (
  public.current_security_role() = 'super_admin'
  or (
    public.has_organization_access(organization_id)
    and public.current_security_role() in ('admin', 'manager')
  )
);

drop policy if exists "message logs org read" on public.message_logs;
create policy "message logs org read"
on public.message_logs
for select
using (
  exists (
    select 1
    from public.message_dispatches
    where message_dispatches.id = message_logs.dispatch_id
      and public.has_organization_access(message_dispatches.organization_id)
      and public.current_security_role() in ('admin', 'manager', 'super_admin')
  )
);
