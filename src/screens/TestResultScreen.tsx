import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Animated,
  Share,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, spacing, radius, fontSize } from '../common/theme';
import { RootStackParamList, TestResult, TestCategory } from '../common/types';
import { formatReportText, createReport } from '../utils/reportUtils';
import StatusBadge from '../components/StatusBadge';
import ProgressBar from '../components/ProgressBar';
import DeviceInfo from 'react-native-device-info';

type Props = NativeStackScreenProps<RootStackParamList, 'TestResult'>;

const CATEGORY_ICONS: Record<TestCategory, string> = {
  Display: '🖥️', Touch: '👆', Audio: '🔊', Camera: '📷',
  Sensors: '🧭', Connectivity: '📡', Battery: '🔋', Hardware: '⚙️',
};

export default function TestResultScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { results } = route.params;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  const skipped = results.filter(r => r.status === 'skipped').length;
  const passRate = results.length > 0 ? Math.round((passed / results.length) * 100) : 0;

  const isHealthy = passRate >= 80;
  const healthColor = passRate >= 80 ? colors.success : passRate >= 60 ? colors.warning : colors.error;
  const healthLabel = passRate >= 80 ? 'Excellent' : passRate >= 60 ? 'Fair' : 'Poor';

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const categories = [...new Set(results.map(r => r.category))] as TestCategory[];

  const shareReport = async () => {
    const report = createReport(results, DeviceInfo.getModel(), DeviceInfo.getBrand());
    const text = formatReportText(report);
    await Share.share({ message: text, title: 'Xphones Diagnostic Report' });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Main')}>
          <Text style={styles.homeBtn}>🏠 Home</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Test Results</Text>
        <TouchableOpacity onPress={shareReport}>
          <Text style={styles.shareBtn}>📤 Share</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Score Card */}
        <Animated.View style={[styles.scoreCard, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}>
          <View style={[styles.scoreBadge, { backgroundColor: `${healthColor}20`, borderColor: healthColor }]}>
            <Text style={styles.scoreEmoji}>{isHealthy ? '🏆' : passRate >= 60 ? '⚠️' : '🔴'}</Text>
            <Text style={[styles.scoreValue, { color: healthColor }]}>{passRate}%</Text>
            <Text style={[styles.scoreLabel, { color: healthColor }]}>{healthLabel}</Text>
          </View>
          <Text style={styles.scoreTitle}>Device Health Score</Text>
          <ProgressBar progress={passRate} color={healthColor} height={10} />

          <View style={styles.scoreSummary}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{results.length}</Text>
              <Text style={styles.summaryLabel}>Total</Text>
            </View>
            <View style={[styles.summaryDivider]} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: colors.success }]}>{passed}</Text>
              <Text style={styles.summaryLabel}>Passed ✅</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: colors.error }]}>{failed}</Text>
              <Text style={styles.summaryLabel}>Failed ❌</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: colors.warning }]}>{skipped}</Text>
              <Text style={styles.summaryLabel}>Skipped</Text>
            </View>
          </View>
        </Animated.View>

        {/* Failed Tests First */}
        {failed > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚠️  Issues Found ({failed})</Text>
            {results
              .filter(r => r.status === 'fail')
              .map(r => (
                <View key={r.testId} style={styles.resultRow}>
                  <View style={styles.resultLeft}>
                    <Text style={styles.resultIcon}>{CATEGORY_ICONS[r.category]}</Text>
                    <View>
                      <Text style={styles.resultName}>{r.name}</Text>
                      <Text style={styles.resultValue}>{r.value}</Text>
                    </View>
                  </View>
                  <StatusBadge status={r.status} size="sm" />
                </View>
              ))}
          </View>
        )}

        {/* Results by Category */}
        {categories.map(cat => {
          const catResults = results.filter(r => r.category === cat);
          const catPassed = catResults.filter(r => r.status === 'pass').length;
          const catTotal = catResults.length;
          const catRate = Math.round((catPassed / catTotal) * 100);

          return (
            <View key={cat} style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>{CATEGORY_ICONS[cat]} {cat}</Text>
                <Text style={[styles.catRate, { color: catRate === 100 ? colors.success : catRate >= 60 ? colors.warning : colors.error }]}>
                  {catPassed}/{catTotal}
                </Text>
              </View>
              {catResults.map(r => (
                <View key={r.testId} style={styles.resultRow}>
                  <View style={styles.resultLeft}>
                    <View>
                      <Text style={styles.resultName}>{r.name}</Text>
                      {r.value ? <Text style={styles.resultValue}>{r.value}</Text> : null}
                    </View>
                  </View>
                  <StatusBadge status={r.status} size="sm" />
                </View>
              ))}
            </View>
          );
        })}

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnSecondary]}
            onPress={() => navigation.navigate('RunningTest', { selectedCategories: 'all' })}
          >
            <Text style={styles.actionBtnText}>🔄  Run Again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={shareReport}>
            <Text style={[styles.actionBtnText, { color: colors.background }]}>📊  Export Report</Text>
          </TouchableOpacity>
        </View>

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
  homeBtn: { fontSize: fontSize.sm, color: colors.primary, fontWeight: '600' },
  headerTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  shareBtn: { fontSize: fontSize.sm, color: colors.primary, fontWeight: '600' },
  scroll: { padding: spacing.md },
  scoreCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  scoreBadge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  scoreEmoji: { fontSize: 28 },
  scoreValue: { fontSize: fontSize.xxl, fontWeight: '900' },
  scoreLabel: { fontSize: fontSize.xs, fontWeight: '700', letterSpacing: 1 },
  scoreTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  scoreSummary: {
    flexDirection: 'row',
    marginTop: spacing.md,
    width: '100%',
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryValue: { fontSize: fontSize.xxl, fontWeight: '800', color: colors.text },
  summaryLabel: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  summaryDivider: { width: 1, backgroundColor: colors.cardBorder, marginVertical: 4 },
  section: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  catRate: { fontSize: fontSize.sm, fontWeight: '700' },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  resultLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 10 },
  resultIcon: { fontSize: 20 },
  resultName: { fontSize: fontSize.sm, color: colors.text, fontWeight: '500' },
  resultValue: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: spacing.sm,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  actionBtnSecondary: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  actionBtnText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
  },
});
