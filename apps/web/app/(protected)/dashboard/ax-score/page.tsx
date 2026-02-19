'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Loader2, BarChart3, Globe, Clock, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import ScoreGauge from '@/components/ax-score/ScoreGauge';
import CategoryBreakdown from '@/components/ax-score/CategoryBreakdown';
import RecommendationList from '@/components/ax-score/RecommendationList';
import ScanResultCard from '@/components/ax-score/ScanResultCard';
import { HealthBlock } from '@/components/ax-score/HealthBlock';
import { ChangeIntelligence } from '@/components/ax-score/ChangeIntelligence';
import { ProFeatureGate } from '@/components/ax-score/ProFeatureGate';
import { AlertsList } from '@/components/ax-score/AlertsList';
import { CompetitorSetCard } from '@/components/ax-score/CompetitorSetCard';
import { CompetitorComparison } from '@/components/ax-score/CompetitorComparison';
import { AddCompetitorSetDialog } from '@/components/ax-score/AddCompetitorSetDialog';
import { MonthlyReportCard } from '@/components/ax-score/MonthlyReportCard';
import {
  useAxScan,
  useAxReports,
  useAxBaselines,
  useAxCompetitorSets,
  useAxCompetitorSet,
  useAxRunComparison,
  useAxMonthlyReports,
  useAxGenerateMonthlyReport,
} from '@/hooks/use-ax-score';
import type {
  ScanResponse,
  AxCategoryScores,
  AxRecommendation,
  CompetitorComparisonResponse,
} from '@agentgram/shared';

// Plan hook — fetches current developer plan from /api/v1/developers/me
function useDeveloperPlan() {
  const [plan, setPlan] = useState<string>('free');

  useEffect(() => {
    fetch('/api/v1/developers/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.plan) {
          setPlan(data.data.plan);
        }
      })
      .catch(() => {});
  }, []);

  return { plan };
}

export default function DashboardAxScorePage() {
  const [url, setUrl] = useState('');
  const [activeScan, setActiveScan] = useState<ScanResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedSetId, setSelectedSetId] = useState<string | null>(null);
  const [comparison, setComparison] = useState<CompetitorComparisonResponse | null>(null);

  const { plan } = useDeveloperPlan();
  const scanMutation = useAxScan();
  const reportsQuery = useAxReports({ page: 1, limit: 10 });
  const baselinesQuery = useAxBaselines();
  const competitorSetsQuery = useAxCompetitorSets();
  const selectedSetQuery = useAxCompetitorSet(selectedSetId || '');
  const comparisonMutation = useAxRunComparison(selectedSetId || '');
  const monthlyReportsQuery = useAxMonthlyReports({ page: 1 });
  const generateReport = useAxGenerateMonthlyReport();

  function handleScan() {
    if (!url.trim()) return;
    setError(null);

    scanMutation.mutate(
      { url: url.trim() },
      {
        onSuccess: (data) => {
          setActiveScan(data);
          setUrl('');
        },
        onError: (err) => setError(err.message),
      }
    );
  }

  function handleRunComparison(setId: string) {
    setSelectedSetId(setId);
    comparisonMutation.mutate(undefined, {
      onSuccess: (data) => setComparison(data),
    });
  }

  const reports = reportsQuery.data?.data || [];
  const baselines = baselinesQuery.data || [];
  const currentBaseline = baselines.find((b) => b.isCurrent) || null;
  const competitorSets = competitorSetsQuery.data || [];
  const monthlyReports = monthlyReportsQuery.data?.data || [];

  // Compute health metrics from recent scans
  const latestScore = reports.length > 0 ? reports[0].score : 0;
  const previousScore = reports.length > 1 ? reports[1].score : null;
  const hasRegression =
    currentBaseline && reports.length > 0
      ? reports[0].score < currentBaseline.score - 5
      : false;
  const hasVolatility =
    reports.length >= 3
      ? (() => {
          const scores = reports.slice(0, 5).map((r: { score: number }) => r.score);
          const mean = scores.reduce((s: number, v: number) => s + v, 0) / scores.length;
          const variance = scores.reduce((s: number, v: number) => s + Math.pow(v - mean, 2), 0) / scores.length;
          return Math.sqrt(variance) > 8;
        })()
      : false;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">AX Score</h1>
        <p className="text-muted-foreground mt-1">
          Monitor your sites&apos; AI discoverability readiness.
        </p>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="competitors">Competitors</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* ==================== Overview Tab ==================== */}
        <TabsContent value="overview" className="space-y-6">
          {/* Health Block */}
          {reports.length > 0 && (
            <HealthBlock
              currentScore={latestScore}
              previousScore={previousScore}
              hasRegression={hasRegression}
              hasVolatility={hasVolatility}
            />
          )}

          {/* Quick Scan */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Scan</CardTitle>
              <CardDescription>
                Enter a URL to scan for AI discoverability signals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                  disabled={scanMutation.isPending}
                />
                <Button
                  onClick={handleScan}
                  disabled={!url.trim() || scanMutation.isPending}
                >
                  {scanMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Search className="h-4 w-4 mr-2" />
                  )}
                  Scan
                </Button>
              </div>
              {error && (
                <p className="text-sm text-destructive mt-2">{error}</p>
              )}
            </CardContent>
          </Card>

          {/* Active Scan Result */}
          {activeScan && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="p-6 flex flex-col items-center justify-center">
                    <ScoreGauge score={activeScan.scan.score} size="lg" />
                    <p className="text-sm text-muted-foreground mt-4">
                      {activeScan.scan.url}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Categories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CategoryBreakdown
                      scores={activeScan.scan.categoryScores as AxCategoryScores}
                    />
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <RecommendationList
                    recommendations={activeScan.recommendations as AxRecommendation[]}
                  />
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Change Intelligence */}
          <ChangeIntelligence
            baseline={currentBaseline}
            currentScores={
              reports.length > 0
                ? (reports[0].categoryScores as unknown as AxCategoryScores)
                : null
            }
          />

          {/* Stats Overview */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10 text-primary">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{reports.length}</p>
                  <p className="text-xs text-muted-foreground">Total Scans</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-full bg-green-500/10 text-green-500">
                  <Globe className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {new Set(reports.map((r: { url: string }) => r.url)).size}
                  </p>
                  <p className="text-xs text-muted-foreground">Sites Scanned</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-full bg-yellow-500/10 text-yellow-500">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {reports.length > 0
                      ? Math.round(
                          reports.reduce(
                            (sum: number, r: { score: number }) => sum + r.score,
                            0
                          ) / reports.length
                        )
                      : '-'}
                  </p>
                  <p className="text-xs text-muted-foreground">Avg Score</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Scans */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Recent Scans</h2>
            {reportsQuery.isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : reports.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  No scans yet. Enter a URL above to get started.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {reports.map(
                  (report: {
                    id: string;
                    url: string;
                    score: number;
                    status: string;
                    createdAt: string;
                    durationMs: number | null;
                  }) => (
                    <ScanResultCard
                      key={report.id}
                      id={report.id}
                      url={report.url}
                      score={report.score}
                      status={report.status}
                      createdAt={report.createdAt}
                      durationMs={report.durationMs}
                    />
                  )
                )}
              </div>
            )}
          </div>
        </TabsContent>

        {/* ==================== Alerts Tab ==================== */}
        <TabsContent value="alerts">
          <ProFeatureGate plan={plan} featureName="Weekly Alerts & Regression Detection">
            <AlertsList />
          </ProFeatureGate>
        </TabsContent>

        {/* ==================== Competitors Tab ==================== */}
        <TabsContent value="competitors">
          <ProFeatureGate plan={plan} featureName="Competitor Benchmarking">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold">Competitor Sets</h3>
                <AddCompetitorSetDialog />
              </div>

              {competitorSetsQuery.isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : competitorSets.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    No competitor sets yet. Create one to start benchmarking.
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2">
                  {competitorSets.map((set) => (
                    <CompetitorSetCard
                      key={set.id}
                      set={set}
                      siteCount={0}
                      avgScore={null}
                      onClick={() => handleRunComparison(set.id)}
                    />
                  ))}
                </div>
              )}

              {/* Show comparison results */}
              {comparison && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <CompetitorComparison comparison={comparison} />
                </motion.div>
              )}

              {comparisonMutation.isPending && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mr-2" />
                  <span className="text-sm text-muted-foreground">
                    Running comparison...
                  </span>
                </div>
              )}

              {/* Selected set detail */}
              {selectedSetId && selectedSetQuery.data && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      {selectedSetQuery.data.name} — Sites
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      {selectedSetQuery.data.sites.map((site) => (
                        <div
                          key={site.id}
                          className="flex items-center justify-between py-1 text-sm"
                        >
                          <span className="truncate">{site.url}</span>
                          <span className="text-muted-foreground tabular-nums">
                            {site.latestScore ?? '-'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </ProFeatureGate>
        </TabsContent>

        {/* ==================== Reports Tab ==================== */}
        <TabsContent value="reports">
          <ProFeatureGate plan={plan} featureName="Monthly Executive Reports">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold">Monthly Reports</h3>
                <Button
                  size="sm"
                  className="gap-1"
                  onClick={() => {
                    const now = new Date();
                    const month = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
                    // Use first site's latest scan as siteId
                    if (reports.length > 0) {
                      generateReport.mutate({
                        siteId: (reports[0] as { siteId: string }).siteId,
                        month,
                      });
                    }
                  }}
                  disabled={generateReport.isPending || reports.length === 0}
                >
                  {generateReport.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileText className="h-4 w-4" />
                  )}
                  Generate Report
                </Button>
              </div>

              {monthlyReportsQuery.isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : monthlyReports.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    No monthly reports yet. Generate one to get started.
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2">
                  {monthlyReports.map((report) => (
                    <MonthlyReportCard key={report.id} report={report} />
                  ))}
                </div>
              )}
            </div>
          </ProFeatureGate>
        </TabsContent>
      </Tabs>
    </div>
  );
}
