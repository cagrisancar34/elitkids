create table if not exists public.student_detail_questions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  field_key text not null,
  label text not null,
  input_type text not null check (input_type in ('text', 'textarea', 'number', 'select')),
  helper_text text not null default '',
  placeholder text not null default '',
  options jsonb not null default '[]'::jsonb,
  required boolean not null default true,
  active boolean not null default true,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, field_key)
);

create index if not exists student_detail_questions_org_sort_idx
  on public.student_detail_questions (organization_id, sort_order, created_at);

create table if not exists public.student_detail_answers (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  question_id uuid not null references public.student_detail_questions(id) on delete cascade,
  answered_by_profile_id uuid references public.profiles(id) on delete set null,
  value_text text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, question_id)
);

create index if not exists student_detail_answers_student_idx
  on public.student_detail_answers (student_id, updated_at desc);

alter table public.student_detail_questions enable row level security;
alter table public.student_detail_answers enable row level security;

insert into public.student_detail_questions (
  organization_id,
  field_key,
  label,
  input_type,
  helper_text,
  placeholder,
  required,
  active,
  sort_order
)
select
  organizations.id,
  defaults.field_key,
  defaults.label,
  defaults.input_type,
  defaults.helper_text,
  defaults.placeholder,
  defaults.required,
  true,
  defaults.sort_order
from public.organizations
cross join (
  values
    ('category', 'Kategori', 'text', 'Sporcunun aktif kategori bilgisini gir.', 'Hokey A', true, 10),
    ('club_name', 'Kulup', 'text', 'Kulup veya kurum adini gir.', 'Zeytinburnu Buz Spor Kulubu', true, 20),
    ('technical_score', 'Teknik puan', 'number', '1 ile 10 arasinda teknik degerlendirme puani.', '8', true, 30),
    ('discipline_score', 'Disiplin puan', 'number', '1 ile 10 arasinda disiplin puani.', '8', true, 40),
    ('participation_score', 'Katilim puan', 'number', '1 ile 10 arasinda katilim puani.', '8', true, 50),
    ('strengths', 'Guclu yonler', 'textarea', 'Sporcunun one cikan yonlerini yaz.', 'Denge, hizli algi, kuvvetli baslangic...', true, 60),
    ('improvement_areas', 'Gelisim alanlari', 'textarea', 'Takip edilmesi gereken alanlari yaz.', 'Donus teknigi, kondisyon, devam...', true, 70),
    ('coach_notes', 'Koc notu', 'textarea', 'Velinin de gorecegi kisa aciklama.', 'Bu ay motivasyonu yuksek, bireysel calismasi artirilmali...', true, 80)
) as defaults(field_key, label, input_type, helper_text, placeholder, required, sort_order)
where not exists (
  select 1
  from public.student_detail_questions existing
  where existing.organization_id = organizations.id
    and existing.field_key = defaults.field_key
);
