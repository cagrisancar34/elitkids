alter table public.user_roles
add column if not exists security_role text;

update public.user_roles
set security_role = case role
  when 'admin' then 'admin'
  when 'manager' then 'manager'
  when 'coach' then 'staff'
  when 'parent' then 'user'
  else 'user'
end
where security_role is null;

alter table public.user_roles
drop constraint if exists user_roles_security_role_check;

alter table public.user_roles
add constraint user_roles_security_role_check
check (security_role in ('super_admin', 'admin', 'manager', 'staff', 'user'));

create index if not exists user_roles_security_role_idx
  on public.user_roles (profile_id, security_role);

create or replace function public.role_to_security_role(app_role text)
returns text
language sql
immutable
as $$
  select case app_role
    when 'admin' then 'admin'
    when 'manager' then 'manager'
    when 'coach' then 'staff'
    when 'parent' then 'user'
    else 'user'
  end;
$$;

create or replace function public.current_security_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select security_role
      from public.user_roles
      where profile_id = auth.uid()
      order by created_at asc
      limit 1
    ),
    public.role_to_security_role(public.current_role())
  );
$$;

create or replace function public.has_organization_access(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.current_security_role() = 'super_admin'
    or exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.organization_id = target_organization_id
    );
$$;

alter table public.program_types enable row level security;
alter table public.categories enable row level security;
alter table public.sports_branches enable row level security;
alter table public.areas enable row level security;
alter table public.session_series enable row level security;
alter table public.student_package_cycles enable row level security;

drop policy if exists "program types org read" on public.program_types;
create policy "program types org read"
on public.program_types
for select
using (
  public.has_organization_access(organization_id)
  and public.current_security_role() in ('admin', 'manager', 'super_admin')
);

drop policy if exists "program types admin manage" on public.program_types;
create policy "program types admin manage"
on public.program_types
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

drop policy if exists "categories org read" on public.categories;
create policy "categories org read"
on public.categories
for select
using (
  public.has_organization_access(organization_id)
  and public.current_security_role() in ('admin', 'manager', 'super_admin')
);

drop policy if exists "categories admin manage" on public.categories;
create policy "categories admin manage"
on public.categories
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

drop policy if exists "sports branches org read" on public.sports_branches;
create policy "sports branches org read"
on public.sports_branches
for select
using (
  public.has_organization_access(organization_id)
  and public.current_security_role() in ('admin', 'manager', 'super_admin')
);

drop policy if exists "sports branches admin manage" on public.sports_branches;
create policy "sports branches admin manage"
on public.sports_branches
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

drop policy if exists "areas org read" on public.areas;
create policy "areas org read"
on public.areas
for select
using (
  public.has_organization_access(organization_id)
  and public.current_security_role() in ('admin', 'manager', 'super_admin')
);

drop policy if exists "areas admin manage" on public.areas;
create policy "areas admin manage"
on public.areas
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

drop policy if exists "session series scoped read" on public.session_series;
create policy "session series scoped read"
on public.session_series
for select
using (
  (
    public.has_organization_access(organization_id)
    and public.current_security_role() in ('admin', 'manager', 'super_admin')
  )
  or coach_profile_id = auth.uid()
  or exists (
    select 1
    from public.enrollments
    join public.parent_student_links on parent_student_links.student_id = enrollments.student_id
    where enrollments.program_id = session_series.program_id
      and parent_student_links.parent_profile_id = auth.uid()
  )
);

drop policy if exists "session series operational manage" on public.session_series;
create policy "session series operational manage"
on public.session_series
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

drop policy if exists "student package cycles scoped read" on public.student_package_cycles;
create policy "student package cycles scoped read"
on public.student_package_cycles
for select
using (
  (
    public.has_organization_access(organization_id)
    and public.current_security_role() in ('admin', 'manager', 'super_admin')
  )
  or public.coaches_student(student_id)
  or public.is_parent_of_student(student_id)
);

drop policy if exists "student package cycles operational manage" on public.student_package_cycles;
create policy "student package cycles operational manage"
on public.student_package_cycles
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

drop policy if exists "student detail profiles scoped read" on public.student_detail_profiles;
create policy "student detail profiles scoped read"
on public.student_detail_profiles
for select
using (
  public.current_security_role() in ('admin', 'manager', 'super_admin')
  or public.coaches_student(student_id)
  or public.is_parent_of_student(student_id)
);

drop policy if exists "student detail profiles operational manage" on public.student_detail_profiles;
create policy "student detail profiles operational manage"
on public.student_detail_profiles
for all
using (
  public.current_security_role() in ('admin', 'manager', 'super_admin')
  or public.coaches_student(student_id)
)
with check (
  public.current_security_role() in ('admin', 'manager', 'super_admin')
  or public.coaches_student(student_id)
);

drop policy if exists "report cards scoped read" on public.report_cards;
create policy "report cards scoped read"
on public.report_cards
for select
using (
  public.current_security_role() in ('admin', 'manager', 'super_admin')
  or public.coaches_student(student_id)
  or public.is_parent_of_student(student_id)
);

drop policy if exists "report cards operational manage" on public.report_cards;
create policy "report cards operational manage"
on public.report_cards
for all
using (
  public.current_security_role() in ('admin', 'manager', 'super_admin')
  or public.coaches_student(student_id)
)
with check (
  public.current_security_role() in ('admin', 'manager', 'super_admin')
  or public.coaches_student(student_id)
);

alter table public.pre_registration_assets
alter column public_url drop not null;

update storage.buckets
set public = false
where id = 'pre-registration-assets';
