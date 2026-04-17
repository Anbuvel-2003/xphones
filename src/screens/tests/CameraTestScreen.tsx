import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Vibration,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, fontSize, radius, spacing } from '../../common/theme';
import { RootStackParamList } from '../../common/types';

type Props = NativeStackScreenProps<RootStackParamList, 'CameraTest'>;

interface CameraCheckDef {
  id: string;
  icon: string;
  name: string;
  desc: string;
  steps: string[];
}

const CAMERA_CHECKS: CameraCheckDef[] = [
  {
    id: 'rear_camera',
    icon: '📷',
    name: 'Rear Camera',
    desc: 'Verify main rear camera image quality',
    steps: [
      'Open your camera app and ensure it is using the rear camera.',
      'Take a photo and verify the image is clear and in focus.',
      'Check there are no green tints, black spots, or blurry patches.',
    ],
  },
  {
    id: 'front_camera',
    icon: '🤳',
    name: 'Front Camera',
    desc: 'Verify selfie / front camera image quality',
    steps: [
      'Switch to the front (selfie) camera.',
      'Take a photo and verify the image is clear.',
      'Check there are no dead pixels or colour cast issues.',
    ],
  },
  {
    id: 'flash',
    icon: '⚡',
    name: 'Camera Flash',
    desc: 'Test the LED flash / torch',
    steps: [
      'Enable flash mode in the camera app, or turn on the torch.',
      'Verify the LED turns on and is bright.',
    ],
  },
  {
    id: 'video',
    icon: '🎥',
    name: 'Video Recording',
    desc: 'Test video capture quality',
    steps: [
      'Switch to video mode and record a short clip.',
      'Play it back and verify audio and video are in sync.',
    ],
  },
];

export default function CameraTestScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { testId } = route.params ?? {};

  // If called from RunningTestScreen with a specific testId, show only that check
  const isFlowMode = Boolean(testId && testId !== 'camera');
  const checksToShow = isFlowMode
    ? CAMERA_CHECKS.filter(c => c.id === testId)
    : CAMERA_CHECKS;

  const [results, setResults] = useState<Record<string, 'pass' | 'fail' | null>>({});

  const setResult = (id: string, result: 'pass' | 'fail') => {
    setResults(prev => ({ ...prev, [id]: result }));
  };

  const finishFlow = (pass: boolean) => {
    Vibration.vibrate(50);
    navigation.navigate('RunningTest', {
      testResult: { testId: testId ?? 'camera', pass },
    });
  };

  const allDone = checksToShow.every(c => results[c.id]);
  const passCount = Object.values(results).filter(v => v === 'pass').length;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <View style={styles.header}>
        {isFlowMode ? (
          <View style={{ width: 60 }} />
        ) : (
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.back}>‹ Back</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.title}>📷  Camera Test</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.body}>
        {checksToShow.map(check => {
          const result = results[check.id];
          const borderColor = result === 'pass'
            ? colors.success
            : result === 'fail'
            ? colors.error
            : colors.cardBorder;

          return (
            <View key={check.id} style={[styles.checkCard, { borderColor }]}>
              <View style={styles.checkTop}>
                <Text style={styles.checkIcon}>{check.icon}</Text>
                <View style={styles.checkInfo}>
                  <Text style={styles.checkName}>{check.name}</Text>
                  <Text style={styles.checkDesc}>{check.desc}</Text>
                </View>
                {result && (
                  <View style={[
                    styles.badge,
                    { backgroundColor: result === 'pass' ? colors.successBg : colors.errorBg },
                  ]}>
                    <Text style={{ color: result === 'pass' ? colors.success : colors.error, fontWeight: '700', fontSize: 11 }}>
                      {result === 'pass' ? '✅ PASS' : '❌ FAIL'}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.steps}>
                {check.steps.map((step, i) => (
                  <Text key={i} style={styles.step}>• {step}</Text>
                ))}
              </View>

              <View style={styles.checkBtns}>
                <TouchableOpacity
                  style={[styles.checkBtn, styles.checkBtnFail, result === 'fail' && styles.checkBtnSelected]}
                  onPress={() => setResult(check.id, 'fail')}
                >
                  <Text style={styles.checkBtnText}>❌ Fail</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.checkBtn, styles.checkBtnPass, result === 'pass' && styles.checkBtnSelected]}
                  onPress={() => setResult(check.id, 'pass')}
                >
                  <Text style={styles.checkBtnText}>✅ Pass</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        {allDone && (
          <View style={[
            styles.summaryCard,
            { borderColor: passCount === checksToShow.length ? colors.success : colors.warning },
          ]}>
            <Text style={styles.summaryText}>
              {passCount === checksToShow.length
                ? '🎉 Camera test passed!'
                : `⚠️ ${checksToShow.length - passCount} issue(s) found`}
            </Text>
            {isFlowMode ? (
              <TouchableOpacity
                style={[styles.doneBtn, { backgroundColor: passCount === checksToShow.length ? colors.success : colors.error }]}
                onPress={() => finishFlow(passCount === checksToShow.length)}
              >
                <Text style={styles.doneBtnText}>Continue →</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.summaryScore}>{passCount}/{checksToShow.length} passed</Text>
            )}
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
  checkCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    gap: 10,
  },
  checkTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  checkIcon: { fontSize: 32 },
  checkInfo: { flex: 1 },
  checkName: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  checkDesc: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.full },
  steps: { gap: 4 },
  step: { fontSize: fontSize.xs, color: colors.textSecondary, lineHeight: 18 },
  checkBtns: { flexDirection: 'row', gap: 8 },
  checkBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radius.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.surface,
  },
  checkBtnPass: { borderColor: colors.success + '60' },
  checkBtnFail: { borderColor: colors.error + '60' },
  checkBtnSelected: { borderWidth: 2 },
  checkBtnText: { fontSize: fontSize.xs, fontWeight: '600', color: colors.textSecondary },
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 2,
    alignItems: 'center',
    gap: 10,
  },
  summaryText: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  summaryScore: { fontSize: fontSize.sm, color: colors.textSecondary },
  doneBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  doneBtnText: { fontSize: fontSize.md, fontWeight: '800', color: '#FFF' },
});
