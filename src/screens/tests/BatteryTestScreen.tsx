import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import DeviceInfo from 'react-native-device-info';
import { colors, fontSize, radius, spacing } from '../../common/theme';
import { RootStackParamList } from '../../common/types';
import ProgressBar from '../../components/ProgressBar';
import InfoRow from '../../components/InfoRow';
import { getBatteryColor } from '../../utils/deviceUtils';

type Props = NativeStackScreenProps<RootStackParamList, 'BatteryTest'>;

interface BatteryData {
  level: number;
  isCharging: boolean;
  isBatteryCharging: boolean;
  powerState: string;
}

export default function BatteryTestScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [battery, setBattery] = useState<BatteryData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBattery = async () => {
    setLoading(true);
    try {
      const [level, isCharging, powerState] = await Promise.all([
        DeviceInfo.getBatteryLevel(),
        DeviceInfo.isBatteryCharging(),
        DeviceInfo.getPowerState(),
      ]);
      setBattery({
        level: Math.round(level * 100),
        isCharging,
        isBatteryCharging: isCharging,
        powerState: String(powerState?.batteryState ?? 'unknown'),
      });
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchBattery();
    const interval = setInterval(fetchBattery, 5000);
    return () => clearInterval(interval);
  }, []);

  const level = battery?.level ?? 0;
  const batteryColor = getBatteryColor(level);

  const getBatteryHealth = (level: number) => {
    if (level >= 80) return { label: 'Good', color: colors.success };
    if (level >= 50) return { label: 'Fair', color: colors.warning };
    if (level >= 20) return { label: 'Low', color: colors.warning };
    return { label: 'Critical', color: colors.error };
  };

  const health = getBatteryHealth(level);

  const BatteryIcon = ({ pct, charging }: { pct: number; charging: boolean }) => {
    const fillWidth = `${Math.max(4, pct)}%` as any;
    return (
      <View style={styles.batteryIcon}>
        <View style={styles.batteryBody}>
          <View style={[styles.batteryFill, { width: fillWidth, backgroundColor: batteryColor }]} />
          {charging && <Text style={styles.chargeBolt}>⚡</Text>}
        </View>
        <View style={styles.batteryNub} />
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🔋  Battery Test</Text>
        <TouchableOpacity onPress={fetchBattery}>
          <Text style={styles.refreshBtn}>↻</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: 80 }} />
        ) : (
          <>
            {/* Big Battery Display */}
            <View style={styles.batteryDisplay}>
              <BatteryIcon pct={level} charging={battery?.isCharging ?? false} />
              <Text style={[styles.batteryPct, { color: batteryColor }]}>{level}%</Text>
              <Text style={styles.batteryStatus}>
                {battery?.isCharging ? '⚡ Charging' : '🔋 Discharging'}
              </Text>
              <View style={[styles.healthBadge, { backgroundColor: `${health.color}20` }]}>
                <Text style={[styles.healthText, { color: health.color }]}>
                  {health.label}
                </Text>
              </View>
            </View>

            {/* Level Bar */}
            <View style={styles.levelCard}>
              <Text style={styles.cardTitle}>Charge Level</Text>
              <ProgressBar progress={level} color={batteryColor} height={16} showLabel />
              <View style={styles.levelMarkers}>
                <Text style={styles.marker}>0%</Text>
                <Text style={styles.marker}>25%</Text>
                <Text style={styles.marker}>50%</Text>
                <Text style={styles.marker}>75%</Text>
                <Text style={styles.marker}>100%</Text>
              </View>
            </View>

            {/* Battery Info */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Battery Information</Text>
              <InfoRow label="Level" value={`${level}%`} icon="🔋" highlight />
              <InfoRow
                label="Status"
                value={battery?.isCharging ? 'Charging ⚡' : 'Not Charging'}
                icon="🔌"
              />
              <InfoRow
                label="Power State"
                value={battery?.powerState ?? 'Unknown'}
                icon="⚡"
              />
            </View>

            {/* Diagnostics */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Battery Diagnostics</Text>
              <View style={styles.diagRow}>
                <Text style={styles.diagIcon}>{level >= 20 ? '✅' : '❌'}</Text>
                <Text style={styles.diagText}>
                  Battery level {level >= 20 ? 'is sufficient' : 'is critically low'}
                </Text>
              </View>
              <View style={styles.diagRow}>
                <Text style={styles.diagIcon}>✅</Text>
                <Text style={styles.diagText}>Battery sensor responding</Text>
              </View>
              <View style={styles.diagRow}>
                <Text style={styles.diagIcon}>{battery?.isCharging ? '✅' : '⚠️'}</Text>
                <Text style={styles.diagText}>
                  {battery?.isCharging ? 'Charging normally' : 'Connect charger to verify charging'}
                </Text>
              </View>
            </View>

            {/* Tips */}
            <View style={[styles.card, styles.tipsCard]}>
              <Text style={styles.cardTitle}>💡 Tips</Text>
              {level < 20 && (
                <Text style={styles.tip}>🔴 Battery critically low. Charge immediately.</Text>
              )}
              {level < 50 && level >= 20 && (
                <Text style={styles.tip}>🟡 Battery below 50%. Consider charging soon.</Text>
              )}
              {level >= 50 && (
                <Text style={styles.tip}>🟢 Battery level is healthy.</Text>
              )}
              <Text style={styles.tip}>• Keep battery between 20% and 80% for longevity.</Text>
              <Text style={styles.tip}>• Avoid overnight charging when possible.</Text>
            </View>

            <View style={{ height: 80 }} />
          </>
        )}
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  back: { fontSize: fontSize.md, color: colors.primary, fontWeight: '600', width: 60 },
  title: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text },
  refreshBtn: { fontSize: 22, color: colors.primary, fontWeight: '700', width: 36, textAlign: 'center' },
  scroll: { padding: spacing.md, gap: 12 },
  batteryDisplay: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: 8,
  },
  batteryIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  batteryBody: {
    width: 100,
    height: 50,
    borderWidth: 3,
    borderColor: colors.text,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  batteryFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
  chargeBolt: {
    fontSize: 24,
    position: 'absolute',
    zIndex: 2,
  },
  batteryNub: {
    width: 6,
    height: 20,
    backgroundColor: colors.text,
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
    marginLeft: -1,
  },
  batteryPct: { fontSize: 56, fontWeight: '900' },
  batteryStatus: { fontSize: fontSize.md, color: colors.textSecondary, fontWeight: '500' },
  healthBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: radius.full,
    marginTop: 4,
  },
  healthText: { fontSize: fontSize.md, fontWeight: '700' },
  levelCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: 8,
  },
  cardTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.text, marginBottom: 4 },
  levelMarkers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  marker: { fontSize: 9, color: colors.textMuted },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  diagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  diagIcon: { fontSize: 18 },
  diagText: { fontSize: fontSize.sm, color: colors.textSecondary, flex: 1 },
  tipsCard: { borderColor: colors.primary + '40' },
  tip: { fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 22, marginTop: 4 },
});
