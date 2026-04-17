import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Animated,
  Vibration,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
// import Canvas from 'react-native-canvas'; 
import { colors, fontSize, radius, spacing } from '../../common/theme';
import { RootStackParamList } from '../../common/types';

type Props = NativeStackScreenProps<RootStackParamList, 'DisplayTest'>;

const { width, height } = Dimensions.get('window');

type Phase = 'START' | 'COLORS' | 'DEAD_PIXELS' | 'BRIGHTNESS' | 'PATTERNS' | 'SMOOTHNESS' | 'BURN_IN' | 'DONE';

const COLOR_CYCLE = [
  { color: '#FF0000', label: 'RED' },
  { color: '#00FF00', label: 'GREEN' },
  { color: '#0000FF', label: 'BLUE' },
  { color: '#FFFFFF', label: 'WHITE' },
  { color: '#000000', label: 'BLACK' },
];

export default function DisplayTestScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const [phase, setPhase] = useState<Phase>('START');
  const [colorIndex, setColorIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(3);
  
  // Smoothness animation refs
  const moveAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startNextPhase = useCallback((next: Phase) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase(next);
    
    if (next === 'COLORS') {
      setColorIndex(0);
      setTimeLeft(3);
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Next color or next phase
            setColorIndex(curr => {
              if (curr >= COLOR_CYCLE.length - 1) {
                startNextPhase('DEAD_PIXELS');
                return curr;
              }
              setTimeLeft(3);
              return curr + 1;
            });
            return 3;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (next === 'SMOOTHNESS') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(moveAnim, { toValue: width - 80, duration: 1000, useNativeDriver: true }),
          Animated.timing(moveAnim, { toValue: 0, duration: 1000, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [moveAnim]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const finishTest = (pass: boolean) => {
    Vibration.vibrate(50);
    navigation.navigate('RunningTest', { 
      testResult: { testId: route.params.testId, pass } 
    });
  };

  // ── PHASE RENDERING ──

  if (phase === 'COLORS') {
    const current = COLOR_CYCLE[colorIndex];
    return (
      <View style={[styles.fullScreen, { backgroundColor: current.color }]}>
        <StatusBar hidden />
        <Text style={[styles.phaseTitle, { color: current.color === '#FFFFFF' ? '#000' : '#FFF' }]}>
          {current.label}
        </Text>
        <Text style={[styles.timerText, { color: current.color === '#FFFFFF' ? '#000' : '#FFF' }]}>
          Auto-switching in {timeLeft}s...
        </Text>
        <TouchableOpacity style={styles.skipBtn} onPress={() => startNextPhase('DEAD_PIXELS')}>
          <Text style={styles.skipBtnText}>Skip Colors</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (phase === 'DEAD_PIXELS') {
    return (
      <TouchableOpacity 
        style={[styles.fullScreen, { backgroundColor: '#FFFFFF' }]} 
        onPress={() => startNextPhase('BRIGHTNESS')}
        activeOpacity={1}
      >
        <StatusBar hidden />
        <View style={styles.instructionOverlay}>
          <Text style={styles.instructionText}>DEAD PIXELS TEST</Text>
          <Text style={styles.instructionSub}>Look for any black or colored dots on this white screen.</Text>
          <Text style={styles.tapToContinue}>Tap to continue</Text>
        </View>
      </TouchableOpacity>
    );
  }

  if (phase === 'BRIGHTNESS') {
    return (
      <TouchableOpacity 
        style={styles.fullScreen} 
        onPress={() => startNextPhase('PATTERNS')}
        activeOpacity={1}
      >
        <StatusBar hidden />
        <View style={styles.gradientContainer}>
          {Array.from({ length: 10 }).map((_, i) => (
            <View key={i} style={{ flex: 1, backgroundColor: `rgba(255,255,255,${(i + 1) / 10})` }} />
          ))}
        </View>
        <View style={styles.instructionOverlay}>
          <Text style={styles.instructionText}>BRIGHTNESS GRADIENT</Text>
          <Text style={styles.instructionSub}>Check if the screen lighting is uniform across all gradients.</Text>
          <Text style={styles.tapToContinue}>Tap to continue</Text>
        </View>
      </TouchableOpacity>
    );
  }

  if (phase === 'PATTERNS') {
    return (
      <TouchableOpacity 
        style={styles.fullScreen} 
        onPress={() => startNextPhase('SMOOTHNESS')}
        activeOpacity={1}
      >
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
        <View style={styles.instructionOverlay}>
          <Text style={styles.instructionText}>PATTERN TEST</Text>
          <Text style={styles.instructionSub}>Check for geometric distortion or alignment issues.</Text>
          <Text style={styles.tapToContinue}>Tap to continue</Text>
        </View>
      </TouchableOpacity>
    );
  }

  if (phase === 'SMOOTHNESS') {
    return (
      <TouchableOpacity 
        style={[styles.fullScreen, { backgroundColor: '#000' }]}
        onPress={() => startNextPhase('BURN_IN')}
        activeOpacity={1}
      >
        <StatusBar hidden />
        <Animated.View style={[styles.movingBall, { transform: [{ translateX: moveAnim }] }]} />
        <View style={styles.instructionOverlay}>
          <Text style={[styles.instructionText, { color: '#FFF' }]}>SMOOTHNESS TEST</Text>
          <Text style={[styles.instructionSub, { color: '#AAA' }]}>Observe the ball movement. It should be perfectly smooth without jitter.</Text>
          <Text style={styles.tapToContinue}>Tap to continue</Text>
        </View>
      </TouchableOpacity>
    );
  }

  if (phase === 'BURN_IN') {
    return (
      <View style={[styles.fullScreen, { backgroundColor: '#333' }]}>
        <StatusBar hidden />
        <View style={styles.instructionOverlay}>
          <Text style={[styles.instructionText, { color: '#FFF' }]}>AMOLED BURN-IN TEST</Text>
          <Text style={[styles.instructionSub, { color: '#AAA' }]}>Scan the gray background for "ghost" images of previous apps or icons.</Text>
        </View>
        <View style={styles.btnRow}>
          <TouchableOpacity style={[styles.resBtn, { backgroundColor: colors.error }]} onPress={() => finishTest(false)}>
            <Text style={styles.resBtnText}>FAIL</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.resBtn, { backgroundColor: colors.success }]} onPress={() => finishTest(true)}>
            <Text style={styles.resBtnText}>PASS</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // START SCREEN
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Display Diagnostic</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.body}>
        <Text style={styles.mainTitle}>Full LCD/OLED Coverage</Text>
        <Text style={styles.mainDesc}>
          This test will perform a complete diagnostic of your display panel across 6 professional checks.
        </Text>

        <View style={styles.featureList}>
          {['Color Cycle (Auto)', 'Dead Pixels', 'Brightness Gradients', 'Pattern Distortions', 'Motion Smoothness', 'AMOLED Burn-in'].map(f => (
            <View key={f} style={styles.featureItem}>
              <Text style={styles.featureIcon}>✔️</Text>
              <Text style={styles.featureText}>{f}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.startBtn} onPress={() => startNextPhase('COLORS')}>
          <Text style={styles.startBtnText}>START COMPREHENSIVE TEST</Text>
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
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  back: { fontSize: fontSize.md, color: colors.primary, fontWeight: '600', width: 60 },
  title: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text },
  body: { flex: 1, padding: spacing.xl, alignItems: 'center', justifyContent: 'center' },
  mainTitle: { fontSize: 28, fontWeight: '800', color: colors.text, textAlign: 'center' },
  mainDesc: { fontSize: 16, color: colors.textSecondary, textAlign: 'center', marginTop: 12, marginBottom: 32 },
  featureList: { alignSelf: 'stretch', marginBottom: 40, gap: 12 },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  featureIcon: { color: colors.primary },
  featureText: { color: colors.textSecondary, fontSize: 15 },
  startBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
    width: '100%',
  },
  startBtnText: { fontSize: fontSize.md, fontWeight: '800', color: colors.background, letterSpacing: 1 },

  // Phase Styles
  fullScreen: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  phaseTitle: { fontSize: 42, fontWeight: '900', letterSpacing: 4 },
  timerText: { fontSize: 18, marginTop: 24, fontWeight: '600' },
  skipBtn: { position: 'absolute', bottom: 60, padding: 12 },
  skipBtnText: { color: '#888', textDecorationLine: 'underline' },
  instructionOverlay: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  instructionText: { fontSize: 22, fontWeight: '800', color: '#FFF' },
  instructionSub: { fontSize: 14, color: '#DDD', textAlign: 'center', marginTop: 8 },
  tapToContinue: { fontSize: 12, color: colors.primary, marginTop: 12, fontWeight: '700' },
  gradientContainer: { flex: 1, alignSelf: 'stretch', flexDirection: 'column' },
  checkerboard: { flex: 1, alignSelf: 'stretch' },
  movingBall: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primary },
  btnRow: { position: 'absolute', bottom: 80, flexDirection: 'row', gap: 20, paddingHorizontal: 20 },
  resBtn: { flex: 1, paddingVertical: 18, borderRadius: 12, alignItems: 'center' },
  resBtnText: { color: '#FFF', fontWeight: '800', fontSize: 18 },
});
