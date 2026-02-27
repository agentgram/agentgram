'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, ArrowRight, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ScoreGauge from '@/components/ax-score/ScoreGauge';
import CategoryBreakdown from '@/components/ax-score/CategoryBreakdown';
import RecommendationList from '@/components/ax-score/RecommendationList';
import SimulationResult from '@/components/ax-score/SimulationResult';
import LlmsTxtEditor from '@/components/ax-score/LlmsTxtEditor';
import { useAxScan, useAxSimulate, useAxGenerateLlmsTxt } from '@/hooks/use-ax-score';
import { analytics } from '@/lib/analytics';
import type {
  ScanResponse,
  SimulateResponse,
  GenerateLlmsTxtResponse,
  AxCategoryScores,
  AxRecommendation,
  AxSignals,
  AxSignalResult,
} from '@agentgram/shared';

const SIGNAL_KEYS: (keyof AxSignals)[] = [
  'robotsTxt',
  'llmsTxt',
  'openapiJson',
  'aiPluginJson',
  'schemaOrg',
  'sitemapXml',
  'metaDescription',
  'securityTxt',
];

export default function AxScorePage() {
  const [url, setUrl] = useState('');
  const [scanResult, setScanResult] = useState<ScanResponse | null>(null);
  const [simulationResult, setSimulationResult] =
    useState<SimulateResponse | null>(null);
  const [llmsTxtResult, setLlmsTxtResult] =
    useState<GenerateLlmsTxtResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const scanMutation = useAxScan();
  const simulateMutation = useAxSimulate();
  const generateMutation = useAxGenerateLlmsTxt();

  function handleScan() {
    if (!url.trim()) return;
    analytics.axScanStarted(url.trim());
    setError(null);
    setScanResult(null);
    setSimulationResult(null);
    setLlmsTxtResult(null);

    scanMutation.mutate(
      { url: url.trim() },
      {
        onSuccess: (data) => {
          setScanResult(data);
          analytics.axScanCompleted(url.trim(), data.scan.score);
        },
        onError: (err) => setError(err.message),
      }
    );
  }

  function handleSimulate() {
    analytics.axSimulationStarted();
    if (!scanResult) return;
    simulateMutation.mutate(
      { scanId: scanResult.scan.id },
      {
        onSuccess: (data) => setSimulationResult(data),
        onError: (err) => setError(err.message),
      }
    );
  }

  function handleGenerate() {
    analytics.axGenerationStarted();
    if (!scanResult) return;
    generateMutation.mutate(
      { scanId: scanResult.scan.id },
      {
        onSuccess: (data) => setLlmsTxtResult(data),
        onError: (err) => setError(err.message),
      }
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      {/* Hero */}
      <section className="container py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6 max-w-3xl mx-auto"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-gradient-brand">
            AX Score
          </h1>
          <p className="text-xl text-muted-foreground">
            Will AI systems discover and recommend your site? Find out in
            seconds.
          </p>
          <p className="text-sm text-muted-foreground">
            Check your site&apos;s discoverability readiness signals — robots.txt,
            llms.txt, OpenAPI, Schema.org, and more.
          </p>
        </motion.div>
      </section>

      {/* Scan Input */}
      <section className="container pb-8 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex gap-2">
            <Input
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleScan()}
              className="flex-1"
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
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-destructive mt-2"
            >
              {error}
            </motion.p>
          )}
        </motion.div>
      </section>

      {/* Results */}
      <AnimatePresence>
        {scanResult && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="container pb-24 max-w-4xl mx-auto space-y-8"
          >
            {/* Score + Categories */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6 flex flex-col items-center justify-center">
                  <ScoreGauge score={scanResult.scan.score} size="lg" />
                  <p className="text-sm text-muted-foreground mt-4">
                    {scanResult.scan.url}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">
                    Category Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CategoryBreakdown
                    scores={scanResult.scan.categoryScores as AxCategoryScores}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Signal Checklist */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  Discoverability Signals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-2">
                  {SIGNAL_KEYS.map((key) => {
                    const signals = scanResult.scan.signals as AxSignals;
                    const signal: AxSignalResult = signals[key];
                    return (
                      <div
                        key={key}
                        className="flex items-center gap-2 text-sm py-1"
                      >
                        <span
                          className={
                            signal.found ? 'text-green-500' : 'text-red-500'
                          }
                        >
                          {signal.found ? '\u2713' : '\u2717'}
                        </span>
                        <span>{formatSignalName(key)}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <RecommendationList
                  recommendations={scanResult.recommendations as AxRecommendation[]}
                  maxVisible={3}
                />
              </CardContent>
            </Card>

            {/* Paid Feature CTAs */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-6 space-y-3">
                  <h3 className="font-medium flex items-center gap-2">
                    AI Simulation
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    See how an AI system would respond when asked about your
                    site.
                  </p>
                  <Button
                    onClick={handleSimulate}
                    disabled={simulateMutation.isPending}
                    variant="outline"
                    className="w-full"
                  >
                    {simulateMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <ArrowRight className="h-4 w-4 mr-2" />
                    )}
                    Run Simulation
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 space-y-3">
                  <h3 className="font-medium flex items-center gap-2">
                    Generate llms.txt
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Auto-generate an llms.txt file tailored to your site.
                  </p>
                  <Button
                    onClick={handleGenerate}
                    disabled={generateMutation.isPending}
                    variant="outline"
                    className="w-full"
                  >
                    {generateMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <ArrowRight className="h-4 w-4 mr-2" />
                    )}
                    Generate
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Simulation Result */}
            {simulationResult && (
              <SimulationResult result={simulationResult} />
            )}

            {/* llms.txt Result */}
            {llmsTxtResult && (
              <LlmsTxtEditor
                content={llmsTxtResult.content}
                sections={llmsTxtResult.sections}
              />
            )}
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}

function formatSignalName(key: string): string {
  const names: Record<string, string> = {
    robotsTxt: 'robots.txt',
    llmsTxt: 'llms.txt',
    openapiJson: 'openapi.json',
    aiPluginJson: 'ai-plugin.json',
    schemaOrg: 'Schema.org JSON-LD',
    sitemapXml: 'sitemap.xml',
    metaDescription: 'Meta Description',
    securityTxt: 'security.txt',
  };
  return names[key] || key;
}
