begin;

alter table public.travel_requests
  add column traveler_user_id uuid references auth.users(id) on delete set null;

create index travel_requests_traveler_user on public.travel_requests (traveler_user_id, created_at desc)
  where traveler_user_id is not null;

-- This function is intentionally service-role only. The application obtains the
-- actor and confirmed email from the Supabase Auth session, never from a form.
create function public.claim_traveler_requests(p_actor uuid, p_email text)
returns integer language plpgsql set search_path = '' as $$
declare linked integer;
begin
  if p_actor is null or nullif(trim(p_email), '') is null then return 0; end if;
  update public.travel_requests
    set traveler_user_id = p_actor
    where traveler_user_id is null
      and lower(customer_email) = lower(trim(p_email));
  get diagnostics linked = row_count;
  return linked;
end;
$$;

revoke all on function public.claim_traveler_requests(uuid, text) from public, anon, authenticated;
grant execute on function public.claim_traveler_requests(uuid, text) to service_role;

commit;
