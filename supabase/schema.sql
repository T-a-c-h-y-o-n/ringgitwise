-- RinggitWise Supabase schema
-- Run in Supabase SQL editor (https://supabase.com/dashboard/project/_/sql)
-- Table: rw_events stores funnel events

create table if not exists public.rw_events (
  id bigserial primary key,
  event text not null check (event in ('page_view','calculator_started','calculation_completed','provider_clicked','email_submitted')),
  props jsonb not null default '{}'::jsonb,
  ts timestamptz not null default now(),
  url text,
  ip text,
  ua text,
  utm_source text,
  utm_campaign text,
  created_at timestamptz not null default now()
);

-- Index for funnel queries
create index if not exists rw_events_event_idx on public.rw_events(event);
create index if not exists rw_events_ts_idx on public.rw_events(ts desc);
create index if not exists rw_events_campaign_idx on public.rw_events(utm_campaign);
create index if not exists rw_events_created_at_idx on public.rw_events(created_at desc);

-- RLS: allow anon inserts (MVP), restrict deletes/updates to service_role only
alter table public.rw_events enable row level security;

drop policy if exists "anon can insert" on public.rw_events;
create policy "anon can insert" on public.rw_events
  for insert with check (true);

drop policy if exists "anon can read" on public.rw_events;
create policy "anon can read" on public.rw_events
  for select using (true);

-- Optional: disable RLS for quick MVP (uncomment if you want open access without policies)
-- alter table public.rw_events disable row level security;

-- View: daily funnel (useful for dashboard)
create or replace view public.rw_daily_funnel as
select
  (ts::date)::text as day,
  count(*) filter (where event='page_view') as page_view,
  count(*) filter (where event='calculation_completed') as calculation_completed,
  count(*) filter (where event='provider_clicked') as provider_clicked,
  count(*) filter (where event='email_submitted') as email_submitted,
  case when count(*) filter (where event='calculation_completed') > 0
    then round(100.0 * count(*) filter (where event='provider_clicked') / count(*) filter (where event='calculation_completed'), 1)
    else 0 end as click_rate_percent
from public.rw_events
group by 1
order by 1 desc;

-- View: by campaign
create or replace view public.rw_campaign_funnel as
select
  coalesce(nullif(utm_campaign,''),'organic') as campaign,
  count(*) filter (where event='page_view') as page_view,
  count(*) filter (where event='calculation_completed') as calculation_completed,
  count(*) filter (where event='provider_clicked') as provider_clicked,
  count(*) filter (where event='email_submitted') as email_submitted
from public.rw_events
where ts >= now() - interval '30 days'
group by 1
order by provider_clicked desc;
