begin;

create table public.staff_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  active boolean not null default true
);

create sequence public.travel_request_number;
create table public.travel_requests (
  id uuid primary key default gen_random_uuid(),
  reference_number text unique not null default ('K360-' || to_char(nextval('public.travel_request_number'), 'FM999999999999999999000000')),
  request_key uuid unique not null,
  fingerprint text not null,
  created_at timestamptz not null default now(),
  source text not null default 'website',
  status text not null default 'new' check (status in (
    'new','contacted','planning','proposal_sent','negotiating','booked','completed','lost','cancelled'
  )),
  manager_id uuid references public.staff_members(user_id) on delete set null,
  countries text[] not null check (
    countries @> array['KG'] and countries <@ array['KG','KZ','UZ','TJ','TM']
  ),
  start_date date,
  end_date date,
  flexible_dates boolean not null,
  adults integer not null check (adults between 1 and 100),
  children integer not null check (children between 0 and 100),
  budget numeric(10,2) not null check (budget > 0),
  customer_name text not null,
  customer_email text not null,
  locale text not null check (locale in ('en','ru')),
  details jsonb not null,
  consent_version text not null,
  consent_at timestamptz not null default now(),
  check ((start_date is null) = (end_date is null)),
  check (flexible_dates or start_date is not null),
  check (end_date >= start_date)
);
grant usage on sequence public.travel_request_number to service_role;
create index travel_requests_created on public.travel_requests (created_at desc, id);
create index travel_requests_status on public.travel_requests (status);
create index travel_requests_manager on public.travel_requests (manager_id);

create table public.travel_request_events (
  id bigint generated always as identity primary key,
  request_id uuid not null references public.travel_requests(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  changes jsonb not null,
  created_at timestamptz not null default now()
);
create table public.travel_request_notes (
  id bigint generated always as identity primary key,
  request_id uuid not null references public.travel_requests(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  body text not null check (char_length(body) between 1 and 3000),
  created_at timestamptz not null default now()
);
create table public.notification_jobs (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.travel_requests(id) on delete cascade,
  kind text not null check (kind in ('telegram','operator_email','customer_email')),
  state text not null default 'pending' check (state in ('pending','sending','sent','failed')),
  attempts integer not null default 0,
  available_at timestamptz not null default now(),
  error_code text,
  provider_id text,
  unique (request_id, kind)
);
create index notification_jobs_available on public.notification_jobs (available_at) where state in ('pending','sending');
create table public.trip_request_rate_limits (
  bucket text primary key,
  expires_at timestamptz not null,
  hits integer not null
);

alter table public.staff_members enable row level security;
alter table public.travel_requests enable row level security;
alter table public.travel_request_events enable row level security;
alter table public.travel_request_notes enable row level security;
alter table public.notification_jobs enable row level security;
alter table public.trip_request_rate_limits enable row level security;
revoke all on public.staff_members, public.travel_requests, public.travel_request_events,
  public.travel_request_notes, public.notification_jobs, public.trip_request_rate_limits from anon, authenticated;
grant select, insert, update, delete on public.staff_members, public.travel_requests,
  public.travel_request_events, public.travel_request_notes, public.notification_jobs,
  public.trip_request_rate_limits to service_role;

create function public.consume_trip_request_limit(p_bucket text)
returns boolean language plpgsql set search_path = '' as $$
declare count_hits integer;
begin
  delete from public.trip_request_rate_limits where expires_at <= now();
  insert into public.trip_request_rate_limits as limits (bucket, expires_at, hits)
    values (p_bucket, now() + interval '15 minutes', 1)
    on conflict (bucket) do update set hits = limits.hits + 1
    returning hits into count_hits;
  return count_hits <= 8;
end;
$$;

create function public.create_travel_request(p_key uuid, p_fingerprint text, p_data jsonb)
returns text language plpgsql set search_path = '' as $$
declare saved public.travel_requests;
begin
  insert into public.travel_requests (
    request_key, fingerprint, countries, start_date, end_date, flexible_dates,
    adults, children, budget, customer_name, customer_email, locale, details, consent_version
  ) values (
    p_key, p_fingerprint, array(select jsonb_array_elements_text(p_data->'countries')),
    (p_data->>'startDate')::date, (p_data->>'endDate')::date, (p_data->>'flexible')::boolean,
    (p_data->>'adults')::int, (p_data->>'children')::int, (p_data->>'budget')::numeric,
    p_data->>'name', p_data->>'email', p_data->>'locale',
    p_data - array['countries','startDate','endDate','flexible','adults','children','budget','name','email','locale','consent'],
    'phase1-v1'
  ) on conflict (request_key) do nothing returning * into saved;
  if found then
    insert into public.notification_jobs (request_id, kind)
      select saved.id, kind from unnest(array['telegram','operator_email','customer_email']) as kinds(kind);
  else
    select * into strict saved from public.travel_requests where request_key = p_key;
    if saved.fingerprint <> p_fingerprint then return null; end if;
  end if;
  return saved.reference_number;
end;
$$;

create function public.claim_trip_notifications(p_reference text default null)
returns setof public.notification_jobs language plpgsql set search_path = '' as $$
begin
  update public.notification_jobs set state = 'failed', error_code = 'retry_limit'
    where state = 'sending' and available_at <= now() and attempts >= 5;
  return query
    with next_jobs as (
      select j.id from public.notification_jobs j
      join public.travel_requests r on r.id = j.request_id
      where j.state in ('pending','sending') and j.available_at <= now()
        and j.attempts < 5 and (p_reference is null or r.reference_number = p_reference)
      order by j.available_at limit 12 for update of j skip locked
    )
    update public.notification_jobs j
    set state = 'sending', attempts = j.attempts + 1, available_at = now() + interval '2 minutes'
    from next_jobs where j.id = next_jobs.id returning j.*;
end;
$$;

create function public.update_travel_request(p_actor uuid, p_id uuid, p_status text, p_manager uuid, p_note text)
returns void language plpgsql set search_path = '' as $$
declare previous public.travel_requests;
begin
  if not exists (select 1 from public.staff_members where user_id = p_actor and active) then
    raise exception 'Staff access required';
  end if;
  select * into strict previous from public.travel_requests where id = p_id for update;
  if p_manager is distinct from previous.manager_id and p_manager is not null
     and not exists (select 1 from public.staff_members where user_id = p_manager and active) then
    raise exception 'Invalid manager';
  end if;
  select * into strict previous from public.travel_requests where id = p_id for update;
  if (previous.status, previous.manager_id) is distinct from (p_status, p_manager) then
    update public.travel_requests set status = p_status, manager_id = p_manager where id = p_id;
    insert into public.travel_request_events (request_id, actor_id, changes)
      values (p_id, p_actor, jsonb_build_object('status_from', previous.status, 'status_to', p_status,
        'manager_from', previous.manager_id, 'manager_to', p_manager));
  end if;
  if nullif(trim(p_note), '') is not null then
    insert into public.travel_request_notes (request_id, actor_id, body) values (p_id, p_actor, trim(p_note));
  end if;
end;
$$;

revoke all on function public.consume_trip_request_limit(text), public.create_travel_request(uuid,text,jsonb),
  public.claim_trip_notifications(text), public.update_travel_request(uuid,uuid,text,uuid,text) from public, anon, authenticated;
grant execute on function public.consume_trip_request_limit(text), public.create_travel_request(uuid,text,jsonb),
  public.claim_trip_notifications(text), public.update_travel_request(uuid,uuid,text,uuid,text) to service_role;

commit;
