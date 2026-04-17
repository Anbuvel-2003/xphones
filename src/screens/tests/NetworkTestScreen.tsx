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
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import DeviceInfo from 'react-native-device-info';
import { colors, fontSize, radius, spacing } from '../../common/theme';
import { RootStackParamList } from '../../common/types';
import InfoRow from '../../components/InfoRow';

type Props = NativeStackScreenProps<RootStackParamList, 'NetworkTest'>;

interface NetworkInfo {
  type: string;
  isConnected: boolean;
  isInternetReachable: boolean | null;
  ipAddress: string;
  macAddress: string;
  carrier: string;
  details: any;
}

export default function NetworkTestScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [pingResult, setPingResult] = useState<string | null>(null);
  const [pinging, setPinging] = useState(false);

  const fetchNetwork = async () => {
    setLoading(true);
    try {
      const [state, ip, mac, carrier] = await Promise.all([
        NetInfo.fetch(),
        DeviceInfo.getIpAddress(),
        DeviceInfo.getMacAddress(),
        DeviceInfo.getCarrier(),
      ]);
      setNetworkInfo({
        type: state.type,
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable,
        ipAddress: ip || 'N/A',
        macAddress: mac || 'N/A',
        carrier: carrier || 'Unknown',
        details: state.details,
      });
    } catch {}
    setLoading(false);
  };

  const pingTest = async () => {
    setPinging(true);
    setPingResult(null);
    const start = Date.now();
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      await fetch('https://www.google.com', { signal: controller.signal, method: 'HEAD' });
      clearTimeout(timeout);
      const ms = Date.now() - start;
      setPingResult(`✅ ${ms}ms — Internet reachable`);
    } catch {
      setPingResult(`❌ Unreachable — No internet connection`);
    }
    setPinging(false);
  };

  useEffect(() => { fetchNetwork(); }, []);

  const wifiDetails = networkInfo?.details;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>📡  Network Test</Text>
        <TouchableOpacity onPress={fetchNetwork}>
          <Text style={styles.refreshBtn}>↻</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Connection Status */}
        <View style={[
          styles.statusCard,
          { borderColor: networkInfo?.isConnected ? colors.success : colors.error },
        ]}>
          <Text style={styles.statusIcon}>
            {networkInfo?.isConnected ? '📶' : '📵'}
          </Text>
          <View>
            <Text style={[
              styles.statusText,
              { color: networkInfo?.isConnected ? colors.success : colors.error },
            ]}>
              {networkInfo?.isConnected ? 'CONNECTED' : 'DISCONNECTED'}
            </Text>
            <Text style={styles.statusSub}>
              {networkInfo?.type?.toUpperCase() ?? 'Checking...'}
            </Text>
          </View>
          {loading && <ActivityIndicator color={colors.primary} />}
        </View>

        {/* Network Details */}
        {networkInfo && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Connection Info</Text>
            <InfoRow label="Type" value={networkInfo.type || 'None'} icon="🔗" highlight />
            <InfoRow label="IP Address" value={networkInfo.ipAddress} icon="🌐" />
            <InfoRow label="MAC Address" value={networkInfo.macAddress} icon="💻" />
            <InfoRow label="Carrier" value={networkInfo.carrier} icon="📲" />
            <InfoRow
              label="Internet"
              value={networkInfo.isInternetReachable ? 'Reachable ✅' : 'Unreachable ❌'}
              icon="🌍"
              highlight
            />
          </View>
        )}

        {/* WiFi Details */}
        {networkInfo?.type === 'wifi' && wifiDetails && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>WiFi Details</Text>
            {wifiDetails.ssid && <InfoRow label="SSID" value={wifiDetails.ssid} icon="📡" highlight />}
            {wifiDetails.bssid && <InfoRow label="BSSID" value={wifiDetails.bssid} icon="🔑" />}
            {wifiDetails.strength != null && (
              <InfoRow label="Signal Strength" value={`${wifiDetails.strength}%`} icon="📊" />
            )}
            {wifiDetails.frequency != null && (
              <InfoRow label="Frequency" value={`${wifiDetails.frequency} MHz`} icon="📻" />
            )}
            {wifiDetails.linkSpeed != null && (
              <InfoRow label="Link Speed" value={`${wifiDetails.linkSpeed} Mbps`} icon="⚡" />
            )}
          </View>
        )}

        {/* Ping Test */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Internet Ping Test</Text>
          <Text style={styles.pingDesc}>Tests internet connectivity by reaching google.com</Text>
          <TouchableOpacity
            style={[styles.pingBtn, pinging && styles.pingBtnActive]}
            onPress={pingTest}
            disabled={pinging}
          >
            {pinging
              ? <ActivityIndicator color={colors.background} />
              : <Text style={styles.pingBtnText}>🏓 Run Ping Test</Text>
            }
          </TouchableOpacity>
          {pingResult && (
            <View style={[
              styles.pingResult,
              { backgroundColor: pingResult.startsWith('✅') ? colors.successBg : colors.errorBg },
            ]}>
              <Text style={[
                styles.pingResultText,
                { color: pingResult.startsWith('✅') ? colors.success : colors.error },
              ]}>
                {pingResult}
              </Text>
            </View>
          )}
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  back: { fontSize: fontSize.md, color: colors.primary, fontWeight: '600', width: 60 },
  title: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text },
  refreshBtn: { fontSize: 22, color: colors.primary, fontWeight: '700', width: 36, textAlign: 'center' },
  scroll: { padding: spacing.md, gap: 12 },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 2,
  },
  statusIcon: { fontSize: 40 },
  statusText: { fontSize: fontSize.xl, fontWeight: '900' },
  statusSub: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  cardTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  pingDesc: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  pingBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: 14,
    alignItems: 'center',
  },
  pingBtnActive: { opacity: 0.8 },
  pingBtnText: { fontSize: fontSize.md, fontWeight: '700', color: colors.background },
  pingResult: {
    marginTop: 10,
    borderRadius: radius.sm,
    padding: 12,
  },
  pingResultText: { fontSize: fontSize.md, fontWeight: '600', textAlign: 'center' },
});
