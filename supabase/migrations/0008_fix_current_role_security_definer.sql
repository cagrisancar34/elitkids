create or replace function public.current_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.user_roles
  where profile_id = auth.uid()
  order by created_at asc
  limit 1;
$$;

