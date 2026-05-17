create table if not exists public.message_topics (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  topic_key text not null check (
    topic_key in (
      'registration_completed',
      'pre_registration_activated',
      'student_created_manual',
      'attendance_absent_manual',
      'payment_reminder_manual',
      'report_card_updated',
      'bulk_broadcast',
      'panel_notice_registration_completed',
      'panel_notice_payment_risk',
      'panel_notice_lesson_rights_expiring'
    )
  ),
  title text not null default '',
  description text not null default '',
  channel text not null default 'whatsapp' check (channel in ('whatsapp', 'panel', 'both')),
  body_template text not null default '',
  available_variables_json jsonb not null default '[]'::jsonb,
  active boolean not null default true,
  editable_by_manager boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, topic_key)
);

create index if not exists message_topics_org_topic_idx
  on public.message_topics (organization_id, topic_key);

alter table public.message_topics enable row level security;

drop policy if exists "message topics org read" on public.message_topics;
create policy "message topics org read"
on public.message_topics
for select
using (
  public.has_organization_access(organization_id)
  and public.current_security_role() in ('admin', 'manager', 'super_admin')
);

drop policy if exists "message topics org manage" on public.message_topics;
create policy "message topics org manage"
on public.message_topics
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

alter table public.message_campaigns
  drop constraint if exists message_campaigns_audience_type_check;

alter table public.message_campaigns
  add constraint message_campaigns_audience_type_check
  check (
    audience_type in (
      'all_parents',
      'all_users',
      'debt_parents',
      'program_parents',
      'branch_parents',
      'session_series_members',
      'specific_students',
      'all_staff',
      'coaches',
      'managers'
    )
  );
