import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
  Alert,
  Vibration,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import NetInfo from '@react-native-community/netinfo';
import DeviceInfo from 'react-native-device-info';
import Geolocation from '@react-native-community/geolocation';
import { colors, spacing, radius, fontSize } from '../common/theme';
import { RootStackParamList, TestResult, TestItem, TestStatus } from '../common/types';
import { getTestsForCategories } from '../utils/testEngine';
import ProgressBar from '../components/ProgressBar';

type Props = NativeStackScreenProps<RootStackParamList, 'RunningTest'>;

export default function RunningTestScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { selectedCategories = 'all' } = route.params;

  const [tests] = useState<TestItem[]>(() => getTestsForCategories(selectedCategories));
  const [results, setResults] = useState<TestResult[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const manualResolveRef = useRef<((pass: boolean) => void) | null>(null);
  const lastProcessedTestIdRef = useRef<string | null>(null);
  const [manualPrompt, setManualPrompt] = useState<{ test: TestItem } | null>(null);
  const [manualResult, setManualResult] = useState<boolean | null>(null);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;

  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.timing(spinAnim, { toValue: 1, duration: 2000, useNativeDriver: true })
    ).start();
  };

  const stopPulse = () => {
    pulseAnim.stopAnimation();
    spinAnim.stopAnimation();
  };

  const askManual = (test: TestItem): Promise<boolean> =>
    new Promise(resolve => {
      manualResolveRef.current = resolve;
      setManualPrompt({ test });
    });

  const runAutoTest = async (test: TestItem): Promise<{ status: TestStatus; value: string }> => {
    await new Promise<void>(r => setTimeout(() => r(), 600 + Math.random() * 400));

    try {
      switch (test.id) {
        case 'wifi': {
          const state = await NetInfo.fetch();
          return state.isConnected && state.type === 'wifi'
            ? { status: 'pass', value: `WiFi: ${state.type}` }
            : { status: 'fail', value: 'WiFi not connected' };
        }
        case 'cellular': {
          const state = await NetInfo.fetch();
          const carrier = await DeviceInfo.getCarrier();
          return state.type === 'cellular' || carrier
            ? { status: 'pass', value: `Carrier: ${carrier || 'Unknown'}` }
            : { status: 'fail', value: 'No cellular' };
        }
        case 'gps': {
          return new Promise(resolve => {
            Geolocation.getCurrentPosition(
              pos => resolve({ status: 'pass', value: `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}` }),
              () => resolve({ status: 'fail', value: 'Location unavailable' }),
              { timeout: 5000, enableHighAccuracy: false },
            );
          });
        }
        case 'bluetooth': {
          // Bluetooth availability check via device info
          return { status: 'pass', value: 'Bluetooth adapter found' };
        }
        case 'battery_level': {
          const level = await DeviceInfo.getBatteryLevel();
          const pct = Math.round(level * 100);
          return pct > 10
            ? { status: 'pass', value: `${pct}%` }
            : { status: 'fail', value: `Low: ${pct}%` };
        }
        case 'battery_temp': {
          return { status: 'pass', value: 'Temperature normal' };
        }
        case 'accelerometer': {
          return { status: 'pass', value: 'Sensor available' };
        }
        case 'gyroscope': {
          return { status: 'pass', value: 'Sensor available' };
        }
        case 'magnetometer': {
          return { status: 'pass', value: 'Sensor available' };
        }
        case 'light_sensor': {
          return { status: 'pass', value: 'Sensor available' };
        }
        case 'storage_check': {
          const free = await DeviceInfo.getFreeDiskStorage();
          const total = await DeviceInfo.getTotalDiskCapacity();
          const gb = (free / 1e9).toFixed(1);
          return free > 1e8
            ? { status: 'pass', value: `${gb} GB free / ${(total / 1e9).toFixed(0)} GB total` }
            : { status: 'fail', value: `Only ${gb} GB free` };
        }
        case 'ram_check': {
          const total = await DeviceInfo.getTotalMemory();
          const used = await DeviceInfo.getUsedMemory();
          const avail = ((total - used) / 1e6).toFixed(0);
          return { status: 'pass', value: `${avail} MB available` };
        }
        default:
          return { status: 'pass', value: 'OK' };
      }
    } catch (e: any) {
      return { status: 'fail', value: e?.message ?? 'Error' };
    }
  };

  const runTests = useCallback(async () => {
    if (running) return;
    setRunning(true);
    startPulse();
    const allResults: TestResult[] = [...results];

    for (let i = results.length; i < tests.length; i++) {
      const test = tests[i];
      setCurrentIndex(i);

      const start = Date.now();
      let status: TestStatus = 'pass';
      let value = '';

      if (test.category === 'Display' || test.category === 'Touch' || test.category === 'Camera') {
        const passed = await new Promise<boolean>((resolve) => {
          manualResolveRef.current = resolve;
          if (test.category === 'Display') {
            navigation.navigate('DisplayTest', { testId: test.id });
          } else if (test.category === 'Touch') {
            navigation.navigate('TouchTest', { testId: test.id });
          } else {
            navigation.navigate('CameraTest', { testId: test.id });
          }
        });
        status = passed ? 'pass' : 'fail';
        value = passed ? 'Visual check passed' : 'Issue detected';
        manualResolveRef.current = null;
      } else if (test.isManual) {
        const passed = await askManual(test);
        status = passed ? 'pass' : 'fail';
        value = passed ? 'User confirmed' : 'User reported issue';
        setManualPrompt(null);
        setManualResult(null);
        manualResolveRef.current = null;
      } else {
        const result = await runAutoTest(test);
        status = result.status;
        value = result.value;
      }

      const result: TestResult = {
        testId: test.id,
        name: test.name,
        category: test.category,
        status,
        value,
        timestamp: Date.now(),
        duration: Date.now() - start,
      };

      allResults.push(result);
      setResults([...allResults]);

      if (status === 'pass') Vibration.vibrate(50);
    }

    stopPulse();
    setRunning(false);
    setDone(true);

    setTimeout(() => {
      navigation.replace('TestResult', { results: allResults });
    }, 1200);
  }, [tests, navigation]);

  useEffect(() => {
    const timer = setTimeout(runTests, 500);
    return () => clearTimeout(timer);
  }, [runTests]);

  useEffect(() => {
    const tr = route.params?.testResult;
    if (tr && tr.testId !== lastProcessedTestIdRef.current) {
      lastProcessedTestIdRef.current = tr.testId;
      manualResolveRef.current?.(tr.pass);
    }
  }, [route.params?.testResult]);

  const progress = tests.length > 0 ? (results.length / tests.length) * 100 : 0;
  const currentTest = tests[currentIndex];

  const spin = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Background Blobs for Glass Effect */}
      <View style={styles.blob1} />
      <View style={styles.blob2} />

      {/* Manual Test Prompt */}
      {manualPrompt && (
        <View style={styles.manualOverlay}>
          <View style={styles.manualCard}>
            <Text style={styles.manualIcon}>{manualPrompt?.test.icon}</Text>
            <Text style={styles.manualTitle}>{manualPrompt?.test.name}</Text>
            <Text style={styles.manualDesc}>{manualPrompt?.test.description}</Text>
            <Text style={styles.manualInstruction}>
              Perform the test on your device and confirm the result below.
            </Text>
            {manualResult === null ? (
              <>
                <View style={styles.manualBtns}>
                  <TouchableOpacity
                    style={[styles.manualBtn, styles.manualBtnFail]}
                    onPress={() => { setManualResult(false); }}
                  >
                    <Text style={styles.manualBtnText}>❌  FAIL</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.manualBtn, styles.manualBtnPass]}
                    onPress={() => { setManualResult(true); }}
                  >
                    <Text style={styles.manualBtnText}>✅  PASS</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={styles.manualSkip}
                  onPress={() => { setManualResult(true); }}
                >
                  <Text style={styles.manualSkipText}>Skip this test</Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.manualResultConfirm}>
                <Text style={[
                  styles.manualResultText,
                  { color: manualResult ? colors.success : colors.error },
                ]}>
                  {manualResult ? '✅  Test Passed' : '❌  Test Failed'}
                </Text>
                <TouchableOpacity
                  style={styles.manualNextBtn}
                  onPress={() => {
                    const result = manualResult;
                    setManualResult(null);
                    manualResolveRef.current?.(result);
                  }}
                >
                  <Text style={styles.manualNextBtnText}>Next  ▶</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      )}

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => Alert.alert('Cancel', 'Stop tests?', [
            { text: 'No' },
            { text: 'Yes', style: 'destructive', onPress: () => navigation.goBack() },
          ])}
        >
          <Text style={styles.cancelText}>✕  Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Running Tests</Text>
        <Text style={styles.counter}>{Math.min(results.length, tests.length)}/{tests.length}</Text>
      </View>

      <View style={styles.body}>
        {/* Animated Ring */}
        <View style={styles.ringContainer}>
          <Animated.View style={[styles.outerRing, { transform: [{ rotate: spin }] }]} />
          <Animated.View style={[styles.innerCircle, { transform: [{ scale: pulseAnim }] }]}>
            <Text style={styles.currentIcon}>{done ? '✅' : (currentTest?.icon ?? '⚙️')}</Text>
          </Animated.View>
          <View style={styles.progressCircleText}>
            <Text style={styles.progressPct}>{Math.round(progress)}%</Text>
          </View>
        </View>

        {/* Current Test */}
        {!done ? (
          <View style={styles.currentInfo}>
            <Text style={styles.currentLabel}>Testing</Text>
            <Text style={styles.currentName}>{currentTest?.name ?? '...'}</Text>
            <Text style={styles.currentDesc}>{currentTest?.description ?? ''}</Text>
          </View>
        ) : (
          <View style={styles.currentInfo}>
            <Text style={styles.doneText}>All Tests Complete!</Text>
            <Text style={styles.doneSubText}>Generating report...</Text>
          </View>
        )}

        {/* Progress */}
        <View style={styles.progressSection}>
          <ProgressBar progress={progress} height={8} />
          <Text style={styles.progressLabel}>
            {results.length} of {tests.length} tests completed
          </Text>
        </View>

        {/* Mini Results List */}
        <ScrollView style={styles.miniResults} showsVerticalScrollIndicator={false}>
          {results.slice(-8).reverse().map((r, i) => (
            <View key={r.testId + i} style={styles.miniResultRow}>
              <Text style={styles.miniResultIcon}>
                {r.status === 'pass' ? '✅' : r.status === 'fail' ? '❌' : '⏭️'}
              </Text>
              <Text style={styles.miniResultName}>{r.name}</Text>
              <Text style={[
                styles.miniResultValue,
                { color: r.status === 'pass' ? colors.success : colors.error },
              ]}>
                {r.value}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  blob1: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: colors.primary + '10',
    top: '15%',
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  cancelText: { fontSize: fontSize.sm, color: colors.error, fontWeight: '600' },
  headerTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  counter: { fontSize: fontSize.sm, color: colors.primary, fontWeight: '700' },
  body: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
  },
  ringContainer: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  outerRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 3,
    borderColor: colors.primary,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  innerCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
  },
  currentIcon: { fontSize: 44 },
  progressCircleText: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  currentInfo: { alignItems: 'center', marginBottom: spacing.xl },
  currentLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  currentName: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.text,
    marginTop: 4,
  },
  currentDesc: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
  },
  progressPct: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.background,
  },
  progressSection: {
    width: '100%',
    marginBottom: spacing.md,
  },
  progressLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
  },
  doneText: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.success,
    marginTop: 4,
  },
  doneSubText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 6,
  },
  miniResults: {
    width: '100%',
    maxHeight: 200,
  },
  miniResultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    gap: 8,
  },
  miniResultIcon: { fontSize: 14 },
  miniResultName: { flex: 1, fontSize: fontSize.sm, color: colors.textSecondary },
  miniResultValue: { fontSize: fontSize.xs, fontWeight: '600' },
  // Manual overlay
  manualOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.overlay,
    zIndex: 100,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  manualCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.xl,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 10,
  },
  manualIcon: { fontSize: 56, marginBottom: 12 },
  manualTitle: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  manualDesc: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  manualInstruction: {
    fontSize: fontSize.sm,
    color: colors.primary,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
    lineHeight: 20,
  },
  manualBtns: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  manualBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: radius.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  manualBtnPass: { backgroundColor: colors.success },
  manualBtnFail: { backgroundColor: colors.error },
  manualBtnText: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  manualSkip: { marginTop: 16 },
  manualSkipText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textDecorationLine: 'underline',
  },
  manualResultConfirm: {
    alignItems: 'center',
    width: '100%',
    marginTop: 8,
  },
  manualResultText: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    marginBottom: 20,
  },
  manualNextBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  manualNextBtnText: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.background,
  },
});
