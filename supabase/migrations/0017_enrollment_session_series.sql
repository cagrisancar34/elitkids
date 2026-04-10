alter table public.enrollments
  add column if not exists session_series_id uuid references public.session_series (id) on delete set null;

create index if not exists enrollments_session_series_id_idx
  on public.enrollments (session_series_id);

create index if not exists enrollments_session_series_date_idx
  on public.enrollments (session_series_id, starts_on, ends_on);

with ranked_series as (
  select
    e.id as enrollment_id,
    ss.id as session_series_id,
    row_number() over (
      partition by e.id
      order by
        case
          when e.starts_on between ss.starts_on and ss.ends_on then 0
          else 1
        end,
        abs(ss.starts_on - e.starts_on),
        ss.starts_on
    ) as rank_order
  from public.enrollments e
  join public.session_series ss
    on ss.program_id = e.program_id
  where e.session_series_id is null
)
update public.enrollments e
set session_series_id = ranked_series.session_series_id
from ranked_series
where e.id = ranked_series.enrollment_id
  and ranked_series.rank_order = 1;
