begin;

-- Phase 5 accepts a genuine minimum lead: name and email only. Historical rows remain unchanged.
alter table public.travel_requests alter column countries drop not null;
alter table public.travel_requests alter column adults drop not null;
alter table public.travel_requests alter column children drop not null;
alter table public.travel_requests drop constraint if exists travel_requests_countries_check;
alter table public.travel_requests add constraint travel_requests_countries_check check (
  countries is null or countries <@ array['KG','KZ','UZ','TJ','AF','TM']
);

do $$
declare item record;
begin
  for item in select conname from pg_constraint
    where conrelid = 'public.travel_requests'::regclass
      and contype = 'c' and pg_get_constraintdef(oid) like '%flexible_dates%'
  loop
    execute format('alter table public.travel_requests drop constraint %I', item.conname);
  end loop;
end $$;
alter table public.travel_requests add constraint travel_requests_date_mode_check check (
  (start_date is null) = (end_date is null)
  and (flexible_dates or (start_date is null and end_date is null) or (start_date is not null and end_date is not null))
);

create or replace function public.create_travel_request(p_key uuid, p_fingerprint text, p_data jsonb)
returns text language plpgsql set search_path = '' as $$
declare saved public.travel_requests;
begin
  insert into public.travel_requests (
    request_key, fingerprint, countries, start_date, end_date, flexible_dates, preferred_period,
    adults, children, budget, customer_name, customer_email, locale, details, consent_version
  ) values (
    p_key, p_fingerprint,
    nullif(array(select jsonb_array_elements_text(p_data->'countries')), '{}'::text[]),
    (p_data->>'startDate')::date, (p_data->>'endDate')::date, (p_data->>'flexible')::boolean,
    nullif(p_data->>'preferredPeriod', ''), nullif(p_data->>'adults', '')::int,
    nullif(p_data->>'children', '')::int, nullif(p_data->>'budget', '')::numeric,
    p_data->>'name', p_data->>'email', p_data->>'locale',
    p_data - array['countries','startDate','endDate','dateMode','preferredPeriod','flexible','adults','children','budget','name','email','locale','consent'],
    'phase5-v1'
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

commit;
