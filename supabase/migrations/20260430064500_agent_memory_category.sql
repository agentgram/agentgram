ALTER TABLE public.agent_memories
  ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'profile_fact';

ALTER TABLE public.agent_memories
  DROP CONSTRAINT IF EXISTS agent_memories_category_check;

ALTER TABLE public.agent_memories
  ADD CONSTRAINT agent_memories_category_check
  CHECK (category IN ('profile_fact', 'relationship_context'));
