import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
  Vibration,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, fontSize, radius } from '../../common/theme';
import { RootStackParamList } from '../../common/types';

type Props = NativeStackScreenProps<RootStackParamList, 'DisplayTest'>;

type Phase = 'COLORS' | 'DEAD_PIXELS' | 'BRIGHTNESS' | 'PATTERNS' | 'SMOOTHNESS' | 'BURN_IN';

const COLOR_CYCLE = [
  { color: '#FF0000', label: 'RED' },
  { color: '#00FF00', label: 'GREEN' },
  { color: '#0000FF', label: 'BLUE' },
  { color: '#FFFFFF', label: 'WHITE' },
  { color: '#000000', label: 'BLACK' },
];

// Map each testId to exactly one phase
const TEST_ID_TO_PHASE: Record<string, Phase> = {
  display_colors:     'COLORS',
  dead_pixels:        'DEAD_PIXELS',
  display_brightness: 'BRIGHTNESS',
  display_patterns:   'PATTERNS',
  display_smoothness: 'SMOOTHNESS',
  display_burnin:     'BURN_IN',
};

export default function DisplayTestScreen({ navigation, route }: Props) {
  const { testId } = route.params;
  const phase: Phase = TEST_ID_TO_PHASE[testId] ?? 'COLORS';

  // COLORS state
  const [colorIndex, setColorIndex]   = useState(0);
  const [timeLeft, setTimeLeft]       = useState(5);
  const [colorsDone, setColorsDone]   = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // SMOOTHNESS animation
  const moveAnim = useRef(new Animated.Value(0)).current;

  // BURN_IN overlay
  const burnInOpacity = useRef(new Animated.Value(1)).current;
  const [showBurnInUI, setShowBurnInUI] = useState(true);

  // Start COLORS 5-second-per-color timer
  useEffect(() => {
    if (phase !== 'COLORS') return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setColorIndex(curr => {
            if (curr >= COLOR_CYCLE.length - 1) {
              clearInterval(timerRef.current!);
              setColorsDone(true);
              return curr;
            }
            return curr + 1;
          });
          return 5;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  // Start SMOOTHNESS ball animation
  useEffect(() => {
    if (phase !== 'SMOOTHNESS') return;
    Animated.loop(
      Animated.sequence([
        Animated.timing(moveAnim, { toValue: 150, duration: 800, useNativeDriver: true }),
        Animated.timing(moveAnim, { toValue: -150, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, [phase]);

  const finishTest = (pass: boolean) => {
    Vibration.vibrate(50);
    navigation.navigate('RunningTest', {
      testResult: { testId, pass },
    });
  };

  // ─── COLORS ───────────────────────────────────────────────
  if (phase === 'COLORS') {
    const current = COLOR_CYCLE[colorIndex];
    const textColor = current.color === '#FFFFFF' || current.color === '#00FF00' ? '#000' : '#FFF';

    if (colorsDone) {
      return (
        <View style={[styles.fullScreen, { backgroundColor: current.color }]}>
          <StatusBar hidden />
          <View style={styles.resultOverlay}>
            <Text style={[styles.overlayTitle, { color: '#FFF' }]}>Color Test Done</Text>
            <Text style={[styles.overlaySub, { color: '#DDD' }]}>Did all 5 colors display correctly with no tint or bleed?</Text>
            <View style={styles.btnRow}>
              <TouchableOpacity style={[styles.resBtn, { backgroundColor: colors.error }]} onPress={() => finishTest(false)}>
                <Text style={styles.resBtnText}>❌  FAIL</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.resBtn, { backgroundColor: colors.success }]} onPress={() => finishTest(true)}>
                <Text style={styles.resBtnText}>✅  PASS</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    }

    return (
      <View style={[styles.fullScreen, { backgroundColor: current.color }]}>
        <StatusBar hidden />
        <Text style={[styles.phaseTitle, { color: textColor }]}>{current.label}</Text>
        <Text style={[styles.timerText, { color: textColor }]}>
          {timeLeft}s  ({colorIndex + 1}/{COLOR_CYCLE.length})
        </Text>
        <TouchableOpacity style={styles.skipBtn} onPress={() => {
          clearInterval(timerRef.current!);
          setColorsDone(true);
        }}>
          <Text style={styles.skipBtnText}>Skip</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── DEAD PIXELS ──────────────────────────────────────────
  if (phase === 'DEAD_PIXELS') {
    return (
      <View style={[styles.fullScreen, { backgroundColor: '#FFFFFF' }]}>
        <StatusBar hidden />
        <View style={styles.resultOverlay}>
          <Text style={styles.overlayTitle}>DEAD PIXELS</Text>
          <Text style={styles.overlaySub}>Look across the entire white screen for any black, colored, or stuck dots.</Text>
          <View style={styles.btnRow}>
            <TouchableOpacity style={[styles.resBtn, { backgroundColor: colors.error }]} onPress={() => finishTest(false)}>
              <Text style={styles.resBtnText}>❌  FAIL</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.resBtn, { backgroundColor: colors.success }]} onPress={() => finishTest(true)}>
              <Text style={styles.resBtnText}>✅  PASS</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // ─── BRIGHTNESS ───────────────────────────────────────────
  if (phase === 'BRIGHTNESS') {
    return (
      <View style={styles.fullScreen}>
        <StatusBar hidden />
        <View style={styles.gradientContainer}>
          {Array.from({ length: 10 }).map((_, i) => (
            <View key={i} style={{ flex: 1, backgroundColor: `rgba(255,255,255,${(i + 1) / 10})` }} />
          ))}
        </View>
        <View style={styles.resultOverlay}>
          <Text style={styles.overlayTitle}>BRIGHTNESS GRADIENT</Text>
          <Text style={styles.overlaySub}>Is the screen lighting uniform across all gradient bands?</Text>
          <View style={styles.btnRow}>
            <TouchableOpacity style={[styles.resBtn, { backgroundColor: colors.error }]} onPress={() => finishTest(false)}>
              <Text style={styles.resBtnText}>❌  FAIL</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.resBtn, { backgroundColor: colors.success }]} onPress={() => finishTest(true)}>
              <Text style={styles.resBtnText}>✅  PASS</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // ─── PATTERNS ─────────────────────────────────────────────
  if (phase === 'PATTERNS') {
    return (
      <View style={styles.fullScreen}>
        <StatusBar hidden />
        <View style={styles.checkerboard}>
          {Array.from({ length: 12 }).map((_, r) => (
            <View key={r} style={{ flexDirection: 'row', flex: 1 }}>
              {Array.from({ length: 6 }).map((_, c) => (
                <View key={c} style={{ flex: 1, backgroundColor: (r + c) % 2 === 0 ? '#FFF' : '#000' }} />
              ))}
            </View>
          ))}
        </View>
        <View style={styles.resultOverlay}>
          <Text style={styles.overlayTitle}>PATTERN TEST</Text>
          <Text style={styles.overlaySub}>Are the lines straight with no geometric distortion or wavy edges?</Text>
          <View style={styles.btnRow}>
            <TouchableOpacity style={[styles.resBtn, { backgroundColor: colors.error }]} onPress={() => finishTest(false)}>
              <Text style={styles.resBtnText}>❌  FAIL</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.resBtn, { backgroundColor: colors.success }]} onPress={() => finishTest(true)}>
              <Text style={styles.resBtnText}>✅  PASS</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // ─── SMOOTHNESS ───────────────────────────────────────────
  if (phase === 'SMOOTHNESS') {
    return (
      <View style={[styles.fullScreen, { backgroundColor: '#000' }]}>
        <StatusBar hidden />
        <Animated.View style={[styles.movingBall, { transform: [{ translateX: moveAnim }] }]} />
        <View style={styles.resultOverlay}>
          <Text style={[styles.overlayTitle, { color: '#FFF' }]}>REFRESH RATE</Text>
          <Text style={[styles.overlaySub, { color: '#AAA' }]}>Is the ball movement perfectly smooth with no stuttering or tearing?</Text>
          <View style={styles.btnRow}>
            <TouchableOpacity style={[styles.resBtn, { backgroundColor: colors.error }]} onPress={() => finishTest(false)}>
              <Text style={styles.resBtnText}>❌  FAIL</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.resBtn, { backgroundColor: colors.success }]} onPress={() => finishTest(true)}>
              <Text style={styles.resBtnText}>✅  PASS</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // ─── BURN_IN (default) ────────────────────────────────────
  return (
    <TouchableOpacity
      style={[styles.fullScreen, { backgroundColor: '#333' }]}
      activeOpacity={1}
      onPress={() => {
        const target = showBurnInUI ? 0 : 1;
        setShowBurnInUI(!showBurnInUI);
        Animated.timing(burnInOpacity, { toValue: target, duration: 300, useNativeDriver: true }).start();
      }}
    >
      <StatusBar hidden />
      <Animated.View style={[styles.resultOverlay, { opacity: burnInOpacity }]}>
        <Text style={[styles.overlayTitle, { color: '#FFF' }]}>AMOLED BURN-IN</Text>
        <Text style={[styles.overlaySub, { color: '#AAA' }]}>
          Scan the gray background for "ghost" images or faded outlines. Tap screen to toggle this overlay.
        </Text>
        <View style={styles.btnRow}>
          <TouchableOpacity
            style={[styles.resBtn, { backgroundColor: colors.error }]}
            onPress={e => { e.stopPropagation(); finishTest(false); }}
            disabled={!showBurnInUI}
          >
            <Text style={styles.resBtnText}>❌  FAIL</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.resBtn, { backgroundColor: colors.success }]}
            onPress={e => { e.stopPropagation(); finishTest(true); }}
            disabled={!showBurnInUI}
          >
            <Text style={styles.resBtnText}>✅  PASS</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fullScreen: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  phaseTitle: { fontSize: 48, fontWeight: '900', letterSpacing: 4 },
  timerText:  { fontSize: 20, marginTop: 20, fontWeight: '600' },
  skipBtn:    { position: 'absolute', bottom: 60, padding: 14 },
  skipBtnText: { color: '#888', textDecorationLine: 'underline', fontSize: fontSize.sm },
  gradientContainer: { flex: 1, alignSelf: 'stretch', flexDirection: 'column' },
  checkerboard:      { flex: 1, alignSelf: 'stretch' },
  movingBall: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primary },
  resultOverlay: {
    position: 'absolute',
    bottom: 60,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.75)',
    borderRadius: radius.xl,
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  overlayTitle: { fontSize: 20, fontWeight: '800', color: '#FFF', letterSpacing: 1 },
  overlaySub:   { fontSize: 13, color: '#DDD', textAlign: 'center', lineHeight: 19 },
  btnRow: { flexDirection: 'row', gap: 12, width: '100%', marginTop: 4 },
  resBtn: { flex: 1, paddingVertical: 14, borderRadius: radius.md, alignItems: 'center' },
  resBtnText: { color: '#FFF', fontWeight: '800', fontSize: fontSize.md },
});
