#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Find the latest security report
const reportsDir = path.join(__dirname, '../.gstack/security-reports');
const reportFiles = fs.readdirSync(reportsDir).filter(file => file.endsWith('.json'));
const latestReport = reportFiles.sort().pop();

if (!latestReport) {
  console.log('No security reports found');
  process.exit(0);
}

const reportPath = path.join(reportsDir, latestReport);
const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

// Generate comment
let comment = '## 🔍 Security Audit Results\n\n';

// Summary
if (report.totals) {
  const { critical, high, medium, low } = report.totals;
  comment += '### Summary\n\n';
  comment += `🔴 **Critical**: ${critical || 0}\n`;
  comment += `🟠 **High**: ${high || 0}\n`;
  comment += `🟡 **Medium**: ${medium || 0}\n`;
  comment += `🟢 **Low**: ${low || 0}\n\n`;
}

// Findings
if (report.findings && report.findings.length > 0) {
  comment += '### Findings\n\n';
  
  report.findings.forEach(finding => {
    const emoji = {
      'CRITICAL': '🔴',
      'HIGH': '🟠', 
      'MEDIUM': '🟡',
      'LOW': '🟢',
      'INFO': 'ℹ️'
    }[finding.severity] || '📋';
    
    comment += `### ${emoji} ${finding.severity}: ${finding.title}\n\n`;
    comment += `**File**: \`${finding.file}:${finding.line}\`\n\n`;
    comment += `**Description**: ${finding.description}\n\n`;
    
    if (finding.recommendation) {
      comment += `**Recommendation**: ${finding.recommendation}\n\n`;
    }
    
    comment += `---\n\n`;
  });
} else {
  comment += '✅ **No security issues found.**\n\n';
}

// Additional info
if (report.trend) {
  comment += '### Trend\n\n';
  if (report.trend.new) {
    comment += `🆕 **New issues**: ${report.trend.new}\n`;
  }
  if (report.trend.resolved) {
    comment += `✅ **Resolved issues**: ${report.trend.resolved}\n`;
  }
  comment += '\n';
}

comment += '📋 **Full report**: See the artifacts for detailed security scan results.\n\n';
comment += '---\n';
comment += '⚠️ **Note**: This is an automated security audit. Please review findings carefully before merging.';

console.log(comment);

// If we want to use this as a GitHub Action script, we would use the GitHub API
// For now, this just prints the comment to stdout which can be captured by GitHub Actions