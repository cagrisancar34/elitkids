alter table public.students
add column if not exists source text not null default 'manual'
check (source in ('manual', 'pre_registration'));

create table if not exists public.pre_registration_settings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null unique references public.organizations(id) on delete cascade,
  form_enabled boolean not null default true,
  kvkk_title text not null default 'KVKK Aydinlatma Metni',
  kvkk_body text not null default 'Kisisel verileriniz, basvuru surecini yurutmek, sizinle iletisime gecmek ve sporcu kaydini planlamak amaciyla islenir.',
  kvkk_checkbox_label text not null default 'KVKK aydinlatma metnini okudum ve kabul ediyorum.',
  parent_permission_title text not null default 'Veli Izin Belgesi',
  parent_permission_body text not null default 'Velisi bulundugum ogrencinin on kayit surecine tarafimca onay verildigini, verilen bilgilerin dogrulugunu ve kuruma iletilmesini kabul ediyorum.',
  parent_permission_checkbox_label text not null default 'Veli izin belgesini okudum ve kabul ediyorum.',
  success_message text not null default 'On kaydiniz alindi. Ekibimiz en kisa surede sizinle iletisime gececek.',
  helper_note text not null default 'IP adresiniz ve cihaz bilgileriniz guvenlik amaciyla kaydedilebilir.',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pre_registrations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  branch_id uuid references public.branches(id) on delete set null,
  season_id uuid references public.seasons(id) on delete set null,
  program_id uuid references public.programs(id) on delete set null,
  status text not null default 'new'
    check (status in ('new', 'reviewing', 'contacted', 'approved', 'activated', 'rejected', 'archived')),
  student_tc_identity_no text,
  student_full_name text not null,
  student_birth_date date not null,
  note text not null default '',
  mother_name text not null default '',
  mother_phone text not null default '',
  mother_occupation text not null default '',
  father_name text not null default '',
  father_phone text not null default '',
  father_occupation text not null default '',
  parent_email text not null,
  parent_whatsapp text not null default '',
  address text not null default '',
  emergency_contact text not null default '',
  kvkk_accepted_at timestamptz,
  parent_permission_accepted_at timestamptz,
  submitted_at timestamptz not null default now(),
  reviewed_by_profile_id uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  activated_student_id uuid references public.students(id) on delete set null,
  activated_parent_profile_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists pre_registrations_org_status_idx
  on public.pre_registrations (organization_id, status, submitted_at desc);

create table if not exists public.pre_registration_assets (
  id uuid primary key default gen_random_uuid(),
  pre_registration_id uuid not null references public.pre_registrations(id) on delete cascade,
  file_type text not null,
  storage_path text not null,
  public_url text not null,
  created_at timestamptz not null default now()
);

create index if not exists pre_registration_assets_pre_registration_idx
  on public.pre_registration_assets (pre_registration_id, created_at desc);

create table if not exists public.pre_registration_notes (
  id uuid primary key default gen_random_uuid(),
  pre_registration_id uuid not null references public.pre_registrations(id) on delete cascade,
  author_profile_id uuid references public.profiles(id) on delete set null,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.pre_registration_status_logs (
  id uuid primary key default gen_random_uuid(),
  pre_registration_id uuid not null references public.pre_registrations(id) on delete cascade,
  actor_profile_id uuid references public.profiles(id) on delete set null,
  from_status text,
  to_status text not null,
  note text,
  created_at timestamptz not null default now()
);

alter table public.pre_registration_settings enable row level security;
alter table public.pre_registrations enable row level security;
alter table public.pre_registration_assets enable row level security;
alter table public.pre_registration_notes enable row level security;
alter table public.pre_registration_status_logs enable row level security;

drop policy if exists "pre registration settings scoped read" on public.pre_registration_settings;
create policy "pre registration settings scoped read"
on public.pre_registration_settings
for select
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.organization_id = pre_registration_settings.organization_id
      and public.current_role() in ('admin', 'manager')
  )
);

drop policy if exists "pre registration settings admin manage" on public.pre_registration_settings;
create policy "pre registration settings admin manage"
on public.pre_registration_settings
for all
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.organization_id = pre_registration_settings.organization_id
      and public.current_role() = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.organization_id = pre_registration_settings.organization_id
      and public.current_role() = 'admin'
  )
);

drop policy if exists "pre registrations admin manager read" on public.pre_registrations;
create policy "pre registrations admin manager read"
on public.pre_registrations
for select
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.organization_id = pre_registrations.organization_id
      and public.current_role() in ('admin', 'manager')
  )
);

drop policy if exists "pre registrations admin manager manage" on public.pre_registrations;
create policy "pre registrations admin manager manage"
on public.pre_registrations
for all
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.organization_id = pre_registrations.organization_id
      and public.current_role() in ('admin', 'manager')
  )
)
with check (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.organization_id = pre_registrations.organization_id
      and public.current_role() in ('admin', 'manager')
  )
);

drop policy if exists "pre registration assets admin manager read" on public.pre_registration_assets;
create policy "pre registration assets admin manager read"
on public.pre_registration_assets
for select
using (
  exists (
    select 1
    from public.pre_registrations
    join public.profiles on profiles.organization_id = pre_registrations.organization_id
    where pre_registrations.id = pre_registration_assets.pre_registration_id
      and profiles.id = auth.uid()
      and public.current_role() in ('admin', 'manager')
  )
);

drop policy if exists "pre registration assets admin manager manage" on public.pre_registration_assets;
create policy "pre registration assets admin manager manage"
on public.pre_registration_assets
for all
using (
  exists (
    select 1
    from public.pre_registrations
    join public.profiles on profiles.organization_id = pre_registrations.organization_id
    where pre_registrations.id = pre_registration_assets.pre_registration_id
      and profiles.id = auth.uid()
      and public.current_role() in ('admin', 'manager')
  )
)
with check (
  exists (
    select 1
    from public.pre_registrations
    join public.profiles on profiles.organization_id = pre_registrations.organization_id
    where pre_registrations.id = pre_registration_assets.pre_registration_id
      and profiles.id = auth.uid()
      and public.current_role() in ('admin', 'manager')
  )
);

drop policy if exists "pre registration notes admin manager read" on public.pre_registration_notes;
create policy "pre registration notes admin manager read"
on public.pre_registration_notes
for select
using (
  exists (
    select 1
    from public.pre_registrations
    join public.profiles on profiles.organization_id = pre_registrations.organization_id
    where pre_registrations.id = pre_registration_notes.pre_registration_id
      and profiles.id = auth.uid()
      and public.current_role() in ('admin', 'manager')
  )
);

drop policy if exists "pre registration notes admin manager manage" on public.pre_registration_notes;
create policy "pre registration notes admin manager manage"
on public.pre_registration_notes
for all
using (
  exists (
    select 1
    from public.pre_registrations
    join public.profiles on profiles.organization_id = pre_registrations.organization_id
    where pre_registrations.id = pre_registration_notes.pre_registration_id
      and profiles.id = auth.uid()
      and public.current_role() in ('admin', 'manager')
  )
)
with check (
  exists (
    select 1
    from public.pre_registrations
    join public.profiles on profiles.organization_id = pre_registrations.organization_id
    where pre_registrations.id = pre_registration_notes.pre_registration_id
      and profiles.id = auth.uid()
      and public.current_role() in ('admin', 'manager')
  )
);

drop policy if exists "pre registration logs admin manager read" on public.pre_registration_status_logs;
create policy "pre registration logs admin manager read"
on public.pre_registration_status_logs
for select
using (
  exists (
    select 1
    from public.pre_registrations
    join public.profiles on profiles.organization_id = pre_registrations.organization_id
    where pre_registrations.id = pre_registration_status_logs.pre_registration_id
      and profiles.id = auth.uid()
      and public.current_role() in ('admin', 'manager')
  )
);

drop policy if exists "pre registration logs admin manager manage" on public.pre_registration_status_logs;
create policy "pre registration logs admin manager manage"
on public.pre_registration_status_logs
for all
using (
  exists (
    select 1
    from public.pre_registrations
    join public.profiles on profiles.organization_id = pre_registrations.organization_id
    where pre_registrations.id = pre_registration_status_logs.pre_registration_id
      and profiles.id = auth.uid()
      and public.current_role() in ('admin', 'manager')
  )
)
with check (
  exists (
    select 1
    from public.pre_registrations
    join public.profiles on profiles.organization_id = pre_registrations.organization_id
    where pre_registrations.id = pre_registration_status_logs.pre_registration_id
      and profiles.id = auth.uid()
      and public.current_role() in ('admin', 'manager')
  )
);

insert into public.pre_registration_settings (
  organization_id
)
select organizations.id
from public.organizations
where not exists (
  select 1
  from public.pre_registration_settings
  where pre_registration_settings.organization_id = organizations.id
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'pre-registration-assets',
  'pre-registration-assets',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;
