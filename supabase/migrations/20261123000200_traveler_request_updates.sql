begin;

-- This is intentionally service-role only. The application supplies the actor
-- from the verified Supabase Auth session and this function checks ownership
-- again before changing a request.
create function public.update_traveler_request(p_actor uuid, p_id uuid, p_data jsonb)
returns boolean language plpgsql set search_path = '' as $$
declare
  previous public.travel_requests;
  next_countries text[];
  next_start date;
  next_end date;
  next_flexible boolean;
  next_adults integer;
  next_children integer;
  next_budget numeric(10,2);
  next_interests jsonb;
  next_preferences text;
  changes jsonb;
begin
  if p_actor is null or p_id is null or jsonb_typeof(p_data) <> 'object' then return false; end if;
  select * into previous from public.travel_requests
    where id = p_id and traveler_user_id = p_actor for update;
  if not found then return false; end if;

  if jsonb_typeof(p_data->'countries') <> 'array'
     or jsonb_typeof(p_data->'flexible') <> 'boolean'
     or jsonb_typeof(p_data->'interests') <> 'array'
     or jsonb_typeof(p_data->'adults') <> 'number'
     or jsonb_typeof(p_data->'children') <> 'number'
     or jsonb_typeof(p_data->'budget') <> 'number'
     or jsonb_typeof(p_data->'preferences') <> 'string' then
    return false;
  end if;

  select array_agg(value order by value) into next_countries
    from jsonb_array_elements_text(p_data->'countries') as value;
  next_flexible := (p_data->>'flexible')::boolean;
  next_start := nullif(p_data->>'startDate', '')::date;
  next_end := nullif(p_data->>'endDate', '')::date;
  next_adults := (p_data->>'adults')::integer;
  next_children := (p_data->>'children')::integer;
  next_budget := (p_data->>'budget')::numeric(10,2);
  next_interests := p_data->'interests';
  next_preferences := p_data->>'preferences';

  if next_countries is null or array_length(next_countries, 1) > 5
     or not ('KG' = any(next_countries))
     or exists (select 1 from unnest(next_countries) as country where country not in ('KG','KZ','UZ','TJ','TM'))
     or (not next_flexible and (next_start is null or next_end is null or next_end < next_start or next_start < current_date))
     or (next_flexible and (next_start is not null or next_end is not null))
     or next_adults not between 1 and 100
     or next_children not between 0 and 100
     or next_budget <= 0
     or char_length(next_preferences) > 3000
     or jsonb_array_length(next_interests) > 11
     or exists (select 1 from jsonb_array_elements_text(next_interests) as interest
                where interest not in ('nature','road','hiking','horses','nomadic','history','lakes','winter','photo','family','culture')) then
    return false;
  end if;

  changes := jsonb_build_object(
    'event', 'traveler_updated_request',
    'actor', 'traveler',
    'fields', jsonb_strip_nulls(jsonb_build_object(
      'countries', case when previous.countries is distinct from next_countries then jsonb_build_object('from', previous.countries, 'to', next_countries) end,
      'dates', case when (previous.start_date, previous.end_date, previous.flexible_dates) is distinct from (next_start, next_end, next_flexible)
                    then jsonb_build_object('from', jsonb_build_object('startDate', previous.start_date, 'endDate', previous.end_date, 'flexible', previous.flexible_dates), 'to', jsonb_build_object('startDate', next_start, 'endDate', next_end, 'flexible', next_flexible)) end,
      'travelers', case when (previous.adults, previous.children) is distinct from (next_adults, next_children)
                         then jsonb_build_object('from', jsonb_build_object('adults', previous.adults, 'children', previous.children), 'to', jsonb_build_object('adults', next_adults, 'children', next_children)) end,
      'budget', case when previous.budget is distinct from next_budget then jsonb_build_object('from', previous.budget, 'to', next_budget) end,
      'interests', case when coalesce(previous.details->'interests', '[]'::jsonb) is distinct from next_interests then jsonb_build_object('from', coalesce(previous.details->'interests', '[]'::jsonb), 'to', next_interests) end,
      'preferences', case when coalesce(previous.details->>'preferences', '') is distinct from next_preferences then jsonb_build_object('from', coalesce(previous.details->>'preferences', ''), 'to', next_preferences) end
    ))
  );

  if changes->'fields' = '{}'::jsonb then return true; end if;

  update public.travel_requests set
    countries = next_countries,
    start_date = next_start,
    end_date = next_end,
    flexible_dates = next_flexible,
    adults = next_adults,
    children = next_children,
    budget = next_budget,
    details = previous.details || jsonb_build_object('interests', next_interests, 'preferences', next_preferences)
    where id = p_id and traveler_user_id = p_actor;

  insert into public.travel_request_events (request_id, actor_id, changes)
    values (p_id, p_actor, changes);
  return true;
end;
$$;

revoke all on function public.update_traveler_request(uuid, uuid, jsonb) from public, anon, authenticated;
grant execute on function public.update_traveler_request(uuid, uuid, jsonb) to service_role;

commit;
