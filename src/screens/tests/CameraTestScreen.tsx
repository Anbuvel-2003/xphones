import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, fontSize, radius, spacing } from '../../common/theme';
import { RootStackParamList } from '../../common/types';

type Props = NativeStackScreenProps<RootStackParamList, 'CameraTest'>;

interface CameraCheck {
  id: string;
  icon: string;
  name: string;
  desc: string;
  instruction: string;
}

const CAMERA_CHECKS: CameraCheck[] = [
  {
    id: 'rear',
    icon: '📷',
    name: 'Rear Camera',
    desc: 'Test the main rear camera',
    instruction: 'Open the camera app, take a photo with the rear camera, and verify the image quality.',
  },
  {
    id: 'front',
    icon: '🤳',
    name: 'Front Camera',
    desc: 'Test the selfie / front camera',
    instruction: 'Switch to the front camera, take a selfie, and verify the image is clear.',
  },
  {
    id: 'flash',
    icon: '⚡',
    name: 'Camera Flash',
    desc: 'Test the LED flash / torch',
    instruction: 'Enable flash mode in the camera app, or turn on the torch (flashlight). Verify the LED turns on.',
  },
  {
    id: 'video',
    icon: '🎥',
    name: 'Video Recording',
    desc: 'Test video capture quality',
    instruction: 'Record a short video clip and play it back to verify audio and video are working.',
  },
];

export default function CameraTestScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [results, setResults] = useState<Record<string, 'pass' | 'fail' | null>>({});

  const setResult = (id: string, result: 'pass' | 'fail') => {
    setResults(prev => ({ ...prev, [id]: result }));
  };

  const runCheck = (check: CameraCheck) => {
    Alert.alert(
      check.name,
      check.instruction + '\n\nDid the ' + check.name.toLowerCase() + ' work correctly?',
      [
        { text: '❌ No (Fail)', style: 'destructive', onPress: () => setResult(check.id, 'fail') },
        { text: '✅ Yes (Pass)', onPress: () => setResult(check.id, 'pass') },
      ]
    );
  };

  const allDone = CAMERA_CHECKS.every(c => results[c.id]);
  const passCount = Object.values(results).filter(v => v === 'pass').length;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>📷  Camera Test</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.body}>
        <Text style={styles.intro}>
          Open your camera app to perform each test, then mark each result below.
        </Text>

        {CAMERA_CHECKS.map(check => {
          const result = results[check.id];
          const borderColor = result === 'pass'
            ? colors.success : result === 'fail' ? colors.error : colors.cardBorder;

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

              <View style={styles.checkBtns}>
                <TouchableOpacity
                  style={[styles.checkBtn, styles.checkBtnFail, result === 'fail' && styles.checkBtnActive]}
                  onPress={() => setResult(check.id, 'fail')}
                >
                  <Text style={styles.checkBtnText}>❌ Fail</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.checkBtn, styles.checkBtnInfo]}
                  onPress={() => runCheck(check)}
                >
                  <Text style={[styles.checkBtnText, { color: colors.primary }]}>ℹ️ Instructions</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.checkBtn, styles.checkBtnPass, result === 'pass' && styles.checkBtnActive]}
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
            { borderColor: passCount === CAMERA_CHECKS.length ? colors.success : colors.warning },
          ]}>
            <Text style={styles.summaryText}>
              {passCount === CAMERA_CHECKS.length
                ? '🎉 All camera tests passed!'
                : `⚠️ ${CAMERA_CHECKS.length - passCount} camera issue(s) found`}
            </Text>
            <Text style={styles.summaryScore}>
              {passCount}/{CAMERA_CHECKS.length} tests passed
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
  intro: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
    backgroundColor: colors.infoBg,
    borderRadius: radius.md,
    padding: 12,
  },
  checkCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    gap: 12,
  },
  checkTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkIcon: { fontSize: 32 },
  checkInfo: { flex: 1 },
  checkName: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  checkDesc: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.full },
  checkBtns: { flexDirection: 'row', gap: 8 },
  checkBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: radius.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.surface,
  },
  checkBtnPass: { borderColor: colors.success + '40' },
  checkBtnFail: { borderColor: colors.error + '40' },
  checkBtnInfo: { borderColor: colors.primary + '40' },
  checkBtnActive: { opacity: 1, borderWidth: 2 },
  checkBtnText: { fontSize: fontSize.xs, fontWeight: '600', color: colors.textSecondary },
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 2,
    alignItems: 'center',
    gap: 4,
  },
  summaryText: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  summaryScore: { fontSize: fontSize.sm, color: colors.textSecondary },
});
