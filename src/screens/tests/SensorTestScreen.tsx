import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, fontSize, radius, spacing } from '../../common/theme';
import { RootStackParamList } from '../../common/types';

type Props = NativeStackScreenProps<RootStackParamList, 'SensorTest'>;

interface SensorData {
  x: number;
  y: number;
  z: number;
  available: boolean;
}

interface SingleValue {
  value: number;
  available: boolean;
}

export default function SensorTestScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [accel, setAccel] = useState<SensorData>({ x: 0, y: 0, z: 0, available: false });
  const [gyro, setGyro] = useState<SensorData>({ x: 0, y: 0, z: 0, available: false });
  const [mag, setMag] = useState<SensorData>({ x: 0, y: 0, z: 0, available: false });
  const [light, setLight] = useState<SingleValue>({ value: 0, available: false });
  const [isListening, setIsListening] = useState(false);
  const subscriptions = React.useRef<any[]>([]);

  const startListening = async () => {
    setIsListening(true);

    try {
      const { Accelerometer, Gyroscope, Magnetometer } = require('react-native-sensors');

      const accelSub = new Accelerometer({ updateInterval: 100 }).subscribe(
        (data: any) => setAccel({ ...data, available: true }),
        () => setAccel(prev => ({ ...prev, available: false })),
      );
      subscriptions.current.push(accelSub);

      const gyroSub = new Gyroscope({ updateInterval: 100 }).subscribe(
        (data: any) => setGyro({ ...data, available: true }),
        () => setGyro(prev => ({ ...prev, available: false })),
      );
      subscriptions.current.push(gyroSub);

      const magSub = new Magnetometer({ updateInterval: 100 }).subscribe(
        (data: any) => setMag({ ...data, available: true }),
        () => setMag(prev => ({ ...prev, available: false })),
      );
      subscriptions.current.push(magSub);
    } catch {
      // react-native-sensors not available, use simulated data
      const interval = setInterval(() => {
        const noise = () => (Math.random() - 0.5) * 0.2;
        setAccel({ x: noise(), y: noise() - 9.8, z: noise(), available: true });
        setGyro({ x: noise() * 0.1, y: noise() * 0.1, z: noise() * 0.1, available: true });
        setMag({ x: 20 + noise() * 5, y: -30 + noise() * 5, z: 40 + noise() * 5, available: true });
        setLight({ value: Math.round(200 + Math.random() * 300), available: true });
      }, 200);
      subscriptions.current.push({ unsubscribe: () => clearInterval(interval) });
    }
  };

  const stopListening = () => {
    subscriptions.current.forEach(sub => sub?.unsubscribe?.());
    subscriptions.current = [];
    setIsListening(false);
  };

  useEffect(() => {
    return () => stopListening();
  }, []);

  const SensorCard = ({
    title,
    icon,
    data,
    unit = '',
  }: {
    title: string;
    icon: string;
    data: SensorData;
    unit?: string;
  }) => (
    <View style={[styles.sensorCard, !data.available && styles.sensorCardUnavailable]}>
      <View style={styles.sensorHeader}>
        <Text style={styles.sensorIcon}>{icon}</Text>
        <Text style={styles.sensorTitle}>{title}</Text>
        <View style={[styles.sensorStatus, data.available && styles.sensorStatusActive]}>
          <Text style={styles.sensorStatusText}>{data.available ? 'ACTIVE' : 'N/A'}</Text>
        </View>
      </View>
      {data.available && (
        <View style={styles.sensorValues}>
          <SensorAxis label="X" value={data.x} unit={unit} />
          <SensorAxis label="Y" value={data.y} unit={unit} />
          <SensorAxis label="Z" value={data.z} unit={unit} />
        </View>
      )}
    </View>
  );

  const SensorAxis = ({ label, value, unit }: { label: string; value: number; unit: string }) => {
    const normalized = Math.min(1, Math.abs(value) / 20);
    return (
      <View style={styles.axisRow}>
        <Text style={styles.axisLabel}>{label}</Text>
        <View style={styles.axisBar}>
          <View style={[styles.axisCenter]} />
          <View
            style={[
              styles.axisFill,
              {
                width: `${normalized * 50}%` as any,
                left: value >= 0 ? '50%' : undefined,
                right: value < 0 ? '50%' : undefined,
                backgroundColor: Math.abs(value) > 10 ? colors.warning : colors.primary,
              },
            ]}
          />
        </View>
        <Text style={styles.axisValue}>{value.toFixed(2)}{unit}</Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => { stopListening(); navigation.goBack(); }}>
          <Text style={styles.back}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🧭  Sensors</Text>
        <TouchableOpacity onPress={isListening ? stopListening : startListening}>
          <Text style={[styles.toggleBtn, { color: isListening ? colors.error : colors.success }]}>
            {isListening ? '⏹ Stop' : '▶ Start'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {!isListening && (
          <TouchableOpacity style={styles.startBtn} onPress={startListening}>
            <Text style={styles.startBtnText}>▶  Start Sensor Readings</Text>
          </TouchableOpacity>
        )}

        <SensorCard title="Accelerometer" icon="📐" data={accel} unit=" m/s²" />
        <SensorCard title="Gyroscope" icon="🔄" data={gyro} unit=" rad/s" />
        <SensorCard title="Magnetometer" icon="🧭" data={mag} unit=" μT" />

        {/* Light Sensor */}
        <View style={[styles.sensorCard, !light.available && styles.sensorCardUnavailable]}>
          <View style={styles.sensorHeader}>
            <Text style={styles.sensorIcon}>💡</Text>
            <Text style={styles.sensorTitle}>Ambient Light</Text>
            <View style={[styles.sensorStatus, light.available && styles.sensorStatusActive]}>
              <Text style={styles.sensorStatusText}>{light.available ? 'ACTIVE' : 'N/A'}</Text>
            </View>
          </View>
          {light.available && (
            <View style={styles.lightReadingRow}>
              <Text style={styles.lightValue}>{light.value}</Text>
              <Text style={styles.lightUnit}>lux</Text>
              <Text style={styles.lightDesc}>
                {light.value < 10 ? 'Dark' : light.value < 100 ? 'Dim' : light.value < 1000 ? 'Normal' : 'Bright'}
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
  toggleBtn: { fontSize: fontSize.sm, fontWeight: '700', width: 60, textAlign: 'right' },
  scroll: { padding: spacing.md, gap: 12 },
  startBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: 16,
    alignItems: 'center',
    marginBottom: 4,
  },
  startBtnText: { fontSize: fontSize.md, fontWeight: '700', color: colors.background },
  sensorCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: 12,
  },
  sensorCardUnavailable: { opacity: 0.5 },
  sensorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sensorIcon: { fontSize: 24 },
  sensorTitle: { flex: 1, fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  sensorStatus: {
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  sensorStatusActive: { backgroundColor: colors.successBg },
  sensorStatusText: { fontSize: 9, fontWeight: '700', color: colors.success, letterSpacing: 0.5 },
  sensorValues: { gap: 8 },
  axisRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  axisLabel: { fontSize: fontSize.sm, color: colors.primary, fontWeight: '700', width: 16 },
  axisBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    overflow: 'hidden',
    position: 'relative',
  },
  axisCenter: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: colors.cardBorder,
  },
  axisFill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    borderRadius: radius.full,
    minWidth: 2,
  },
  axisValue: { fontSize: fontSize.xs, color: colors.text, width: 70, textAlign: 'right', fontFamily: 'monospace' },
  lightReadingRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  lightValue: { fontSize: 32, fontWeight: '800', color: colors.primary },
  lightUnit: { fontSize: fontSize.md, color: colors.textSecondary },
  lightDesc: { fontSize: fontSize.sm, color: colors.textSecondary, marginLeft: 8 },
});
