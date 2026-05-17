alter table public.enrollment_session_allocations enable row level security;

drop policy if exists "enrollment allocations scoped read" on public.enrollment_session_allocations;
create policy "enrollment allocations scoped read"
on public.enrollment_session_allocations
for select
using (
  (
    public.has_organization_access(organization_id)
    and public.current_security_role() in ('admin', 'manager', 'super_admin')
  )
  or public.coaches_student(student_id)
  or public.is_parent_of_student(student_id)
);

drop policy if exists "enrollment allocations operational manage" on public.enrollment_session_allocations;
create policy "enrollment allocations operational manage"
on public.enrollment_session_allocations
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
