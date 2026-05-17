alter table public.pre_registrations
add column if not exists custom_answers jsonb not null default '{}'::jsonb;

create table if not exists public.pre_registration_form_fields (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  field_key text not null,
  label text not null,
  input_type text not null
    check (input_type in ('text', 'textarea', 'date', 'select', 'email', 'phone', 'file')),
  helper_text text not null default '',
  placeholder text not null default '',
  options jsonb not null default '[]'::jsonb,
  required boolean not null default false,
  active boolean not null default true,
  sort_order integer not null default 100,
  section text not null
    check (section in ('student', 'parent', 'application')),
  system boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, field_key)
);

create index if not exists pre_registration_form_fields_org_sort_idx
  on public.pre_registration_form_fields (organization_id, sort_order asc);

alter table public.pre_registration_form_fields enable row level security;

drop policy if exists "pre registration form fields scoped read" on public.pre_registration_form_fields;
create policy "pre registration form fields scoped read"
on public.pre_registration_form_fields
for select
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.organization_id = pre_registration_form_fields.organization_id
      and public.current_role() in ('admin', 'manager')
  )
);

drop policy if exists "pre registration form fields admin manage" on public.pre_registration_form_fields;
create policy "pre registration form fields admin manage"
on public.pre_registration_form_fields
for all
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.organization_id = pre_registration_form_fields.organization_id
      and public.current_role() = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.organization_id = pre_registration_form_fields.organization_id
      and public.current_role() = 'admin'
  )
);

insert into public.pre_registration_form_fields (
  organization_id,
  field_key,
  label,
  input_type,
  helper_text,
  placeholder,
  options,
  required,
  active,
  sort_order,
  section,
  system
)
select
  organizations.id,
  seed.field_key,
  seed.label,
  seed.input_type,
  seed.helper_text,
  seed.placeholder,
  seed.options::jsonb,
  seed.required,
  true,
  seed.sort_order,
  seed.section,
  true
from public.organizations
cross join (
  values
    ('studentTcIdentityNo', 'TC Kimlik No', 'text', 'Opsiyonel · 11 haneli', '11 haneli TC Kimlik No', '[]', false, 10, 'student'),
    ('studentFullName', 'Ad Soyad', 'text', '', 'Ogrencinin adi ve soyadi', '[]', true, 20, 'student'),
    ('studentGender', 'Cinsiyet', 'select', '', '', '["male","female"]', true, 30, 'student'),
    ('studentBirthDate', 'Dogum Tarihi', 'date', '2 - 18 yas arasi', '', '[]', true, 40, 'student'),
    ('studentPhoto', 'Fotograf', 'file', 'JPG, PNG, WebP · Max 5MB', '', '[]', false, 50, 'student'),
    ('note', 'Aciklama', 'textarea', '', 'Varsa belirtmek istediginiz notlar...', '[]', false, 60, 'student'),
    ('fatherName', 'Baba Ad Soyad', 'text', '', 'Baba ad soyad', '[]', false, 70, 'parent'),
    ('fatherPhone', 'Baba Telefon', 'phone', '', '05XX XXX XX XX', '[]', false, 80, 'parent'),
    ('fatherOccupation', 'Baba Meslek', 'text', '', 'Baba meslek', '[]', false, 90, 'parent'),
    ('motherName', 'Anne Ad Soyad', 'text', '', 'Anne ad soyad', '[]', false, 100, 'parent'),
    ('motherPhone', 'Anne Telefon', 'phone', '', '05XX XXX XX XX', '[]', false, 110, 'parent'),
    ('motherOccupation', 'Anne Meslek', 'text', '', 'Anne meslek', '[]', false, 120, 'parent'),
    ('parentEmail', 'E-posta', 'email', '', 'veli@eposta.com', '[]', true, 130, 'parent'),
    ('parentWhatsapp', 'WhatsApp / Telefon', 'phone', '', '05XX XXX XX XX', '[]', true, 140, 'parent'),
    ('address', 'Ikametgah Adresi', 'textarea', '', 'Ikametgah adresi', '[]', true, 150, 'parent'),
    ('emergencyContact', 'Acil Durumda Aranacak Kisi', 'text', '', 'Acil durumda aranacak kisi', '[]', true, 160, 'parent'),
    ('branchId', 'Ilgilenilen Sube', 'select', '', '', '[]', true, 170, 'application'),
    ('seasonId', 'Sezon', 'select', '', '', '[]', true, 180, 'application'),
    ('programId', 'Program', 'select', '', '', '[]', true, 190, 'application')
) as seed(field_key, label, input_type, helper_text, placeholder, options, required, sort_order, section)
where not exists (
  select 1
  from public.pre_registration_form_fields
  where pre_registration_form_fields.organization_id = organizations.id
    and pre_registration_form_fields.field_key = seed.field_key
);
