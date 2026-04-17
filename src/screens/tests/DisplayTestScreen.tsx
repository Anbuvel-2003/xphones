import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, fontSize, radius } from '../../common/theme';
import { RootStackParamList } from '../../common/types';

type Props = NativeStackScreenProps<RootStackParamList, 'DisplayTest'>;

const { width, height } = Dimensions.get('window');

const COLOR_SCREENS = [
  { color: '#FF0000', label: 'RED' },
  { color: '#00FF00', label: 'GREEN' },
  { color: '#0000FF', label: 'BLUE' },
  { color: '#FFFFFF', label: 'WHITE' },
  { color: '#000000', label: 'BLACK' },
  { color: '#FFFF00', label: 'YELLOW' },
  { color: '#FF00FF', label: 'MAGENTA' },
  { color: '#00FFFF', label: 'CYAN' },
];

export default function DisplayTestScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [colorIndex, setColorIndex] = useState<number | null>(null);

  if (colorIndex !== null) {
    const current = COLOR_SCREENS[colorIndex];
    const textColor = current.color === '#000000' || current.color === '#0000FF'
      ? '#FFFFFF' : '#000000';

    return (
      <TouchableOpacity
        style={[styles.fullScreen, { backgroundColor: current.color }]}
        onPress={() => {
          if (colorIndex < COLOR_SCREENS.length - 1) {
            setColorIndex(colorIndex + 1);
          } else {
            setColorIndex(null);
          }
        }}
        activeOpacity={1}
      >
        <StatusBar hidden />
        <Text style={[styles.fullScreenLabel, { color: textColor }]}>{current.label}</Text>
        <Text style={[styles.fullScreenSub, { color: textColor + 'AA' }]}>
          {colorIndex + 1} / {COLOR_SCREENS.length} — Tap to continue
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🖥️  Display Test</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.body}>
        <Text style={styles.sectionLabel}>Color Accuracy Test</Text>
        <Text style={styles.desc}>
          Tap each color to fill the screen. Look for dead pixels, color bleeding, or uneven backlight.
        </Text>

        <View style={styles.colorGrid}>
          {COLOR_SCREENS.map((c, i) => (
            <TouchableOpacity
              key={c.label}
              style={[styles.colorSwatch, { backgroundColor: c.color }]}
              onPress={() => setColorIndex(i)}
            >
              {c.color === '#000000' && <View style={styles.blackBorder} />}
              <Text style={[
                styles.colorLabel,
                { color: c.color === '#000000' || c.color === '#0000FF' ? '#FFF' : '#000' },
              ]}>
                {c.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.startBtn}
          onPress={() => setColorIndex(0)}
        >
          <Text style={styles.startBtnText}>▶  Start Color Test</Text>
        </TouchableOpacity>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>What to look for:</Text>
          <Text style={styles.infoItem}>• Dead pixels (black spots on solid color)</Text>
          <Text style={styles.infoItem}>• Stuck pixels (wrong color dot)</Text>
          <Text style={styles.infoItem}>• Color bleeding at screen edges</Text>
          <Text style={styles.infoItem}>• Uneven brightness (backlight bleed)</Text>
        </View>
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
  body: { flex: 1, padding: 16 },
  sectionLabel: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
  },
  desc: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 24,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  colorSwatch: {
    width: (width - 62) / 4,
    height: (width - 62) / 4,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blackBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#333',
  },
  colorLabel: { fontSize: 9, fontWeight: '700' },
  startBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  startBtnText: { fontSize: fontSize.md, fontWeight: '700', color: colors.background },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  infoTitle: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text, marginBottom: 4 },
  infoItem: { fontSize: fontSize.sm, color: colors.textSecondary },
  fullScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullScreenLabel: { fontSize: 36, fontWeight: '900', letterSpacing: 4 },
  fullScreenSub: { fontSize: 14, marginTop: 12 },
});
