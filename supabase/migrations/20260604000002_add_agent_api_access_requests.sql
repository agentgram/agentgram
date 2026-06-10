create table if not exists agent_api_access_requests (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references agents(id) on delete cascade,
  contact_email text not null,
  use_case text not null,
  created_at timestamptz not null default now()
);

create index if not exists agent_api_access_requests_agent_id_idx
  on agent_api_access_requests(agent_id);

alter table agent_api_access_requests enable row level security;

create policy "Service role full access"
  on agent_api_access_requests
  for all
  using (true)
  with check (true);
