#!/usr/bin/env tsx
/**
 * Formats a gstack CSO security audit report as a GitHub PR comment (Markdown).
 *
 * Usage:
 *   npx tsx .github/scripts/format-security-report.ts <report-path>
 *
 * Exits 0 and writes formatted Markdown to stdout.
 * Exits 1 on argument or parse errors (writes error to stderr).
 */

/// <reference types="node" />

import { readFileSync } from 'fs';

// ── Types ────────────────────────────────────────────────────────────────────

type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

interface Finding {
  id: number;
  severity: Severity;
  confidence: number;
  status: string;
  phase: number;
  phase_name: string;
  category: string;
  fingerprint?: string;
  title: string;
  file?: string;
  line?: number;
  commit?: string;
  description: string;
  exploit_scenario?: string;
  impact?: string;
  recommendation: string;
  playbook?: string;
}

interface Totals {
  critical: number;
  high: number;
  medium: number;
  tentative: number;
}

interface SupplyChainSummary {
  direct_deps: number;
  transitive_deps: number;
  critical_cves: number;
  high_cves: number;
  install_scripts: number;
  lockfile_present: boolean;
  lockfile_tracked: boolean;
  tools_skipped?: string[];
}

interface Trend {
  prior_report_date: string | null;
  resolved: number;
  persistent: number;
  new: number;
  direction: string;
}

interface SecurityReport {
  version: string;
  date: string;
  mode: string;
  scope: string;
  diff_mode: boolean;
  phases_run: number[];
  findings: Finding[];
  totals: Totals;
  supply_chain_summary: SupplyChainSummary;
  trend: Trend;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function severityEmoji(severity: Severity): string {
  const map: Record<Severity, string> = {
    CRITICAL: '🔴',
    HIGH: '🟠',
    MEDIUM: '🟡',
    LOW: '🔵',
    INFO: '⚪',
  };
  return map[severity] ?? '⚪';
}

function overallStatusLine(totals: Totals): string {
  if (totals.critical > 0) return '🔴 **CRITICAL — Action Required**';
  if (totals.high > 0) return '🟠 **HIGH RISK — Review Required**';
  if (totals.medium > 0) return '🟡 **MEDIUM RISK — Attention Needed**';
  return '✅ **PASSED — No Critical Issues**';
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toUTCString();
  } catch {
    return iso;
  }
}

function badge(severity: Severity): string {
  const colors: Record<Severity, string> = {
    CRITICAL: 'critical',
    HIGH: 'important',
    MEDIUM: 'yellow',
    LOW: 'informational',
    INFO: 'inactive',
  };
  const color = colors[severity] ?? 'inactive';
  return `![${severity}](https://img.shields.io/badge/${severity}-${color})`;
}

// ── Main ─────────────────────────────────────────────────────────────────────

const reportPath = process.argv[2];

if (!reportPath) {
  process.stderr.write('Error: report path argument is required.\n');
  process.stderr.write('Usage: npx tsx format-security-report.ts <path-to-report.json>\n');
  process.exit(1);
}

let report: SecurityReport;
try {
  report = JSON.parse(readFileSync(reportPath, 'utf-8')) as SecurityReport;
} catch (err) {
  process.stderr.write(`Error: failed to read or parse report at "${reportPath}": ${(err as Error).message}\n`);
  process.exit(1);
}

const { totals, supply_chain_summary: sc, trend, findings } = report;
const totalIssues = totals.critical + totals.high + totals.medium;

const lines: string[] = [];

// ── Header ───────────────────────────────────────────────────────────────────

lines.push('<!-- gstack-cso-security-audit -->');
lines.push(`## 🛡️ Security Audit — ${overallStatusLine(totals)}`);
lines.push('');
lines.push(`> Automated audit by **gstack CSO** · ${formatDate(report.date)} · scope: \`${report.scope}\`${report.diff_mode ? ' · diff mode' : ''}`);
lines.push('');

// ── Summary table ─────────────────────────────────────────────────────────────

lines.push('### Summary');
lines.push('');
lines.push('| Severity | Count |');
lines.push('|:---------|------:|');
lines.push(`| 🔴 Critical | \`${totals.critical}\` |`);
lines.push(`| 🟠 High     | \`${totals.high}\` |`);
lines.push(`| 🟡 Medium   | \`${totals.medium}\` |`);
if (totals.tentative > 0) {
  lines.push(`| ⚪ Tentative | \`${totals.tentative}\` |`);
}
lines.push('');

// ── Trend ─────────────────────────────────────────────────────────────────────

if (trend.direction === 'first_run') {
  lines.push(`> 📊 **First run** — this establishes the security baseline.`);
  lines.push('');
} else if (trend.prior_report_date) {
  const arrow =
    trend.new > trend.resolved ? '📈 worsening' :
    trend.resolved > trend.new ? '📉 improving' :
    '➡️ stable';
  lines.push(`> 📊 **Trend** (${arrow}): **+${trend.new} new** · **-${trend.resolved} resolved** · ${trend.persistent} persistent · since ${formatDate(trend.prior_report_date)}`);
  lines.push('');
}

// ── Supply chain ──────────────────────────────────────────────────────────────

const hasScIssues = sc.critical_cves > 0 || sc.high_cves > 0 || sc.install_scripts > 0;

if (hasScIssues) {
  lines.push('### ⚠️ Supply Chain Risk');
  lines.push('');
  if (sc.critical_cves > 0) lines.push(`- 🔴 **${sc.critical_cves}** critical CVE(s) in dependencies`);
  if (sc.high_cves > 0) lines.push(`- 🟠 **${sc.high_cves}** high CVE(s) in dependencies`);
  if (sc.install_scripts > 0) lines.push(`- ⚠️ **${sc.install_scripts}** package(s) with install scripts`);
  lines.push('');
} else if (sc.direct_deps > 0 || sc.transitive_deps > 0) {
  lines.push(`> ✅ **Supply chain**: ${sc.direct_deps} direct + ${sc.transitive_deps} transitive deps scanned — no CVEs found`);
  lines.push('');
}

if (!sc.lockfile_present || !sc.lockfile_tracked) {
  lines.push(`> ⚠️ **Lockfile**: present=${sc.lockfile_present} tracked=${sc.lockfile_tracked} — lockfile should be committed`);
  lines.push('');
}

// ── Findings ─────────────────────────────────────────────────────────────────

if (findings.length === 0) {
  lines.push('### ✅ No Issues Found');
  lines.push('');
  lines.push('No security issues detected in this changeset.');
  lines.push('');
} else {
  lines.push(`### Findings (${totalIssues})`);
  lines.push('');

  // Critical and High always expanded; Medium and below collapsed
  for (const finding of findings) {
    const emoji = severityEmoji(finding.severity);
    const isExpanded = finding.severity === 'CRITICAL' || finding.severity === 'HIGH';
    const openAttr = isExpanded ? ' open' : '';

    lines.push(`<details${openAttr}>`);
    lines.push(`<summary>${emoji} <strong>[${finding.severity}]</strong> ${finding.title}</summary>`);
    lines.push('');
    lines.push(`| Field | Value |`);
    lines.push(`|-------|-------|`);
    lines.push(`| **Category** | ${finding.category} |`);
    lines.push(`| **Phase** | ${finding.phase_name} |`);
    if (finding.file) {
      const loc = finding.line ? `\`${finding.file}\`:${finding.line}` : `\`${finding.file}\``;
      lines.push(`| **Location** | ${loc} |`);
    }
    lines.push(`| **Confidence** | ${finding.confidence}/10 |`);
    lines.push(`| **Status** | ${finding.status} |`);
    lines.push('');
    lines.push(`**Description**`);
    lines.push('');
    lines.push(finding.description);
    lines.push('');
    if (finding.impact) {
      lines.push(`**Impact**`);
      lines.push('');
      lines.push(finding.impact);
      lines.push('');
    }
    if (finding.exploit_scenario) {
      lines.push(`**Exploit Scenario**`);
      lines.push('');
      lines.push(finding.exploit_scenario);
      lines.push('');
    }
    lines.push(`**Recommendation**`);
    lines.push('');
    lines.push(finding.recommendation);
    lines.push('');
    if (finding.playbook) {
      lines.push(`**Playbook**`);
      lines.push('');
      lines.push(finding.playbook);
      lines.push('');
    }
    lines.push('</details>');
    lines.push('');
  }
}

// ── Footer ────────────────────────────────────────────────────────────────────

lines.push('---');
lines.push(`<sub>Report: \`${reportPath}\` · gstack CSO v${report.version} · [Security Policy](../../SECURITY.md)</sub>`);

process.stdout.write(lines.join('\n'));
