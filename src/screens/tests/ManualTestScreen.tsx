import React from 'react';
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

type Props = NativeStackScreenProps<RootStackParamList, 'ManualTest'>;

export default function ManualTestScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { testName, instruction } = route.params;

  const handleVibration = () => Vibration.vibrate([0, 200, 100, 200]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Manual Test</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.body}>
        <View style={styles.iconBox}>
          <Text style={styles.icon}>🔧</Text>
        </View>
        <Text style={styles.testName}>{testName}</Text>
        <View style={styles.instructionCard}>
          <Text style={styles.instructionLabel}>📋 Instructions</Text>
          <Text style={styles.instruction}>{instruction}</Text>
        </View>
        <TouchableOpacity style={styles.vibBtn} onPress={handleVibration}>
          <Text style={styles.vibBtnText}>📳 Test Vibration</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <TouchableOpacity
          style={[styles.btn, styles.btnFail]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.btnText}>❌  FAIL</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, styles.btnPass]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.btnText}>✅  PASS</Text>
        </TouchableOpacity>
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
  body: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.xl,
    gap: 20,
  },
  iconBox: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  icon: { fontSize: 44 },
  testName: { fontSize: fontSize.xxl, fontWeight: '800', color: colors.text, textAlign: 'center' },
  instructionCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    width: '100%',
    gap: 8,
  },
  instructionLabel: { fontSize: fontSize.xs, fontWeight: '700', color: colors.primary, letterSpacing: 1 },
  instruction: { fontSize: fontSize.md, color: colors.textSecondary, lineHeight: 22 },
  vibBtn: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 14,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  vibBtnText: { fontSize: fontSize.md, fontWeight: '600', color: colors.text },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  btn: {
    flex: 1,
    borderRadius: radius.md,
    padding: 16,
    alignItems: 'center',
  },
  btnPass: { backgroundColor: colors.success },
  btnFail: { backgroundColor: colors.error },
  btnText: { fontSize: fontSize.md, fontWeight: '800', color: colors.text },
});
