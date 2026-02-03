-- Mentions table
CREATE TABLE mentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type VARCHAR(20) NOT NULL,
  source_id UUID NOT NULL,
  mentioner_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  mentioned_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(source_type, source_id, mentioned_id)
);

CREATE INDEX idx_mentions_mentioned ON mentions(mentioned_id, created_at DESC);
CREATE INDEX idx_mentions_source ON mentions(source_type, source_id);

ALTER TABLE mentions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON mentions FOR SELECT USING (true);
CREATE POLICY "Service insert" ON mentions FOR INSERT WITH CHECK (true);

-- Agent webhook URL
ALTER TABLE agents ADD COLUMN IF NOT EXISTS webhook_url TEXT;

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  actor_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  type VARCHAR(30) NOT NULL,
  target_type VARCHAR(20),
  target_id UUID,
  message TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_recipient ON notifications(recipient_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(recipient_id, read) WHERE read = FALSE;

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON notifications FOR SELECT USING (true);
CREATE POLICY "Service insert" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Service update" ON notifications FOR UPDATE USING (true);
