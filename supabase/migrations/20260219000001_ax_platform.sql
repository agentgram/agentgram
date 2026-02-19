-- AX Score Platform tables
-- Additive migration: no renames, no drops

-- ============================================================
-- ax_sites: registered sites per developer
-- ============================================================
CREATE TABLE ax_sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id UUID NOT NULL REFERENCES developers(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  name VARCHAR(255),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  last_scan_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(developer_id, url)
);

-- ============================================================
-- ax_scans: raw scan results
-- ============================================================
CREATE TABLE ax_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES ax_sites(id) ON DELETE CASCADE,
  developer_id UUID NOT NULL REFERENCES developers(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  category_scores JSONB NOT NULL DEFAULT '{}',
  signals JSONB NOT NULL DEFAULT '{}',
  model_output TEXT,
  model_name VARCHAR(100),
  scan_type VARCHAR(20) NOT NULL DEFAULT 'manual' CHECK (scan_type IN ('manual', 'scheduled', 'api')),
  status VARCHAR(20) NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  error_message TEXT,
  duration_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ax_recommendations: parsed action items from scan
-- ============================================================
CREATE TABLE ax_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID NOT NULL REFERENCES ax_scans(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL,
  priority VARCHAR(10) NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
  title VARCHAR(300) NOT NULL,
  description TEXT NOT NULL,
  current_state TEXT,
  suggested_fix TEXT,
  impact_score INTEGER CHECK (impact_score >= 0 AND impact_score <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ax_usage: monthly usage counters per developer
-- ============================================================
CREATE TABLE ax_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id UUID NOT NULL REFERENCES developers(id) ON DELETE CASCADE,
  month VARCHAR(7) NOT NULL, -- '2026-02'
  scans_used INTEGER NOT NULL DEFAULT 0,
  simulations_used INTEGER NOT NULL DEFAULT 0,
  generations_used INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(developer_id, month)
);

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX idx_ax_sites_developer_created ON ax_sites(developer_id, created_at DESC);
CREATE INDEX idx_ax_scans_site_created ON ax_scans(site_id, created_at DESC);
CREATE INDEX idx_ax_scans_developer_created ON ax_scans(developer_id, created_at DESC);
CREATE INDEX idx_ax_recommendations_scan ON ax_recommendations(scan_id);
CREATE INDEX idx_ax_usage_developer_month ON ax_usage(developer_id, month);

-- ============================================================
-- updated_at triggers
-- ============================================================
CREATE OR REPLACE FUNCTION update_ax_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ax_sites_updated_at
  BEFORE UPDATE ON ax_sites
  FOR EACH ROW EXECUTE FUNCTION update_ax_updated_at();

CREATE TRIGGER ax_usage_updated_at
  BEFORE UPDATE ON ax_usage
  FOR EACH ROW EXECUTE FUNCTION update_ax_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================
ALTER TABLE ax_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE ax_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE ax_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ax_usage ENABLE ROW LEVEL SECURITY;

-- Service role bypass (all tables)
CREATE POLICY "Service role full access on ax_sites"
  ON ax_sites FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on ax_scans"
  ON ax_scans FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on ax_recommendations"
  ON ax_recommendations FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on ax_usage"
  ON ax_usage FOR ALL
  USING (auth.role() = 'service_role');

-- Authenticated users can read their own data via developer_members
CREATE POLICY "Developers read own ax_sites"
  ON ax_sites FOR SELECT
  USING (
    developer_id IN (
      SELECT developer_id FROM developer_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Developers read own ax_scans"
  ON ax_scans FOR SELECT
  USING (
    developer_id IN (
      SELECT developer_id FROM developer_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Developers read own ax_recommendations"
  ON ax_recommendations FOR SELECT
  USING (
    scan_id IN (
      SELECT s.id FROM ax_scans s
      WHERE s.developer_id IN (
        SELECT developer_id FROM developer_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Developers read own ax_usage"
  ON ax_usage FOR SELECT
  USING (
    developer_id IN (
      SELECT developer_id FROM developer_members WHERE user_id = auth.uid()
    )
  );

-- Back-reference: ax_sites.last_scan_id FK (deferred because ax_scans didn't exist yet)
ALTER TABLE ax_sites
  ADD CONSTRAINT fk_ax_sites_last_scan
  FOREIGN KEY (last_scan_id) REFERENCES ax_scans(id) ON DELETE SET NULL;
