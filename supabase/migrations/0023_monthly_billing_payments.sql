alter table public.charges
add column if not exists created_at timestamptz not null default now();

alter table public.charges
add column if not exists billing_period date;

update public.charges
set billing_period = date_trunc('month', coalesce(due_date, created_at::date, now()::date))::date
where billing_period is null;

create index if not exists charges_enrollment_billing_period_idx
on public.charges (enrollment_id, billing_period);

alter table public.payments
add column if not exists paid_at timestamptz;

alter table public.payments
add column if not exists reference_no text;

alter table public.payments
add column if not exists note text not null default '';

update public.payments
set paid_at = coalesce(paid_at, created_at)
where paid_at is null;

alter table public.payments
alter column paid_at set not null;

create index if not exists payments_charge_paid_at_idx
on public.payments (charge_id, paid_at desc);
