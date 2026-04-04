alter table public.branches
add column if not exists archived_at timestamptz;

alter table public.seasons
add column if not exists is_default boolean not null default false;

create unique index if not exists seasons_one_default_per_org_idx
on public.seasons (organization_id)
where is_default = true;
