import React, { useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Animated,
} from 'react-native';
import { 
  GestureHandlerRootView, 
  Gesture, 
  GestureDetector,
} from 'react-native-gesture-handler';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, fontSize, radius, spacing } from '../../common/theme';
import { RootStackParamList } from '../../common/types';

type Props = NativeStackScreenProps<RootStackParamList, 'TouchTest'>;

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

type Phase = 'START' | 'GRID' | 'MULTI_TOUCH' | 'GESTURES' | 'PRESSURE' | 'DONE';

// Grid Constants
const COLS = 7;
const CELL_W = Math.floor(SCREEN_W / COLS);
const ROWS = Math.ceil((SCREEN_H - 100) / CELL_W);
const TOTAL_CELLS = COLS * ROWS;

export default function TouchTestScreen({ navigation, route }: Props) {
  const [phase, setPhase] = useState<Phase>('START');
  
  // Grid State
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const coverage = Math.round((touched.size / TOTAL_CELLS) * 100);

  // Multi-touch State
  const [activeTouches, setActiveTouches] = useState(0);
  const [maxTouches, setMaxTouches] = useState(0);

  // Gestures State
  const [gestureStatus, setGestureStatus] = useState({
    swipe: false,
    pinch: false,
    zoom: false,
  });

  // Pressure State
  const [pressure, setPressure] = useState(0);

  // ── GESTURE DEFINITIONS ──

  // 1. Grid Interaction (using Pan)
  const gridPan = Gesture.Pan()
    .onUpdate((e) => {
      const col = Math.floor(e.x / CELL_W);
      const row = Math.floor(e.y / CELL_W);
      if (col >= 0 && col < COLS && row >= 0 && row < ROWS) {
        const key = `${row}-${col}`;
        setTouched(prev => {
          if (prev.has(key)) return prev;
          const next = new Set(prev);
          next.add(key);
          return next;
        });
      }
    })
    .runOnJS(true);

  // 2. Multi-touch Detection
  const multiTouchPan = Gesture.Manual()
    .onTouchesMove((e, manager) => {
      // numberOfPointers is only available on some events, 
      // but we can track allActivePointers
      const count = e.allTouches.length;
      setActiveTouches(count);
      if (count > maxTouches) setMaxTouches(count);
    })
    .onTouchesUp(() => {
      setActiveTouches(0);
    })
    .runOnJS(true);

  // 3. Gesture Validation (Pinch/Zoom)
  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      if (e.scale > 1.2) setGestureStatus(prev => ({ ...prev, zoom: true }));
      if (e.scale < 0.8) setGestureStatus(prev => ({ ...prev, pinch: true }));
    })
    .runOnJS(true);

  const swipeGesture = Gesture.Pan()
    .onEnd((e) => {
      if (Math.abs(e.velocityX) > 500) setGestureStatus(prev => ({ ...prev, swipe: true }));
    })
    .runOnJS(true);

  const combinedGestures = Gesture.Race(pinchGesture, swipeGesture);

  // ── PHASE RENDERING ──

  const renderContent = () => {
    switch (phase) {
      case 'START':
        return (
          <View style={styles.body}>
            <Text style={styles.mainTitle}>Touch & Gesture Diagnostic</Text>
            <Text style={styles.mainDesc}>We will test panel responsiveness, multi-touch capacity, and gesture recognition.</Text>
            <View style={styles.featureList}>
              {['Adaptive Touch Grid', 'Multi-Touch (up to 5 fingers)', 'Swipe & Pinch detection', 'Pressure sensitivity'].map(f => (
                <View key={f} style={styles.featureItem}><Text>🎯</Text><Text style={styles.featureText}>{f}</Text></View>
              ))}
            </View>
            <TouchableOpacity style={styles.startBtn} onPress={() => setPhase('GRID')}>
              <Text style={styles.startBtnText}>START TOUCH LAB</Text>
            </TouchableOpacity>
          </View>
        );

      case 'GRID':
        return (
          <GestureDetector gesture={gridPan}>
            <View style={styles.flexCenter}>
              <View style={styles.statsHeader}>
                <Text style={styles.statsText}>Coverage: {coverage}%</Text>
                <TouchableOpacity onPress={() => setPhase('MULTI_TOUCH')} style={styles.nextPhaseBtn}>
                  <Text style={styles.nextPhaseText}>Next Stage →</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.gridContainer}>
                {Array.from({ length: ROWS }).map((_, r) => (
                  <View key={r} style={styles.row}>
                    {Array.from({ length: COLS }).map((_, c) => (
                      <View key={`${r}-${c}`} style={[styles.cell, touched.has(`${r}-${c}`) && styles.cellTouched]} />
                    ))}
                  </View>
                ))}
              </View>
            </View>
          </GestureDetector>
        );

      case 'MULTI_TOUCH':
        return (
          <GestureDetector gesture={multiTouchPan}>
            <View style={styles.flexCenter}>
              <Text style={styles.instructionLarge}>PLACE MULTIPLE FINGERS</Text>
              <View style={styles.touchCounterContainer}>
                <Text style={styles.touchCountBig}>{activeTouches}</Text>
                <Text style={styles.touchLabel}>Active Touches</Text>
              </View>
              <Text style={styles.maxLabel}>Max Detected: {maxTouches}</Text>
              <TouchableOpacity onPress={() => setPhase('GESTURES')} style={styles.largeNextBtn}>
                <Text style={styles.largeNextBtnText}>GO TO GESTURE TEST</Text>
              </TouchableOpacity>
            </View>
          </GestureDetector>
        );

      case 'GESTURES':
        return (
          <GestureDetector gesture={combinedGestures}>
            <View style={styles.flexCenter}>
              <Text style={styles.instructionLarge}>PERFORM GESTURES</Text>
              <View style={styles.gestureGrid}>
                <View style={[styles.gestureCard, gestureStatus.swipe && styles.cardPass]}>
                  <Text style={styles.cardEmoji}>↔️</Text>
                  <Text style={styles.cardText}>Fast Swipe</Text>
                </View>
                <View style={[styles.gestureCard, gestureStatus.pinch && styles.cardPass]}>
                  <Text style={styles.cardEmoji}>🤌</Text>
                  <Text style={styles.cardText}>Pinch In</Text>
                </View>
                <View style={[styles.gestureCard, gestureStatus.zoom && styles.cardPass]}>
                  <Text style={styles.cardEmoji}>👐</Text>
                  <Text style={styles.cardText}>Pinch Out (Zoom)</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setPhase('PRESSURE')} style={styles.largeNextBtn}>
                <Text style={styles.largeNextBtnText}>CHECK PRESSURE</Text>
              </TouchableOpacity>
            </View>
          </GestureDetector>
        );

      case 'PRESSURE':
        return (
          <View style={styles.flexCenter}>
            <Text style={styles.instructionLarge}>PRESSURE SENSITIVITY</Text>
            <View style={styles.pressureCircle}>
              <View style={[styles.pressureValue, { transform: [{ scale: 0.5 + pressure }] }]} />
            </View>
            <Text style={styles.manualDesc}>Note: Modern Android devices use touch area as a proxy for pressure. Press harder to see the circle grow.</Text>
              <TouchableOpacity style={[styles.resBtn, { backgroundColor: colors.error }]} onPress={() => navigation.navigate('RunningTest', { testResult: { testId: route.params.testId, pass: false } })}>
                <Text style={styles.resBtnText}>FAIL</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.resBtn, { backgroundColor: colors.success }]} onPress={() => navigation.navigate('RunningTest', { testResult: { testId: route.params.testId, pass: true } })}>
                <Text style={styles.resBtnText}>PASS</Text>
              </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar hidden={phase !== 'START'} />
      {phase !== 'START' && (
        <View style={[styles.miniHeader, { top: 10 + (phase === 'GRID' ? 0 : 40) }]}>
           <TouchableOpacity onPress={() => navigation.goBack()} style={styles.exitBtn}>
              <Text style={styles.exitText}>✕ Exit Test</Text>
           </TouchableOpacity>
        </View>
      )}
      {renderContent()}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  flexCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  body: { flex: 1, padding: spacing.xl, justifyContent: 'center', alignItems: 'center' },
  mainTitle: { fontSize: 26, fontWeight: '800', color: colors.text, textAlign: 'center' },
  mainDesc: { fontSize: 15, color: colors.textSecondary, textAlign: 'center', marginTop: 12, marginBottom: 32 },
  featureList: { alignSelf: 'stretch', marginBottom: 40, gap: 12 },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  featureText: { color: colors.textSecondary, fontSize: 14 },
  startBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 18, paddingHorizontal: 32, width: '100%', alignItems: 'center' },
  startBtnText: { color: colors.background, fontWeight: '800', letterSpacing: 1 },

  // Grid
  gridContainer: { flex: 1, backgroundColor: '#FFF' },
  row: { flexDirection: 'row' },
  cell: { width: CELL_W, height: CELL_W, borderWidth: 0.5, borderColor: '#eee' },
  cellTouched: { backgroundColor: colors.primary },
  statsHeader: { height: 60, width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, backgroundColor: colors.card },
  statsText: { color: colors.text, fontWeight: '700' },
  nextPhaseBtn: { backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  nextPhaseText: { color: colors.background, fontWeight: '700', fontSize: 12 },

  // Multi-touch
  instructionLarge: { fontSize: 20, fontWeight: '800', color: colors.primary, marginBottom: 30 },
  touchCounterContainer: { width: 180, height: 180, borderRadius: 90, borderWidth: 8, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  touchCountBig: { fontSize: 80, fontWeight: '900', color: colors.text },
  touchLabel: { color: colors.textSecondary, fontSize: 12, textTransform: 'uppercase' },
  maxLabel: { color: colors.textMuted, fontSize: 14, marginBottom: 40 },
  largeNextBtn: { paddingVertical: 16, paddingHorizontal: 40, borderRadius: radius.full, borderWidth: 2, borderColor: colors.primary },
  largeNextBtnText: { color: colors.primary, fontWeight: '700' },

  // Gestures
  gestureGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, padding: 20, marginBottom: 40 },
  gestureCard: { width: (SCREEN_W - 60) / 2, height: 100, backgroundColor: colors.card, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.cardBorder },
  cardPass: { borderColor: colors.success, backgroundColor: colors.success + '20' },
  cardEmoji: { fontSize: 28 },
  cardText: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },

  // Pressure
  pressureCircle: { width: 250, height: 250, borderRadius: 125, borderWidth: 1, borderColor: colors.primary + '30', alignItems: 'center', justifyContent: 'center', marginBottom: 30 },
  pressureValue: { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.primary },

  // Common
  miniHeader: { position: 'absolute', right: 20, zIndex: 100 },
  exitBtn: { backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  exitText: { color: '#FFF', fontSize: 12 },
  btnRow: { flexDirection: 'row', gap: 20, width: '100%', paddingHorizontal: 30 },
  resBtn: { flex: 1, paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  resBtnText: { color: '#FFF', fontWeight: '800' },
});
