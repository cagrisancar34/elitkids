alter table public.pre_registrations
add column if not exists student_gender text
check (student_gender in ('female', 'male'));

