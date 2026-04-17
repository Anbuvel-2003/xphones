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
import { 
  useAnimatedSensor, 
  SensorType, 
  useDerivedValue, 
  runOnJS 
} from 'react-native-reanimated';
import { colors, fontSize, radius, spacing } from '../../common/theme';
import { RootStackParamList } from '../../common/types';

type Props = NativeStackScreenProps<RootStackParamList, 'SensorTest'>;

interface SensorDisplayData {
  x: number;
  y: number;
  z: number;
}

export default function SensorTestScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [isListening, setIsListening] = useState(false);

  // States for display values (since SharedValues doesn't trigger React re-renders for text labels)
  const [accelVal, setAccelVal] = useState<SensorDisplayData>({ x: 0, y: 0, z: 0 });
  const [gyroVal, setGyroVal] = useState<SensorDisplayData>({ x: 0, y: 0, z: 0 });
  const [magVal, setMagVal] = useState<SensorDisplayData>({ x: 0, y: 0, z: 0 });

  // 1. Initialize Sensors
  const accel = useAnimatedSensor(SensorType.ACCELEROMETER, { interval: 100 });
  const gyro = useAnimatedSensor(SensorType.GYROSCOPE, { interval: 100 });
  const mag = useAnimatedSensor(SensorType.MAGNETIC_FIELD, { interval: 100 });

  // 2. Sync SharedValues to React State for Text Labels
  useDerivedValue(() => {
    if (!isListening) return;
    runOnJS(setAccelVal)({ 
      x: accel.sensor.value.x, 
      y: accel.sensor.value.y, 
      z: accel.sensor.value.z 
    });
    runOnJS(setGyroVal)({ 
      x: gyro.sensor.value.x, 
      y: gyro.sensor.value.y, 
      z: gyro.sensor.value.z 
    });
    runOnJS(setMagVal)({ 
      x: mag.sensor.value.x, 
      y: mag.sensor.value.y, 
      z: mag.sensor.value.z 
    });
  });

  const toggleListening = () => {
    setIsListening(!isListening);
  };

  const SensorCard = ({
    title,
    icon,
    data,
    unit = '',
  }: {
    title: string;
    icon: string;
    data: SensorDisplayData;
    unit?: string;
  }) => (
    <View style={styles.sensorCard}>
      <View style={styles.sensorHeader}>
        <Text style={styles.sensorIcon}>{icon}</Text>
        <Text style={styles.sensorTitle}>{title}</Text>
        <View style={[styles.sensorStatus, isListening && styles.sensorStatusActive]}>
          <Text style={[styles.sensorStatusText, { color: isListening ? colors.success : colors.textMuted }]}>
            {isListening ? 'ACTIVE' : 'READY'}
          </Text>
        </View>
      </View>
      <View style={styles.sensorValues}>
        <SensorAxis label="X" value={data.x} unit={unit} />
        <SensorAxis label="Y" value={data.y} unit={unit} />
        <SensorAxis label="Z" value={data.z} unit={unit} />
      </View>
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
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Diagnostic Sensors</Text>
        <TouchableOpacity onPress={toggleListening}>
          <Text style={[styles.toggleBtn, { color: isListening ? colors.error : colors.success }]}>
            {isListening ? '⏹ Stop' : '▶ Start'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Using Reanimated v4 native sensors for low-latency diagnostic data.
          </Text>
        </View>

        {!isListening && (
          <TouchableOpacity style={styles.startBtn} onPress={toggleListening}>
            <Text style={styles.startBtnText}>▶  Start Real-time Capture</Text>
          </TouchableOpacity>
        )}

        <SensorCard title="Accelerometer" icon="📐" data={accelVal} unit=" m/s²" />
        <SensorCard title="Gyroscope" icon="🔄" data={gyroVal} unit=" rad/s" />
        <SensorCard title="Magnetometer" icon="🧭" data={magVal} unit=" μT" />

        <View style={styles.manualInstruction}>
          <Text style={styles.manualText}>
            Tip: Move or rotate the device to see changes in the readings. High-frequency updates bypass the usual JS lag for more accurate diagnostics.
          </Text>
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
  infoBox: {
    padding: 12,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    marginBottom: 8,
  },
  infoText: { fontSize: 13, color: colors.textSecondary, textAlign: 'center' },
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
  sensorStatusText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
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
  manualInstruction: {
    padding: 24,
    alignItems: 'center',
  },
  manualText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
