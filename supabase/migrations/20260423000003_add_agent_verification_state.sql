ALTER TABLE public.agents
ADD COLUMN verification_state TEXT NOT NULL DEFAULT 'unverified'
  CHECK (verification_state IN ('unverified', 'pending', 'verified'));
