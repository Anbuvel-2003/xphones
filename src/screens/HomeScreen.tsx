import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, radius, fontSize } from '../common/theme';
import { DeviceSpecs, RootStackParamList } from '../common/types';
import { fetchDeviceSpecs, formatBytes, getBatteryColor } from '../utils/deviceUtils';
import StatCard from '../components/StatCard';
import SectionHeader from '../components/SectionHeader';
import ProgressBar from '../components/ProgressBar';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const QUICK_TESTS = [
  { icon: '📱', label: 'Display', category: 'Display' },
  { icon: '👆', label: 'Touch', category: 'Touch' },
  { icon: '🔋', label: 'Battery', category: 'Battery' },
  { icon: '📡', label: 'Network', category: 'Connectivity' },
  { icon: '🧭', label: 'Sensors', category: 'Sensors' },
  { icon: '💾', label: 'Storage', category: 'Hardware' },
] as const;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const [specs, setSpecs] = useState<DeviceSpecs | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const data = await fetchDeviceSpecs();
      setSpecs(data);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const storageUsed = specs
    ? Math.round(((specs.totalStorage - specs.freeStorage) / specs.totalStorage) * 100)
    : 0;
  const ramUsed = specs
    ? Math.round((specs.usedMemory / specs.totalMemory) * 100)
    : 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, Technician 👋</Text>
          <Text style={styles.appTitle}>XPHONES Diagnostics</Text>
        </View>
        <TouchableOpacity style={styles.scanBtn}>
          <Text style={styles.scanBtnText}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Background Blobs for Glass Effect */}
      <View style={styles.blob1} />
      <View style={styles.blob2} />
      <View style={styles.blob3} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.primary} />}
      >
        {/* Device Card */}
        <View style={styles.deviceCard}>
          <View style={styles.deviceCardTop}>
            <View>
              <Text style={styles.deviceBrand}>{specs?.brand ?? '—'}</Text>
              <Text style={styles.deviceModel}>{specs?.model ?? 'Loading...'}</Text>
            </View>
            <View style={styles.deviceBadge}>
              <Text style={styles.deviceBadgeText}>{specs?.systemName} {specs?.systemVersion}</Text>
            </View>
          </View>
          {specs ? (
            <View style={styles.deviceCardBottom}>
              <Text style={styles.deviceStat}>📱 {specs.screenWidth} × {specs.screenHeight}</Text>
              <Text style={styles.deviceStat}>🆔 {specs.uniqueId.slice(0, 12)}...</Text>
              {specs.isEmulator && (
                <View style={styles.emulatorTag}>
                  <Text style={styles.emulatorTagText}>EMULATOR</Text>
                </View>
              )}
            </View>
          ) : null}
        </View>

        {/* Quick Stats */}
        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginVertical: 24 }} />
        ) : (
          <>
            <View style={styles.statsRow}>
              <StatCard
                icon="🔋"
                label="Battery"
                value={`${specs?.batteryLevel ?? 0}%`}
                sub={specs?.isBatteryCharging ? 'Charging ⚡' : 'Discharging'}
                color={getBatteryColor(specs?.batteryLevel ?? 0)}
              />
              <StatCard
                icon="🧠"
                label="RAM Used"
                value={`${ramUsed}%`}
                sub={formatBytes(specs?.totalMemory ?? 0)}
                color={ramUsed > 80 ? colors.error : colors.primary}
              />
            </View>
            <View style={[styles.statsRow, { marginTop: 8 }]}>
              <StatCard
                icon="💾"
                label="Storage"
                value={`${storageUsed}%`}
                sub={formatBytes(specs?.freeStorage ?? 0) + ' free'}
                color={storageUsed > 85 ? colors.warning : colors.info}
              />
              <StatCard
                icon="📡"
                label="Network"
                value={specs?.carrier !== 'Unknown' ? 'Connected' : 'No SIM'}
                sub={specs?.ipAddress ?? '—'}
                color={colors.success}
              />
            </View>
          </>
        )}

        {/* Usage Meters */}
        <SectionHeader title="Resource Usage" />
        <View style={styles.metersCard}>
          <View style={styles.meterRow}>
            <Text style={styles.meterLabel}>RAM</Text>
            <View style={styles.meterBar}>
              <ProgressBar progress={ramUsed} color={ramUsed > 80 ? colors.error : colors.primary} height={8} />
            </View>
            <Text style={styles.meterValue}>{ramUsed}%</Text>
          </View>
          <View style={styles.meterRow}>
            <Text style={styles.meterLabel}>Storage</Text>
            <View style={styles.meterBar}>
              <ProgressBar progress={storageUsed} color={colors.info} height={8} />
            </View>
            <Text style={styles.meterValue}>{storageUsed}%</Text>
          </View>
          <View style={styles.meterRow}>
            <Text style={styles.meterLabel}>Battery</Text>
            <View style={styles.meterBar}>
              <ProgressBar
                progress={specs?.batteryLevel ?? 0}
                color={getBatteryColor(specs?.batteryLevel ?? 0)}
                height={8}
              />
            </View>
            <Text style={styles.meterValue}>{specs?.batteryLevel ?? 0}%</Text>
          </View>
        </View>

        {/* Quick Tests */}
        <SectionHeader title="Quick Tests" actionLabel="All Tests" onAction={() => navigation.navigate('Main')} />
        <View style={styles.quickGrid}>
          {QUICK_TESTS.map(qt => (
            <TouchableOpacity
              key={qt.category}
              style={styles.quickBtn}
              onPress={() => navigation.navigate('RunningTest', { selectedCategories: [qt.category as any] })}
            >
              <Text style={styles.quickBtnIcon}>{qt.icon}</Text>
              <Text style={styles.quickBtnLabel}>{qt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={styles.fullTestBtn}
          onPress={() => navigation.navigate('RunningTest', { selectedCategories: 'all' })}
          activeOpacity={0.85}
        >
          <Text style={styles.fullTestBtnText}>🚀  Start Full Diagnostic</Text>
          <Text style={styles.fullTestBtnSub}>28 tests across 8 categories</Text>
        </TouchableOpacity>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  greeting: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  appTitle: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: 1,
  },
  scanBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  scanBtnText: { fontSize: 18 },
  blob1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: colors.primary + '15',
    top: -100,
    right: -100,
  },
  blob2: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: colors.info + '10',
    bottom: '10%',
    left: -150,
  },
  blob3: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#FF00FF08',
    top: '30%',
    right: -50,
  },
  scroll: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  deviceCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    marginBottom: spacing.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 5,
  },
  deviceCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  deviceBrand: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  deviceModel: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.text,
    marginTop: 2,
  },
  deviceBadge: {
    backgroundColor: 'rgba(0, 212, 255, 0.15)',
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  deviceBadgeText: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: '600',
  },
  deviceCardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 16,
    flexWrap: 'wrap',
  },
  deviceStat: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  emulatorTag: {
    backgroundColor: colors.warningBg,
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  emulatorTagText: {
    fontSize: fontSize.xs,
    color: colors.warning,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  metersCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
  },
  meterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  meterLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    width: 52,
  },
  meterBar: {
    flex: 1,
  },
  meterValue: {
    fontSize: fontSize.xs,
    color: colors.text,
    fontWeight: '600',
    width: 36,
    textAlign: 'right',
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: spacing.lg,
  },
  quickBtn: {
    width: '30.5%',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  quickBtnIcon: { 
    fontSize: 26,
    marginBottom: 6,
  },
  quickBtnLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  fullTestBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginTop: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  fullTestBtnText: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.background,
    letterSpacing: 0.5,
  },
  fullTestBtnSub: {
    fontSize: fontSize.xs,
    color: colors.background + 'AA',
    marginTop: 4,
  },
});
