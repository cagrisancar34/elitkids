alter table public.enrollment_session_allocations enable row level security;

drop policy if exists "enrollment allocations scoped read" on public.enrollment_session_allocations;
create policy "enrollment allocations scoped read"
on public.enrollment_session_allocations
for select
to authenticated
using (
  (
    public.has_organization_access(organization_id)
    and public.current_security_role() in ('admin', 'manager', 'super_admin')
  )
  or public.coaches_student(student_id)
  or public.is_parent_of_student(student_id)
);

drop policy if exists "enrollment allocations operational insert" on public.enrollment_session_allocations;
create policy "enrollment allocations operational insert"
on public.enrollment_session_allocations
for insert
to authenticated
with check (
  public.current_security_role() = 'super_admin'
  or (
    public.has_organization_access(organization_id)
    and public.current_security_role() in ('admin', 'manager')
  )
);

drop policy if exists "enrollment allocations operational update" on public.enrollment_session_allocations;
create policy "enrollment allocations operational update"
on public.enrollment_session_allocations
for update
to authenticated
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

drop policy if exists "enrollment allocations operational delete" on public.enrollment_session_allocations;
create policy "enrollment allocations operational delete"
on public.enrollment_session_allocations
for delete
to authenticated
using (
  public.current_security_role() = 'super_admin'
  or (
    public.has_organization_access(organization_id)
    and public.current_security_role() in ('admin', 'manager')
  )
);

drop policy if exists "enrollment allocations operational manage" on public.enrollment_session_allocations;

do $$
declare
  policy_row record;
  to_clause text;
  using_expr text;
  check_expr text;
  insert_policy_name text;
  update_policy_name text;
  delete_policy_name text;
begin
  for policy_row in
    select
      schemaname,
      tablename,
      policyname,
      roles,
      qual,
      with_check
    from pg_policies
    where schemaname = 'public'
      and cmd = 'ALL'
      and permissive = 'PERMISSIVE'
  loop
    select case
      when policy_row.roles = array['public']::name[] then ''
      else ' to ' || string_agg(format('%I', role_name::text), ', ')
    end
    into to_clause
    from unnest(policy_row.roles) as role_name;

    using_expr := coalesce(policy_row.qual, 'true');
    check_expr := coalesce(policy_row.with_check, policy_row.qual, 'true');
    insert_policy_name := left(policy_row.policyname || ' insert', 63);
    update_policy_name := left(policy_row.policyname || ' update', 63);
    delete_policy_name := left(policy_row.policyname || ' delete', 63);

    execute format('drop policy if exists %I on %I.%I', insert_policy_name, policy_row.schemaname, policy_row.tablename);
    execute format('drop policy if exists %I on %I.%I', update_policy_name, policy_row.schemaname, policy_row.tablename);
    execute format('drop policy if exists %I on %I.%I', delete_policy_name, policy_row.schemaname, policy_row.tablename);
    execute format('drop policy if exists %I on %I.%I', policy_row.policyname, policy_row.schemaname, policy_row.tablename);

    execute format(
      'create policy %I on %I.%I for insert%s with check (%s)',
      insert_policy_name,
      policy_row.schemaname,
      policy_row.tablename,
      to_clause,
      check_expr
    );

    execute format(
      'create policy %I on %I.%I for update%s using (%s) with check (%s)',
      update_policy_name,
      policy_row.schemaname,
      policy_row.tablename,
      to_clause,
      using_expr,
      check_expr
    );

    execute format(
      'create policy %I on %I.%I for delete%s using (%s)',
      delete_policy_name,
      policy_row.schemaname,
      policy_row.tablename,
      to_clause,
      using_expr
    );
  end loop;
end;
$$;

do $$
declare
  fk_row record;
  index_name text;
begin
  for fk_row in
    with fk as (
      select
        con.conrelid,
        n.nspname as schema_name,
        tbl.relname as table_name,
        con.conname,
        con.conkey
      from pg_constraint con
      join pg_class tbl on tbl.oid = con.conrelid
      join pg_namespace n on n.oid = tbl.relnamespace
      where con.contype = 'f'
        and n.nspname = 'public'
    ),
    missing as (
      select
        fk.conrelid,
        fk.schema_name,
        fk.table_name,
        fk.conname,
        array_agg(att.attname order by u.ord) as column_names,
        string_agg(format('%I', att.attname), ', ' order by u.ord) as column_sql
      from fk
      join unnest(fk.conkey) with ordinality as u(attnum, ord) on true
      join pg_attribute att on att.attrelid = fk.conrelid and att.attnum = u.attnum
      where not exists (
        select 1
        from pg_index idx
        where idx.indrelid = fk.conrelid
          and idx.indisvalid
          and idx.indpred is null
          and (idx.indkey::smallint[])[0:array_length(fk.conkey, 1) - 1] = fk.conkey
      )
      group by fk.conrelid, fk.schema_name, fk.table_name, fk.conname
    )
    select *
    from missing
    order by table_name, conname
  loop
    index_name := left(
      fk_row.table_name || '_' || array_to_string(fk_row.column_names, '_') || '_fk_idx',
      63
    );

    execute format(
      'create index if not exists %I on %I.%I (%s)',
      index_name,
      fk_row.schema_name,
      fk_row.table_name,
      fk_row.column_sql
    );
  end loop;
end;
$$;
