import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Vibration,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, fontSize, radius, spacing } from '../../common/theme';
import { RootStackParamList } from '../../common/types';

type Props = NativeStackScreenProps<RootStackParamList, 'AudioTest'>;

interface AudioTest {
  id: string;
  icon: string;
  name: string;
  desc: string;
  instruction: string;
  action: string;
}

const AUDIO_TESTS: AudioTest[] = [
  {
    id: 'speaker',
    icon: '🔊',
    name: 'Speaker',
    desc: 'Test the main loudspeaker',
    instruction: 'Play a test tone and confirm you can hear it clearly from the bottom/back speaker.',
    action: 'Play Speaker Test',
  },
  {
    id: 'earpiece',
    icon: '📞',
    name: 'Earpiece',
    desc: 'Test the ear receiver speaker',
    instruction: 'Hold the phone to your ear. A test tone will play through the earpiece.',
    action: 'Play Earpiece Test',
  },
  {
    id: 'microphone',
    icon: '🎙️',
    name: 'Microphone',
    desc: 'Test the main microphone',
    instruction: 'Speak into the microphone and confirm audio is being recorded.',
    action: 'Start Recording',
  },
];

export default function AudioTestScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [results, setResults] = useState<Record<string, 'pass' | 'fail' | null>>({});
  const [activeTest, setActiveTest] = useState<string | null>(null);

  const runTest = (test: AudioTest) => {
    setActiveTest(test.id);
    // Vibrate as audio feedback simulation
    Vibration.vibrate([0, 200, 100, 200, 100, 400]);

    Alert.alert(
      test.name + ' Test',
      test.instruction + '\n\nDid the ' + test.name.toLowerCase() + ' work correctly?',
      [
        {
          text: '❌ No (Fail)',
          style: 'destructive',
          onPress: () => {
            setResults(prev => ({ ...prev, [test.id]: 'fail' }));
            setActiveTest(null);
          },
        },
        {
          text: '✅ Yes (Pass)',
          onPress: () => {
            setResults(prev => ({ ...prev, [test.id]: 'pass' }));
            setActiveTest(null);
          },
        },
      ]
    );
  };

  const allDone = AUDIO_TESTS.every(t => results[t.id] !== undefined && results[t.id] !== null);
  const passCount = Object.values(results).filter(v => v === 'pass').length;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🔊  Audio Test</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.body}>
        {AUDIO_TESTS.map(test => {
          const result = results[test.id];
          const isActive = activeTest === test.id;
          const borderColor = result === 'pass'
            ? colors.success
            : result === 'fail'
            ? colors.error
            : isActive
            ? colors.primary
            : colors.cardBorder;

          return (
            <View key={test.id} style={[styles.testCard, { borderColor }]}>
              <View style={styles.testCardTop}>
                <View style={styles.testCardLeft}>
                  <Text style={styles.testIcon}>{test.icon}</Text>
                  <View>
                    <Text style={styles.testName}>{test.name}</Text>
                    <Text style={styles.testDesc}>{test.desc}</Text>
                  </View>
                </View>
                {result && (
                  <View style={[
                    styles.resultBadge,
                    { backgroundColor: result === 'pass' ? colors.successBg : colors.errorBg },
                  ]}>
                    <Text style={{ color: result === 'pass' ? colors.success : colors.error, fontWeight: '700', fontSize: 12 }}>
                      {result === 'pass' ? '✅ PASS' : '❌ FAIL'}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={styles.instruction}>{test.instruction}</Text>
              <TouchableOpacity
                style={[styles.testBtn, result && styles.testBtnDone]}
                onPress={() => runTest(test)}
                activeOpacity={0.8}
              >
                <Text style={[styles.testBtnText, result && styles.testBtnTextDone]}>
                  {isActive ? '⏳ Testing...' : result ? '↺ Re-test' : test.action}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}

        {allDone && (
          <View style={styles.summary}>
            <Text style={styles.summaryText}>
              {passCount === AUDIO_TESTS.length
                ? '🎉 All audio tests passed!'
                : `⚠️ ${AUDIO_TESTS.length - passCount} test(s) failed`}
            </Text>
          </View>
        )}
      </View>
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
  body: { flex: 1, padding: spacing.md, gap: 12 },
  testCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    gap: 10,
  },
  testCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  testCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  testIcon: { fontSize: 32 },
  testName: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  testDesc: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  resultBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  instruction: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  testBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    padding: 12,
    alignItems: 'center',
  },
  testBtnDone: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardBorder },
  testBtnText: { fontSize: fontSize.sm, fontWeight: '700', color: colors.background },
  testBtnTextDone: { color: colors.textSecondary },
  summary: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  summaryText: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
});
