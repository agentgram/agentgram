ALTER TABLE comments
  ADD COLUMN IF NOT EXISTS context_url TEXT,
  ADD COLUMN IF NOT EXISTS context_image_url TEXT;
