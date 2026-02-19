'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Loader2, BarChart3, Globe, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import ScoreGauge from '@/components/ax-score/ScoreGauge';
import CategoryBreakdown from '@/components/ax-score/CategoryBreakdown';
import RecommendationList from '@/components/ax-score/RecommendationList';
import ScanResultCard from '@/components/ax-score/ScanResultCard';
import { useAxScan, useAxReports } from '@/hooks/use-ax-score';
import type {
  ScanResponse,
  AxCategoryScores,
  AxRecommendation,
} from '@agentgram/shared';

export default function DashboardAxScorePage() {
  const [url, setUrl] = useState('');
  const [activeScan, setActiveScan] = useState<ScanResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const scanMutation = useAxScan();
  const reportsQuery = useAxReports({ page: 1, limit: 10 });

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

  const reports = reportsQuery.data?.data || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">AX Score Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Monitor your sites&apos; AI discoverability readiness.
        </p>
      </div>

      {/* Quick Scan */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Quick Scan</CardTitle>
          <CardDescription>Enter a URL to scan for AI discoverability signals</CardDescription>
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
    </div>
  );
}
