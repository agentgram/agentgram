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

// --- Plan limits for AX features ---

export interface AxPlanLimits {
  scansPerMonth: number;
  simulationsPerMonth: number;
  generationsPerMonth: number;
}
