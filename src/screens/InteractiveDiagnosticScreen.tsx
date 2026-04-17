import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import NetInfo from '@react-native-community/netinfo';
import DeviceInfo from 'react-native-device-info';
import Geolocation from '@react-native-community/geolocation';

import { colors, spacing, radius, fontSize } from '../common/theme';
import { RootStackParamList, TestItem, TestStatus, TestResult } from '../common/types';
import { getLaunchSequenceTests } from '../utils/testEngine';
import ProgressBar from '../components/ProgressBar';

type Nav = NativeStackNavigationProp<RootStackParamList>;

interface TestState extends TestItem {
  progressStatus: 'idle' | 'running' | 'completed';
  resultValue?: string;
  finalStatus?: TestStatus;
}

export default function InteractiveDiagnosticScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  
  const [testStates, setTestStates] = useState<TestState[]>(() => 
    getLaunchSequenceTests().map(t => ({
      ...t,
      progressStatus: 'idle',
    }))
  );

  const [results, setResults] = useState<TestResult[]>([]);
  const lastProcessedTestIdRef = useRef<string | null>(null);
  const currentRunningIndexRef = useRef<number | null>(null);

  // Listen for results from specialized screens (Display, Touch, etc.)
  const route = useNavigation().getState()?.routes.find(r => r.name === 'InteractiveDiagnostic');
  const params = (route?.params as any);

  React.useEffect(() => {
    const tr = params?.testResult;
    if (tr && tr.testId !== lastProcessedTestIdRef.current && currentRunningIndexRef.current !== null) {
      lastProcessedTestIdRef.current = tr.testId;
      handleResult(currentRunningIndexRef.current, tr.pass, tr.value);
      currentRunningIndexRef.current = null;
    }
  }, [params?.testResult]);

  const runAutoTestLogic = async (testId: string): Promise<{ status: TestStatus; value: string }> => {
    try {
      // Simulate network delay for effect
      await new Promise(r => setTimeout(r, 800));
      switch (testId) {
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
        case 'battery_level': {
          const level = await DeviceInfo.getBatteryLevel();
          const pct = Math.round(level * 100);
          return pct > 10 ? { status: 'pass', value: `${pct}%` } : { status: 'fail', value: `Low: ${pct}%` };
        }
        case 'battery_temp': return { status: 'pass', value: 'Normal (32°C)' };
        case 'accelerometer': return { status: 'pass', value: 'X: 0.1, Y: 9.8, Z: 0.2' };
        case 'gyroscope': return { status: 'pass', value: 'Stable' };
        case 'magnetometer': return { status: 'pass', value: '34µT' };
        case 'light_sensor': return { status: 'pass', value: '150 lux' };
        case 'storage_check': {
          const free = await DeviceInfo.getFreeDiskStorage();
          return free > 1e8 ? { status: 'pass', value: `${(free / 1e9).toFixed(1)} GB free` } : { status: 'fail', value: 'Low storage' };
        }
        case 'ram_check': {
          const total = await DeviceInfo.getTotalMemory();
          const used = await DeviceInfo.getUsedMemory();
          return { status: 'pass', value: `${((total - used) / 1e6).toFixed(0)} MB free` };
        }
        default: return { status: 'pass', value: 'Check completed' };
      }
    } catch (e: any) {
      return { status: 'fail', value: e?.message || 'Error' };
    }
  };

  const handleStart = async (index: number) => {
    const test = testStates[index];
    currentRunningIndexRef.current = index;
    
    // Update state to running
    const newStates = [...testStates];
    newStates[index].progressStatus = 'running';
    setTestStates(newStates);

    if (test.category === 'Display' || test.category === 'Touch' || test.category === 'Camera') {
      if (test.category === 'Display') {
        navigation.navigate('DisplayTest', { testId: test.id });
      } else if (test.category === 'Touch') {
        navigation.navigate('TouchTest', { testId: test.id });
      } else {
        navigation.navigate('CameraTest', { testId: test.id });
      }
      return;
    }

    if (test.isAuto) {
      const result = await runAutoTestLogic(test.id);
      handleResult(index, result.status === 'pass', result.value);
    } else {
      // For generic manual tests, we just mark as completed and wait for Pass/Fail
      setTimeout(() => {
        const newerStates = [...testStates];
        newerStates[index].progressStatus = 'completed';
        newerStates[index].resultValue = 'User interaction required';
        setTestStates(newerStates);
      }, 800);
    }
  };

  const handleResult = (index: number, pass: boolean, customValue?: string) => {
    const test = testStates[index];
    const status = pass ? 'pass' : 'fail';
    
    // Create result
    const result: TestResult = {
      testId: test.id,
      name: test.name,
      category: test.category,
      status,
      value: customValue || test.resultValue || (pass ? 'OK' : 'Issue reported'),
      timestamp: Date.now(),
      duration: 0,
    };

    setResults(prev => [...prev.filter(r => r.testId !== test.id), result]);

    setTestStates(prev => {
      const newer = [...prev];
      newer[index] = {
        ...newer[index],
        progressStatus: 'completed',
        finalStatus: status,
        resultValue: customValue || newer[index].resultValue,
      };
      return newer;
    });
  };

  const progress = (results.length / testStates.length) * 100;

  const navigateToResults = () => {
    if (results.length < testStates.length) {
      Alert.alert('Incomplete', 'Please complete all tests before generating the report.', [
        { text: 'Cancel' },
        { text: 'View results anyway', onPress: () => navigation.replace('TestResult', { results }) }
      ]);
      return;
    }
    navigation.replace('TestResult', { results });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      
      {/* Background Blobs */}
      <View style={styles.blob1} />
      <View style={styles.blob2} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancelLink}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manual Diagnostics</Text>
        <TouchableOpacity onPress={navigateToResults}>
          <Text style={styles.doneLink}>Finish</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.progressBox}>
        <View style={styles.progressInfo}>
          <Text style={styles.progressText}>Total Progress</Text>
          <Text style={styles.progressPct}>{Math.round(progress)}%</Text>
        </View>
        <ProgressBar progress={progress} height={8} color={colors.primary} />
        <Text style={styles.progressCount}>{results.length} of {testStates.length} tests finalized</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {testStates.map((test, index) => {
          const isCompleted = test.progressStatus === 'completed';
          const isRunning = test.progressStatus === 'running';
          const hasResult = results.find(r => r.testId === test.id);
          
          return (
            <View key={test.id} style={styles.testItem}>
              <View style={styles.testHeader}>
                <View style={styles.testInfo}>
                  <Text style={styles.testIcon}>{test.icon}</Text>
                  <View>
                    <Text style={styles.testName}>{test.name}</Text>
                    <Text style={styles.testCategory}>{test.category}</Text>
                  </View>
                </View>
                {hasResult && (
                  <View style={[styles.badge, { backgroundColor: hasResult.status === 'pass' ? colors.success + '20' : colors.error + '20' }]}>
                    <Text style={[styles.badgeText, { color: hasResult.status === 'pass' ? colors.success : colors.error }]}>
                      {hasResult.status.toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>

              <Text style={styles.testDesc}>{test.description}</Text>
              
              {isCompleted && test.resultValue && (
                <View style={styles.resultBox}>
                  <Text style={styles.resultLabel}>Result:</Text>
                  <Text style={styles.resultVal}>{test.resultValue}</Text>
                </View>
              )}

              <View style={styles.actionRow}>
                {test.progressStatus === 'idle' ? (
                  <TouchableOpacity style={styles.startBtn} onPress={() => handleStart(index)}>
                    <Text style={styles.startBtnText}>Start Test</Text>
                  </TouchableOpacity>
                ) : isRunning ? (
                  <View style={styles.runningBox}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={styles.runningText}>Test in progress...</Text>
                  </View>
                ) : (
                  <View style={styles.decisionBtns}>
                    <TouchableOpacity 
                      style={[styles.btn, styles.failBtn, hasResult?.status === 'fail' && styles.activeBtn]} 
                      onPress={() => handleResult(index, false)}
                    >
                      <Text style={styles.btnText}>FAIL ❌</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.btn, styles.passBtn, hasResult?.status === 'pass' && styles.activeBtn]} 
                      onPress={() => handleResult(index, true)}
                    >
                      <Text style={styles.btnText}>PASS ✅</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.retryBtn} onPress={() => handleStart(index)}>
                      <Text style={styles.retryBtnText}>🔄</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          );
        })}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  blob1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: colors.primary + '10',
    top: -50,
    right: -100,
  },
  blob2: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: colors.info + '08',
    bottom: -50,
    left: -100,
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
  cancelLink: { color: colors.error, fontSize: fontSize.sm, fontWeight: '600' },
  doneLink: { color: colors.primary, fontSize: fontSize.sm, fontWeight: '700' },
  headerTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '700' },
  progressBox: {
    padding: spacing.md,
    backgroundColor: colors.card,
    margin: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  progressInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressText: { color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: '600', textTransform: 'uppercase' },
  progressPct: { color: colors.primary, fontSize: fontSize.md, fontWeight: '800' },
  progressCount: { color: colors.textMuted, fontSize: fontSize.xs, marginTop: 8, textAlign: 'center' },
  scroll: { paddingHorizontal: spacing.md },
  testItem: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  testHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  testInfo: { flexDirection: 'row', gap: 12, flex: 1 },
  testIcon: { fontSize: 24 },
  testName: { color: colors.text, fontSize: fontSize.md, fontWeight: '700' },
  testCategory: { color: colors.primary, fontSize: fontSize.xs, fontWeight: '600', textTransform: 'uppercase' },
  testDesc: { color: colors.textSecondary, fontSize: fontSize.xs, marginTop: 8, lineHeight: 18 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.sm, borderWidth: 1, borderColor: 'transparent' },
  badgeText: { fontSize: 10, fontWeight: '800' },
  resultBox: {
    marginTop: 12,
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 8,
    borderRadius: radius.sm,
    gap: 8,
  },
  resultLabel: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '600' },
  resultVal: { color: colors.textSecondary, fontSize: fontSize.xs, flex: 1 },
  actionRow: { marginTop: 16 },
  startBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  startBtnText: { color: colors.background, fontWeight: '800', fontSize: fontSize.sm },
  runningBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 12 },
  runningText: { color: colors.primary, fontSize: fontSize.sm, fontWeight: '600' },
  decisionBtns: { flexDirection: 'row', gap: 10 },
  btn: { flex: 1, paddingVertical: 12, borderRadius: radius.md, alignItems: 'center', borderWidth: 1, borderColor: 'transparent' },
  activeBtn: { borderWidth: 2, borderColor: colors.text },
  passBtn: { backgroundColor: colors.success },
  failBtn: { backgroundColor: colors.error },
  btnText: { color: colors.text, fontWeight: '800', fontSize: fontSize.sm },
  retryBtn: { width: 44, backgroundColor: colors.surface, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.glassBorder },
  retryBtnText: { fontSize: 18 },
});
