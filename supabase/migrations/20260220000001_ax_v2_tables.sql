-- AX Score V2 tables — alerts, baselines, competitors, monthly reports
-- Additive migration: no renames, no drops

-- ============================================================
-- ax_sites: add industry, region, tags columns
-- ============================================================
ALTER TABLE ax_sites ADD COLUMN IF NOT EXISTS industry VARCHAR(100);
ALTER TABLE ax_sites ADD COLUMN IF NOT EXISTS region VARCHAR(50);
ALTER TABLE ax_sites ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- ============================================================
-- ax_baselines: site snapshots for regression comparison
-- ============================================================
CREATE TABLE ax_baselines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES ax_sites(id) ON DELETE CASCADE,
  developer_id UUID NOT NULL REFERENCES developers(id) ON DELETE CASCADE,
  scan_id UUID NOT NULL REFERENCES ax_scans(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  category_scores JSONB NOT NULL DEFAULT '{}',
  signals JSONB NOT NULL DEFAULT '{}',
  label VARCHAR(100),
  is_current BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ax_alerts: weekly volatility/regression events
-- ============================================================
CREATE TABLE ax_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES ax_sites(id) ON DELETE CASCADE,
  developer_id UUID NOT NULL REFERENCES developers(id) ON DELETE CASCADE,
  scan_id UUID REFERENCES ax_scans(id) ON DELETE SET NULL,
  baseline_id UUID REFERENCES ax_baselines(id) ON DELETE SET NULL,
  alert_type VARCHAR(20) NOT NULL CHECK (alert_type IN ('regression', 'volatility', 'improvement', 'threshold')),
  severity VARCHAR(10) NOT NULL CHECK (severity IN ('critical', 'warning', 'info')),
  title VARCHAR(300) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50),
  score_delta NUMERIC,
  previous_score INTEGER,
  current_score INTEGER,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved', 'dismissed')),
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ax_competitor_sets: developer-defined comparison groups
-- ============================================================
CREATE TABLE ax_competitor_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id UUID NOT NULL REFERENCES developers(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  industry VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ax_competitor_sites: junction table for competitor set members
-- ============================================================
CREATE TABLE ax_competitor_sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  set_id UUID NOT NULL REFERENCES ax_competitor_sets(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  name VARCHAR(255),
  latest_score INTEGER,
  latest_scan_id UUID REFERENCES ax_scans(id) ON DELETE SET NULL,
  last_scanned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(set_id, url)
);

-- ============================================================
-- ax_monthly_reports: generated summary artifacts
-- ============================================================
CREATE TABLE ax_monthly_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id UUID NOT NULL REFERENCES developers(id) ON DELETE CASCADE,
  site_id UUID REFERENCES ax_sites(id) ON DELETE SET NULL,
  month VARCHAR(7) NOT NULL,
  title VARCHAR(300) NOT NULL,
  summary TEXT,
  score_trend JSONB,
  category_trends JSONB,
  top_regressions JSONB,
  top_improvements JSONB,
  action_items JSONB,
  alert_count INTEGER NOT NULL DEFAULT 0,
  model_name VARCHAR(100),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'generated', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(developer_id, site_id, month)
);

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX idx_ax_baselines_site_current ON ax_baselines(site_id, is_current) WHERE is_current = true;
CREATE INDEX idx_ax_baselines_developer ON ax_baselines(developer_id, created_at DESC);
CREATE INDEX idx_ax_alerts_developer_status ON ax_alerts(developer_id, status, created_at DESC);
CREATE INDEX idx_ax_alerts_site ON ax_alerts(site_id, created_at DESC);
CREATE INDEX idx_ax_competitor_sets_developer ON ax_competitor_sets(developer_id, created_at DESC);
CREATE INDEX idx_ax_competitor_sites_set ON ax_competitor_sites(set_id);
CREATE INDEX idx_ax_monthly_reports_developer ON ax_monthly_reports(developer_id, created_at DESC);
CREATE INDEX idx_ax_monthly_reports_site_month ON ax_monthly_reports(site_id, month);

-- ============================================================
-- updated_at trigger (reuse existing function)
-- ============================================================
CREATE TRIGGER ax_competitor_sets_updated_at
  BEFORE UPDATE ON ax_competitor_sets
  FOR EACH ROW EXECUTE FUNCTION update_ax_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================
ALTER TABLE ax_baselines ENABLE ROW LEVEL SECURITY;
ALTER TABLE ax_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ax_competitor_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ax_competitor_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE ax_monthly_reports ENABLE ROW LEVEL SECURITY;

-- Service role bypass (all tables)
CREATE POLICY "Service role full access on ax_baselines"
  ON ax_baselines FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on ax_alerts"
  ON ax_alerts FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on ax_competitor_sets"
  ON ax_competitor_sets FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on ax_competitor_sites"
  ON ax_competitor_sites FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on ax_monthly_reports"
  ON ax_monthly_reports FOR ALL
  USING (auth.role() = 'service_role');

-- Authenticated users can read their own data via developer_members
CREATE POLICY "Developers read own ax_baselines"
  ON ax_baselines FOR SELECT
  USING (
    developer_id IN (
      SELECT developer_id FROM developer_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Developers read own ax_alerts"
  ON ax_alerts FOR SELECT
  USING (
    developer_id IN (
      SELECT developer_id FROM developer_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Developers read own ax_competitor_sets"
  ON ax_competitor_sets FOR SELECT
  USING (
    developer_id IN (
      SELECT developer_id FROM developer_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Developers read own ax_competitor_sites"
  ON ax_competitor_sites FOR SELECT
  USING (
    set_id IN (
      SELECT cs.id FROM ax_competitor_sets cs
      WHERE cs.developer_id IN (
        SELECT developer_id FROM developer_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Developers read own ax_monthly_reports"
  ON ax_monthly_reports FOR SELECT
  USING (
    developer_id IN (
      SELECT developer_id FROM developer_members WHERE user_id = auth.uid()
    )
  );
