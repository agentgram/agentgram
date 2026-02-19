// ============================================================
// AX Score Platform — Shared Types
// ============================================================

// --- Database row types ---

export interface AxSite {
  id: string;
  developerId: string;
  url: string;
  name: string | null;
  status: 'active' | 'archived';
  lastScanId: string | null;
  industry: string | null;
  region: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AxScan {
  id: string;
  siteId: string;
  developerId: string;
  url: string;
  score: number;
  categoryScores: AxCategoryScores;
  signals: AxSignals;
  modelOutput: string | null;
  modelName: string | null;
  scanType: 'manual' | 'scheduled' | 'api';
  status: 'pending' | 'running' | 'completed' | 'failed';
  errorMessage: string | null;
  durationMs: number | null;
  createdAt: string;
}

export interface AxRecommendation {
  id: string;
  scanId: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  currentState: string | null;
  suggestedFix: string | null;
  impactScore: number | null;
  createdAt: string;
}

export interface AxUsage {
  id: string;
  developerId: string;
  month: string;
  scansUsed: number;
  simulationsUsed: number;
  generationsUsed: number;
  createdAt: string;
  updatedAt: string;
}

// --- Category Scores ---

export interface AxCategoryScores {
  discovery: number;
  apiQuality: number;
  structuredData: number;
  authOnboarding: number;
  errorHandling: number;
  documentation: number;
}

// --- Signals (raw checks) ---

export interface AxSignals {
  robotsTxt: AxSignalResult;
  llmsTxt: AxSignalResult;
  openapiJson: AxSignalResult;
  aiPluginJson: AxSignalResult;
  schemaOrg: AxSignalResult;
  sitemapXml: AxSignalResult;
  metaDescription: AxSignalResult;
  securityTxt: AxSignalResult;
}

export interface AxSignalResult {
  found: boolean;
  url?: string;
  details?: string;
}

// --- API contracts ---

export interface ScanRequest {
  url: string;
  name?: string;
}

export interface ScanResponse {
  scan: AxScan;
  site: AxSite;
  recommendations: AxRecommendation[];
}

export interface SimulateRequest {
  scanId: string;
  query?: string;
}

export interface SimulateResponse {
  scanId: string;
  query: string;
  wouldRecommend: boolean;
  reasoning: string;
  confidence: number;
  suggestions: string[];
}

export interface GenerateLlmsTxtRequest {
  scanId: string;
}

export interface GenerateLlmsTxtResponse {
  scanId: string;
  content: string;
  sections: string[];
}

// --- V2 types: baselines, alerts, competitors, monthly reports ---

export interface AxBaseline {
  id: string;
  siteId: string;
  developerId: string;
  scanId: string;
  score: number;
  categoryScores: AxCategoryScores;
  signals: AxSignals;
  label: string | null;
  isCurrent: boolean;
  createdAt: string;
}

export interface AxAlert {
  id: string;
  siteId: string;
  developerId: string;
  scanId: string | null;
  baselineId: string | null;
  alertType: 'regression' | 'volatility' | 'improvement' | 'threshold';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  category: string | null;
  scoreDelta: number | null;
  previousScore: number | null;
  currentScore: number | null;
  status: 'active' | 'acknowledged' | 'resolved' | 'dismissed';
  acknowledgedAt: string | null;
  createdAt: string;
}

export interface AxCompetitorSet {
  id: string;
  developerId: string;
  name: string;
  description: string | null;
  industry: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AxCompetitorSite {
  id: string;
  setId: string;
  url: string;
  name: string | null;
  latestScore: number | null;
  latestScanId: string | null;
  lastScannedAt: string | null;
  createdAt: string;
}

export interface AxMonthlyReport {
  id: string;
  developerId: string;
  siteId: string | null;
  month: string;
  title: string;
  summary: string | null;
  scoreTrend: Record<string, unknown> | null;
  categoryTrends: Record<string, unknown> | null;
  topRegressions: Record<string, unknown> | null;
  topImprovements: Record<string, unknown> | null;
  actionItems: Record<string, unknown> | null;
  alertCount: number;
  modelName: string | null;
  status: 'pending' | 'generating' | 'generated' | 'failed';
  createdAt: string;
}

// --- V2 API contracts ---

export interface CreateBaselineRequest {
  siteId: string;
  scanId: string;
  label?: string;
}

export interface UpdateAlertRequest {
  status: 'acknowledged' | 'resolved' | 'dismissed';
}

export interface CreateCompetitorSetRequest {
  name: string;
  description?: string;
  industry?: string;
  urls: string[];
}

export interface CompetitorComparisonResponse {
  setId: string;
  setName: string;
  sites: Array<{
    url: string;
    name: string | null;
    score: number | null;
  }>;
  developerSites: Array<{
    url: string;
    name: string | null;
    score: number | null;
    percentileRank: number | null;
  }>;
}

export interface GenerateMonthlyReportRequest {
  siteId: string;
  month: string;
}

// --- Plan limits for AX features ---

export interface AxPlanLimits {
  scansPerMonth: number;
  simulationsPerMonth: number;
  generationsPerMonth: number;
  alerts: boolean;
  competitors: boolean;
  monthlyReports: boolean;
}
