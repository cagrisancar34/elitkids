alter table public.lead_submissions
add column if not exists source text not null default 'organic_home'
check (source in ('organic_home', 'organic_seo_page', 'gbp', 'whatsapp', 'phone'));

create index if not exists lead_submissions_org_source_created_at_idx
  on public.lead_submissions (organization_id, source, created_at desc);
