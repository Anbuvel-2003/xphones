import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Share,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, radius, fontSize } from '../common/theme';
import { DiagnosticReport, RootStackParamList } from '../common/types';
import { getSavedReports, formatReportText, getPassRate } from '../utils/reportUtils';
import ProgressBar from '../components/ProgressBar';

type Nav = NativeStackNavigationProp<RootStackParamList>;

function ReportCard({ report, onShare }: { report: DiagnosticReport; onShare: () => void }) {
  const passRate = getPassRate(report);
  const color = passRate >= 80 ? colors.success : passRate >= 60 ? colors.warning : colors.error;
  const date = new Date(report.timestamp).toLocaleDateString('en-US', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  return (
    <View style={styles.reportCard}>
      <View style={styles.reportTop}>
        <View>
          <Text style={styles.reportDevice}>{report.deviceBrand} {report.deviceModel}</Text>
          <Text style={styles.reportDate}>{date}</Text>
        </View>
        <View style={[styles.reportScore, { backgroundColor: `${color}20`, borderColor: color }]}>
          <Text style={[styles.reportScoreText, { color }]}>{passRate}%</Text>
        </View>
      </View>
      <ProgressBar progress={passRate} color={color} height={6} />
      <View style={styles.reportStats}>
        <Text style={styles.reportStat}>📊 {report.totalTests} tests</Text>
        <Text style={[styles.reportStat, { color: colors.success }]}>✅ {report.passed}</Text>
        <Text style={[styles.reportStat, { color: colors.error }]}>❌ {report.failed}</Text>
        {report.skipped > 0 && (
          <Text style={[styles.reportStat, { color: colors.warning }]}>⏭️ {report.skipped}</Text>
        )}
      </View>
      <TouchableOpacity style={styles.shareBtn} onPress={onShare}>
        <Text style={styles.shareBtnText}>📤 Share Report</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function ReportScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const [reports, setReports] = useState<DiagnosticReport[]>([]);

  useFocusEffect(useCallback(() => {
    setReports(getSavedReports());
  }, []));

  const shareReport = async (report: DiagnosticReport) => {
    const text = formatReportText(report);
    await Share.share({ message: text, title: 'Xphones Diagnostic Report' });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <View style={styles.header}>
        <Text style={styles.title}>📊  Reports</Text>
        {reports.length > 0 && (
          <TouchableOpacity
            onPress={async () => {
              const all = reports.map(r => formatReportText(r)).join('\n\n---\n\n');
              await Share.share({ message: all, title: 'All Diagnostic Reports' });
            }}
          >
            <Text style={styles.exportAll}>Export All</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {reports.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>No Reports Yet</Text>
            <Text style={styles.emptyDesc}>Run a diagnostic test to generate your first report.</Text>
            <TouchableOpacity
              style={styles.runTestBtn}
              onPress={() => navigation.navigate('RunningTest', { selectedCategories: 'all' })}
            >
              <Text style={styles.runTestBtnText}>🚀 Run Full Diagnostic</Text>
            </TouchableOpacity>
          </View>
        ) : (
          reports.map(r => (
            <ReportCard key={r.id} report={r} onShare={() => shareReport(r)} />
          ))
        )}
        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  title: { fontSize: fontSize.xl, fontWeight: '800', color: colors.text },
  exportAll: { fontSize: fontSize.sm, color: colors.primary, fontWeight: '600' },
  scroll: { padding: spacing.md },
  reportCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: 10,
  },
  reportTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  reportDevice: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  reportDate: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  reportScore: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 2,
    minWidth: 60,
    alignItems: 'center',
  },
  reportScoreText: { fontSize: fontSize.lg, fontWeight: '800' },
  reportStats: { flexDirection: 'row', gap: 12 },
  reportStat: { fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: '500' },
  shareBtn: {
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  shareBtnText: { fontSize: fontSize.sm, color: colors.primary, fontWeight: '600' },
  empty: {
    alignItems: 'center',
    paddingVertical: 80,
    gap: 12,
  },
  emptyIcon: { fontSize: 64 },
  emptyTitle: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text },
  emptyDesc: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  runTestBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: 24,
    paddingVertical: 14,
    marginTop: 8,
  },
  runTestBtnText: { fontSize: fontSize.md, fontWeight: '700', color: colors.background },
});
