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
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, radius, fontSize } from '../common/theme';
import { DeviceSpecs } from '../common/types';
import { fetchDeviceSpecs, formatBytes } from '../utils/deviceUtils';
import InfoRow from '../components/InfoRow';

const TABS = ['Hardware', 'Software', 'Network', 'Battery'] as const;
type Tab = typeof TABS[number];

export default function DeviceInfoScreen() {
  const insets = useSafeAreaInsets();
  const [specs, setSpecs] = useState<DeviceSpecs | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('Hardware');

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchDeviceSpecs();
      setSpecs(data);
    } catch {}
    setLoading(false);
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const renderHardware = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Processor</Text>
      <InfoRow label="CPU Cores" value={specs?.cpuCores ? `${specs.cpuCores} Cores` : 'N/A'} icon="⚙️" />
      <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Memory</Text>
      <InfoRow label="Total RAM" value={formatBytes(specs?.totalMemory ?? 0)} icon="🧠" />
      <InfoRow label="Used RAM" value={formatBytes(specs?.usedMemory ?? 0)} icon="📊" />
      <InfoRow label="Available RAM" value={formatBytes((specs?.totalMemory || 0) - (specs?.usedMemory || 0))} icon="✅" />
      <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Storage</Text>
      <InfoRow label="Total Storage" value={formatBytes(specs?.totalStorage ?? 0)} icon="💾" />
      <InfoRow label="Free Storage" value={formatBytes(specs?.freeStorage ?? 0)} icon="📂" />
      <InfoRow label="Used Storage" value={formatBytes((specs?.totalStorage ?? 0) - (specs?.freeStorage ?? 0))} icon="📁" />
      <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Display</Text>
      <InfoRow label="Resolution" value={`${specs?.screenWidth} × ${specs?.screenHeight}`} icon="📱" />
      <InfoRow label="Font Scale" value={`${specs?.fontScale}x`} icon="🔠" />
    </View>
  );

  const renderSoftware = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Identity</Text>
      <InfoRow label="Brand" value={specs?.brand ?? '—'} icon="🏷️" highlight />
      <InfoRow label="Model" value={specs?.model ?? '—'} icon="📱" highlight />
      <InfoRow label="Manufacturer" value={specs?.manufacturer ?? '—'} icon="🏭" />
      <InfoRow label="Device ID" value={specs?.deviceName ?? '—'} icon="🆔" />
      <InfoRow label="Unique ID" value={specs?.uniqueId ? specs.uniqueId.slice(0, 20) + '...' : '—'} icon="🔑" />
      <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Operating System</Text>
      <InfoRow label="System" value={specs?.systemName ?? '—'} icon="💻" />
      <InfoRow label="Version" value={specs?.systemVersion ?? '—'} icon="🔢" highlight />
      <InfoRow label="Build ID" value={specs?.buildId ?? '—'} icon="🏗️" />
      <InfoRow label="API Level" value={specs?.apiLevel ?? '—'} icon="📋" />
      <InfoRow label="Is Emulator" value={specs?.isEmulator ? 'Yes ⚠️' : 'No ✅'} icon="🤖" />
    </View>
  );

  const renderNetwork = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Connection</Text>
      <InfoRow label="Carrier" value={specs?.carrier ?? '—'} icon="📡" highlight />
      <InfoRow label="IP Address" value={specs?.ipAddress ?? '—'} icon="🌐" />
      <InfoRow label="MAC Address" value={specs?.macAddress ?? '—'} icon="🔗" />
    </View>
  );

  const renderBattery = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Battery Status</Text>
      <InfoRow label="Level" value={`${specs?.batteryLevel ?? 0}%`} icon="🔋" highlight />
      <InfoRow label="Charging" value={specs?.isBatteryCharging ? 'Yes ⚡' : 'No'} icon="🔌" />
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      
      {/* Background Blobs */}
      <View style={styles.blob1} />
      <View style={styles.blob2} />

      <View style={styles.header}>
        <Text style={styles.title}>📱  Device Info</Text>
        <TouchableOpacity style={styles.refreshBtn} onPress={load}>
          <Text style={styles.refreshBtnText}>↻</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabBar} contentContainerStyle={styles.tabBarContent}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <ActivityIndicator color={colors.primary} size="large" style={{ flex: 1 }} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} />}
        >
          <View style={styles.card}>
            {activeTab === 'Hardware' && renderHardware()}
            {activeTab === 'Software' && renderSoftware()}
            {activeTab === 'Network' && renderNetwork()}
            {activeTab === 'Battery' && renderBattery()}
          </View>
          <View style={{ height: 80 }} />
        </ScrollView>
      )}
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
  blob1: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: colors.primary + '10',
    top: '10%',
    right: -100,
  },
  blob2: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: colors.info + '08',
    bottom: '20%',
    left: -120,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.text,
  },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  refreshBtnText: {
    fontSize: 20,
    color: colors.primary,
    fontWeight: '700',
  },
  tabBar: { maxHeight: 50 },
  tabBarContent: {
    paddingHorizontal: spacing.md,
    paddingTop: 8,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  tabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  tabText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  tabTextActive: {
    color: colors.background,
  },
  scroll: { padding: spacing.md },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 4,
  },
  section: {},
  sectionTitle: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
});
