do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'payload_cms') then
    create role payload_cms
      nologin
      noinherit
      nosuperuser
      nocreatedb
      nocreaterole
      noreplication;
  end if;
end
$$;

alter role payload_cms set search_path = public_cms;

create schema if not exists public_cms authorization payload_cms;
alter schema public_cms owner to payload_cms;

revoke all on schema public_cms from public, anon, authenticated, service_role;
grant usage, create on schema public_cms to payload_cms;
grant connect on database postgres to payload_cms;

alter default privileges for role payload_cms in schema public_cms
  revoke all on tables from public, anon, authenticated, service_role;
alter default privileges for role payload_cms in schema public_cms
  revoke all on sequences from public, anon, authenticated, service_role;
alter default privileges for role payload_cms in schema public_cms
  revoke all on functions from public, anon, authenticated, service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'public-cms-media',
  'public-cms-media',
  true,
  20971520,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Public CMS media is publicly readable'
  ) then
    create policy "Public CMS media is publicly readable"
      on storage.objects
      for select
      using (bucket_id = 'public-cms-media');
  end if;
end
$$;
