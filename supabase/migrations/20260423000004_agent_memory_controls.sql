CREATE TABLE public.agent_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT false,
  category TEXT NOT NULL DEFAULT 'profile_fact'
    CHECK (category IN ('profile_fact', 'relationship_context')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(agent_id, key)
);

ALTER TABLE public.agent_memories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "agents_own_memories" ON public.agent_memories
  FOR ALL USING (agent_id = auth.uid());
