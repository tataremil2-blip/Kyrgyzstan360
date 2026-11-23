begin;

-- Preserve historical TM records without exposing TM as a selectable country again.
alter table public.travel_requests drop constraint if exists travel_requests_countries_check;
alter table public.travel_requests add constraint travel_requests_countries_check check (
  countries @> array['KG'] and countries <@ array['KG','KZ','UZ','TJ','AF','TM']
);
alter table public.travel_requests add column if not exists preferred_period text;
alter table public.travel_requests add constraint travel_requests_preferred_period_check
  check (preferred_period is null or char_length(preferred_period) between 1 and 80);
alter table public.travel_requests alter column budget drop not null;
alter table public.travel_requests drop constraint if exists travel_requests_budget_check;
alter table public.travel_requests add constraint travel_requests_budget_check
  check (budget is null or budget > 0);

create or replace function public.create_travel_request(p_key uuid, p_fingerprint text, p_data jsonb)
returns text language plpgsql set search_path = '' as $$
declare saved public.travel_requests;
begin
  insert into public.travel_requests (
    request_key, fingerprint, countries, start_date, end_date, flexible_dates, preferred_period,
    adults, children, budget, customer_name, customer_email, locale, details, consent_version
  ) values (
    p_key, p_fingerprint, array(select jsonb_array_elements_text(p_data->'countries')),
    (p_data->>'startDate')::date, (p_data->>'endDate')::date, (p_data->>'flexible')::boolean,
    nullif(p_data->>'preferredPeriod', ''),
    (p_data->>'adults')::int, (p_data->>'children')::int, nullif(p_data->>'budget', '')::numeric,
    p_data->>'name', p_data->>'email', p_data->>'locale',
    p_data - array['countries','startDate','endDate','dateMode','preferredPeriod','flexible','adults','children','budget','name','email','locale','consent'],
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

create or replace function public.update_traveler_request(p_actor uuid, p_id uuid, p_data jsonb)
returns boolean language plpgsql set search_path = '' as $$
declare
  previous public.travel_requests;
  next_countries text[];
  next_start date;
  next_end date;
  next_flexible boolean;
  next_period text;
  next_adults integer;
  next_children integer;
  next_budget numeric(10,2);
  next_interests jsonb;
  next_preferences text;
  changes jsonb;
begin
  if p_actor is null or p_id is null or jsonb_typeof(p_data) <> 'object' then return false; end if;
  select * into previous from public.travel_requests where id = p_id and traveler_user_id = p_actor for update;
  if not found then return false; end if;
  if jsonb_typeof(p_data->'countries') <> 'array' or jsonb_typeof(p_data->'flexible') <> 'boolean'
     or jsonb_typeof(p_data->'interests') <> 'array' or jsonb_typeof(p_data->'adults') <> 'number'
     or jsonb_typeof(p_data->'children') <> 'number' or jsonb_typeof(p_data->'preferences') <> 'string' then return false; end if;
  select array_agg(value order by value) into next_countries from jsonb_array_elements_text(p_data->'countries') as value;
  next_flexible := (p_data->>'flexible')::boolean;
  next_start := nullif(p_data->>'startDate', '')::date;
  next_end := nullif(p_data->>'endDate', '')::date;
  next_period := nullif(p_data->>'preferredPeriod', '');
  next_adults := (p_data->>'adults')::integer;
  next_children := (p_data->>'children')::integer;
  next_budget := nullif(p_data->>'budget', '')::numeric(10,2);
  next_interests := p_data->'interests';
  next_preferences := p_data->>'preferences';
  if next_countries is null or array_length(next_countries, 1) > 5 or not ('KG' = any(next_countries))
     or exists (select 1 from unnest(next_countries) as country where country not in ('KG','KZ','UZ','TJ','AF'))
     or (not next_flexible and (next_start is null or next_end is null or next_end < next_start or next_start < current_date))
     or (next_flexible and (next_start is not null or next_end is not null))
     or (next_period is not null and (not next_flexible or char_length(next_period) > 80))
     or next_adults not between 1 and 100 or next_children not between 0 and 100
     or (next_budget is not null and next_budget <= 0)
     or char_length(next_preferences) > 3000 or jsonb_array_length(next_interests) > 11
     or exists (select 1 from jsonb_array_elements_text(next_interests) as interest
                where interest not in ('nature','road','hiking','horses','nomadic','history','lakes','winter','photo','family','culture')) then return false; end if;
  changes := jsonb_build_object('event', 'traveler_updated_request', 'actor', 'traveler', 'fields', jsonb_strip_nulls(jsonb_build_object(
    'countries', case when previous.countries is distinct from next_countries then jsonb_build_object('from', previous.countries, 'to', next_countries) end,
    'dates', case when (previous.start_date, previous.end_date, previous.flexible_dates, previous.preferred_period) is distinct from (next_start, next_end, next_flexible, next_period) then jsonb_build_object('from', jsonb_build_object('startDate', previous.start_date, 'endDate', previous.end_date, 'flexible', previous.flexible_dates, 'preferredPeriod', previous.preferred_period), 'to', jsonb_build_object('startDate', next_start, 'endDate', next_end, 'flexible', next_flexible, 'preferredPeriod', next_period)) end,
    'travelers', case when (previous.adults, previous.children) is distinct from (next_adults, next_children) then jsonb_build_object('from', jsonb_build_object('adults', previous.adults, 'children', previous.children), 'to', jsonb_build_object('adults', next_adults, 'children', next_children)) end,
    'budget', case when previous.budget is distinct from next_budget then jsonb_build_object('from', previous.budget, 'to', next_budget) end,
    'interests', case when coalesce(previous.details->'interests', '[]'::jsonb) is distinct from next_interests then jsonb_build_object('from', coalesce(previous.details->'interests', '[]'::jsonb), 'to', next_interests) end,
    'preferences', case when coalesce(previous.details->>'preferences', '') is distinct from next_preferences then jsonb_build_object('from', coalesce(previous.details->>'preferences', ''), 'to', next_preferences) end
  )));
  if changes->'fields' = '{}'::jsonb then return true; end if;
  update public.travel_requests set countries = next_countries, start_date = next_start, end_date = next_end,
    flexible_dates = next_flexible, preferred_period = next_period, adults = next_adults, children = next_children, budget = next_budget,
    details = previous.details || jsonb_build_object('interests', next_interests, 'preferences', next_preferences)
    where id = p_id and traveler_user_id = p_actor;
  insert into public.travel_request_events (request_id, actor_id, changes) values (p_id, p_actor, changes);
  insert into public.notification_jobs (request_id, kind, payload) values (p_id, 'traveler_update_telegram', changes);
  return true;
end;
$$;

commit;
