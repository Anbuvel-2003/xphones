import { TestResult, DiagnosticReport } from '../common/types';

let savedReports: DiagnosticReport[] = [];

export function createReport(
  results: TestResult[],
  deviceModel: string,
  deviceBrand: string,
): DiagnosticReport {
  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  const skipped = results.filter(r => r.status === 'skipped').length;

  const report: DiagnosticReport = {
    id: `report_${Date.now()}`,
    deviceModel,
    deviceBrand,
    timestamp: Date.now(),
    totalTests: results.length,
    passed,
    failed,
    skipped,
    results,
  };

  savedReports = [report, ...savedReports.slice(0, 9)]; // keep last 10
  return report;
}

export function getSavedReports(): DiagnosticReport[] {
  return savedReports;
}

export function getPassRate(report: DiagnosticReport): number {
  if (report.totalTests === 0) return 0;
  return Math.round((report.passed / report.totalTests) * 100);
}

export function formatReportText(report: DiagnosticReport): string {
  const date = new Date(report.timestamp).toLocaleString();
  const passRate = getPassRate(report);

  let text = `XPHONES DIAGNOSTIC REPORT\n`;
  text += `========================\n\n`;
  text += `Device: ${report.deviceBrand} ${report.deviceModel}\n`;
  text += `Date: ${date}\n`;
  text += `Pass Rate: ${passRate}%\n\n`;
  text += `SUMMARY\n`;
  text += `-------\n`;
  text += `Total Tests: ${report.totalTests}\n`;
  text += `Passed: ${report.passed} ✅\n`;
  text += `Failed: ${report.failed} ❌\n`;
  text += `Skipped: ${report.skipped} ⏭️\n\n`;
  text += `DETAILED RESULTS\n`;
  text += `----------------\n`;

  report.results.forEach(r => {
    const icon = r.status === 'pass' ? '✅' : r.status === 'fail' ? '❌' : '⏭️';
    text += `${icon} ${r.name}: ${r.status.toUpperCase()}`;
    if (r.value) text += ` (${r.value})`;
    text += '\n';
  });

  return text;
}
