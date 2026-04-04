create or replace function public.is_admin_or_manager()
returns boolean
language sql
stable
as $$
  select public.current_role() in ('admin', 'manager');
$$;

create or replace function public.is_parent_of_student(target_student_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.parent_student_links psl
    where psl.student_id = target_student_id
      and psl.parent_profile_id = auth.uid()
  );
$$;

create or replace function public.coaches_program(target_program_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.sessions s
    where s.program_id = target_program_id
      and s.coach_profile_id = auth.uid()
  );
$$;

create or replace function public.coaches_student(target_student_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.enrollments e
    join public.sessions s on s.program_id = e.program_id
    where e.student_id = target_student_id
      and s.coach_profile_id = auth.uid()
  );
$$;

drop policy if exists "user roles self or admin read" on public.user_roles;
create policy "user roles self or admin read"
on public.user_roles
for select
using (profile_id = auth.uid() or public.current_role() = 'admin');

drop policy if exists "profiles admin manage" on public.profiles;
create policy "profiles admin manage"
on public.profiles
for all
using (public.is_admin_or_manager() or id = auth.uid())
with check (public.is_admin_or_manager() or id = auth.uid());

drop policy if exists "roles admin manage" on public.user_roles;
create policy "roles admin manage"
on public.user_roles
for all
using (public.current_role() = 'admin')
with check (public.current_role() = 'admin');

drop policy if exists "parent links scoped read" on public.parent_student_links;
create policy "parent links scoped read"
on public.parent_student_links
for select
using (public.is_admin_or_manager() or parent_profile_id = auth.uid());

drop policy if exists "parent links admin manage" on public.parent_student_links;
create policy "parent links admin manage"
on public.parent_student_links
for all
using (public.is_admin_or_manager())
with check (public.is_admin_or_manager());

drop policy if exists "students admin manage" on public.students;
create policy "students admin manage"
on public.students
for all
using (public.is_admin_or_manager())
with check (public.is_admin_or_manager());

drop policy if exists "programs scoped read" on public.programs;
create policy "programs scoped read"
on public.programs
for select
using (
  public.is_admin_or_manager()
  or public.coaches_program(id)
  or exists (
    select 1
    from public.enrollments e
    join public.parent_student_links psl on psl.student_id = e.student_id
    where e.program_id = programs.id
      and psl.parent_profile_id = auth.uid()
  )
);

drop policy if exists "programs admin manage" on public.programs;
create policy "programs admin manage"
on public.programs
for all
using (public.is_admin_or_manager())
with check (public.is_admin_or_manager());

drop policy if exists "enrollments scoped read" on public.enrollments;
create policy "enrollments scoped read"
on public.enrollments
for select
using (
  public.is_admin_or_manager()
  or public.coaches_student(student_id)
  or public.is_parent_of_student(student_id)
);

drop policy if exists "enrollments admin manage" on public.enrollments;
create policy "enrollments admin manage"
on public.enrollments
for all
using (public.is_admin_or_manager())
with check (public.is_admin_or_manager());

drop policy if exists "sessions scoped read" on public.sessions;
create policy "sessions scoped read"
on public.sessions
for select
using (
  public.is_admin_or_manager()
  or coach_profile_id = auth.uid()
  or exists (
    select 1
    from public.enrollments e
    join public.parent_student_links psl on psl.student_id = e.student_id
    where e.program_id = sessions.program_id
      and psl.parent_profile_id = auth.uid()
  )
);

drop policy if exists "sessions admin manage" on public.sessions;
create policy "sessions admin manage"
on public.sessions
for all
using (public.is_admin_or_manager() or coach_profile_id = auth.uid())
with check (public.is_admin_or_manager() or coach_profile_id = auth.uid());

drop policy if exists "attendance scoped read" on public.attendance_records;
create policy "attendance scoped read"
on public.attendance_records
for select
using (
  public.is_admin_or_manager()
  or public.coaches_student(student_id)
  or public.is_parent_of_student(student_id)
);

drop policy if exists "attendance operational write" on public.attendance_records;
create policy "attendance operational write"
on public.attendance_records
for all
using (public.is_admin_or_manager() or public.coaches_student(student_id))
with check (public.is_admin_or_manager() or public.coaches_student(student_id));

drop policy if exists "fee plans read" on public.fee_plans;
create policy "fee plans read"
on public.fee_plans
for select
using (public.is_admin_or_manager());

drop policy if exists "fee plans manage" on public.fee_plans;
create policy "fee plans manage"
on public.fee_plans
for all
using (public.is_admin_or_manager())
with check (public.is_admin_or_manager());

drop policy if exists "charges scoped read" on public.charges;
create policy "charges scoped read"
on public.charges
for select
using (
  public.is_admin_or_manager()
  or exists (
    select 1
    from public.enrollments e
    where e.id = charges.enrollment_id
      and public.is_parent_of_student(e.student_id)
  )
);

drop policy if exists "charges admin manage" on public.charges;
create policy "charges admin manage"
on public.charges
for all
using (public.is_admin_or_manager())
with check (public.is_admin_or_manager());

drop policy if exists "payments scoped read" on public.payments;
create policy "payments scoped read"
on public.payments
for select
using (
  public.is_admin_or_manager()
  or exists (
    select 1
    from public.charges c
    join public.enrollments e on e.id = c.enrollment_id
    where c.id = payments.charge_id
      and public.is_parent_of_student(e.student_id)
  )
);

drop policy if exists "payments admin manage" on public.payments;
create policy "payments admin manage"
on public.payments
for all
using (public.is_admin_or_manager())
with check (public.is_admin_or_manager());

drop policy if exists "announcements operational write" on public.announcements;
create policy "announcements operational write"
on public.announcements
for all
using (public.is_admin_or_manager())
with check (public.is_admin_or_manager());

drop policy if exists "notifications operational read" on public.notifications;
create policy "notifications operational read"
on public.notifications
for select
using (profile_id = auth.uid() or public.is_admin_or_manager());

drop policy if exists "notifications self update" on public.notifications;
create policy "notifications self update"
on public.notifications
for update
using (profile_id = auth.uid() or public.is_admin_or_manager())
with check (profile_id = auth.uid() or public.is_admin_or_manager());

drop policy if exists "support threads scoped read" on public.support_threads;
create policy "support threads scoped read"
on public.support_threads
for select
using (public.is_admin_or_manager() or parent_profile_id = auth.uid());

drop policy if exists "support threads scoped write" on public.support_threads;
create policy "support threads scoped write"
on public.support_threads
for all
using (public.is_admin_or_manager() or parent_profile_id = auth.uid())
with check (public.is_admin_or_manager() or parent_profile_id = auth.uid());

drop policy if exists "support messages scoped read" on public.support_messages;
create policy "support messages scoped read"
on public.support_messages
for select
using (
  public.is_admin_or_manager()
  or author_profile_id = auth.uid()
  or exists (
    select 1
    from public.support_threads st
    where st.id = support_messages.thread_id
      and st.parent_profile_id = auth.uid()
  )
);

drop policy if exists "support messages scoped write" on public.support_messages;
create policy "support messages scoped write"
on public.support_messages
for all
using (
  public.is_admin_or_manager()
  or author_profile_id = auth.uid()
)
with check (
  public.is_admin_or_manager()
  or author_profile_id = auth.uid()
);
