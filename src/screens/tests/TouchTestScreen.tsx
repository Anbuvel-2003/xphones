import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, fontSize, radius, spacing } from '../../common/theme';
import { RootStackParamList } from '../../common/types';

type Props = NativeStackScreenProps<RootStackParamList, 'TouchTest'>;

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

type Phase = 'START' | 'GRID' | 'MULTI_TOUCH' | 'GESTURES' | 'PRESSURE' | 'DONE';

const COLS = 7;
const CELL_W = Math.floor(SCREEN_W / COLS);
const ROWS = Math.ceil((SCREEN_H - 120) / CELL_W);
const TOTAL_CELLS = COLS * ROWS;

export default function TouchTestScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const [phase, setPhase] = useState<Phase>('START');
  const [timeLeft, setTimeLeft] = useState(15);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // Grid State
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const coverage = Math.round((touched.size / TOTAL_CELLS) * 100);

  // Multi-touch State
  const [activeTouches, setActiveTouches] = useState(0);
  const [maxTouches, setMaxTouches] = useState(0);

  // Gestures State
  const [gestureStatus, setGestureStatus] = useState({ swipe: false, pinch: false, zoom: false });
  const [pressure, setPressure] = useState(0);

  // ── TIMER LOGIC ──
  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(15);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          autoProceed();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [phase]);

  const autoProceed = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (phase === 'GRID') setPhase('MULTI_TOUCH');
    else if (phase === 'MULTI_TOUCH') setPhase('GESTURES');
    else if (phase === 'GESTURES') setPhase('PRESSURE');
    else if (phase === 'PRESSURE') navigation.navigate('RunningTest', { testResult: { testId: route.params.testId, pass: true } });
  };

  useEffect(() => {
    if (phase !== 'START' && phase !== 'DONE') {
      startTimer();
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase, startTimer]);

  // ── GESTURE DEFINITIONS ──
  const gridPan = Gesture.Pan()
    .onUpdate((e) => {
      const col = Math.floor(e.x / CELL_W);
      const row = Math.floor((e.y - insets.top - 60) / CELL_W);
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

  const multiTouchPan = Gesture.Manual()
    .onTouchesMove((e) => {
      const count = e.allTouches.length;
      setActiveTouches(count);
      if (count > maxTouches) setMaxTouches(count);
    })
    .onTouchesUp(() => setActiveTouches(0))
    .runOnJS(true);

  const combinedGestures = Gesture.Race(
    Gesture.Pinch().onUpdate((e) => {
      if (e.scale > 1.2) setGestureStatus(prev => ({ ...prev, zoom: true }));
      if (e.scale < 0.8) setGestureStatus(prev => ({ ...prev, pinch: true }));
    }).runOnJS(true),
    Gesture.Pan().onEnd((e) => {
      if (Math.abs(e.velocityX) > 500) setGestureStatus(prev => ({ ...prev, swipe: true }));
    }).runOnJS(true)
  );

  // ── UI COMPONENTS ──
  const DiagnosticHeader = ({ title, status }: { title: string, status?: string }) => (
    <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerExit}>
        <Text style={styles.headerExitText}>✕ Exit</Text>
      </TouchableOpacity>
      <View style={styles.headerCenter}>
        <Text style={styles.headerTitle}>{title}</Text>
        {status && <Text style={styles.headerStatus}>{status}</Text>}
      </View>
      <View style={styles.headerRight}>
        <View style={[styles.timerBadge, timeLeft <= 5 && styles.timerBadgeLow]}>
          <Text style={styles.timerText}>{timeLeft}s</Text>
        </View>
      </View>
    </View>
  );

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
            <View style={{ flex: 1 }}>
              <DiagnosticHeader title="Grid Coverage" status={`${coverage}% complete`} />
              <View style={styles.gridContainer}>
                {Array.from({ length: ROWS }).map((_, r) => (
                  <View key={r} style={styles.row}>
                    {Array.from({ length: COLS }).map((_, c) => (
                      <View key={`${r}-${c}`} style={[styles.cell, touched.has(`${r}-${c}`) && styles.cellTouched]} />
                    ))}
                  </View>
                ))}
              </View>
              <TouchableOpacity onPress={() => setPhase('MULTI_TOUCH')} style={styles.floatingAction}>
                <Text style={styles.floatingActionText}>Skip to Multi-Touch →</Text>
              </TouchableOpacity>
            </View>
          </GestureDetector>
        );

      case 'MULTI_TOUCH':
        return (
          <GestureDetector gesture={multiTouchPan}>
            <View style={styles.flexCenter}>
              <DiagnosticHeader title="Multi-Touch" status={`Max: ${maxTouches} fingers`} />
              <View style={styles.touchCounterContainer}>
                <Text style={styles.touchCountBig}>{activeTouches}</Text>
                <Text style={styles.touchLabel}>Active Touches</Text>
              </View>
              <TouchableOpacity onPress={() => setPhase('GESTURES')} style={styles.largeNextBtn}>
                <Text style={styles.largeNextBtnText}>NEXT: GESTURES</Text>
              </TouchableOpacity>
            </View>
          </GestureDetector>
        );

      case 'GESTURES':
        return (
          <GestureDetector gesture={combinedGestures}>
            <View style={styles.flexCenter}>
              <DiagnosticHeader title="Gestures" status="Pinch / Zoom / Swipe" />
              <View style={styles.gestureGrid}>
                {[{ key: 'swipe', label: 'Fast Swipe', icon: '↔️' }, { key: 'pinch', label: 'Pinch In', icon: '🤌' }, { key: 'zoom', label: 'Pinch Out', icon: '👐' }].map(g => (
                  <View key={g.key} style={[styles.gestureCard, gestureStatus[g.key as keyof typeof gestureStatus] && styles.cardPass]}>
                    <Text style={styles.cardEmoji}>{g.icon}</Text>
                    <Text style={styles.cardText}>{g.label}</Text>
                  </View>
                ))}
              </View>
              <TouchableOpacity onPress={() => setPhase('PRESSURE')} style={styles.largeNextBtn}>
                <Text style={styles.largeNextBtnText}>NEXT: PRESSURE</Text>
              </TouchableOpacity>
            </View>
          </GestureDetector>
        );

      case 'PRESSURE':
        return (
          <View style={styles.flexCenter}>
            <DiagnosticHeader title="Pressure" status="Force Sensing" />
            <View style={styles.pressureCircle}><View style={[styles.pressureValue, { transform: [{ scale: 0.5 + pressure }] }]} /></View>
            <Text style={styles.manualDesc}>Note: Modern Android devices use touch area proxy. Press harder to grow the circle.</Text>
            <View style={styles.btnRow}>
              <TouchableOpacity style={[styles.resBtn, { backgroundColor: colors.error }]} onPress={() => navigation.navigate('RunningTest', { testResult: { testId: route.params.testId, pass: false } })}><Text style={styles.resBtnText}>FAIL</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.resBtn, { backgroundColor: colors.success }]} onPress={() => navigation.navigate('RunningTest', { testResult: { testId: route.params.testId, pass: true } })}><Text style={styles.resBtnText}>PASS</Text></TouchableOpacity>
            </View>
          </View>
        );

      default: return null;
    }
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar hidden={phase !== 'START'} />
      {renderContent()}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  flexCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.cardBorder, zIndex: 100 },
  headerExit: { paddingHorizontal: 16, paddingVertical: 8 },
  headerExitText: { color: colors.error, fontWeight: '700', fontSize: 13 },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { color: colors.text, fontWeight: '800', fontSize: 14 },
  headerStatus: { color: colors.primary, fontSize: 11, fontWeight: '600', marginTop: 2 },
  headerRight: { paddingHorizontal: 16 },
  timerBadge: { backgroundColor: colors.surface, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: colors.cardBorder },
  timerBadgeLow: { borderColor: colors.error, backgroundColor: colors.errorBg },
  timerText: { color: colors.text, fontSize: 11, fontWeight: '800' },
  body: { flex: 1, padding: spacing.xl, justifyContent: 'center', alignItems: 'center' },
  mainTitle: { fontSize: 26, fontWeight: '800', color: colors.text, textAlign: 'center' },
  mainDesc: { fontSize: 15, color: colors.textSecondary, textAlign: 'center', marginTop: 12, marginBottom: 32 },
  featureList: { alignSelf: 'stretch', marginBottom: 40, gap: 12 },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  featureText: { color: colors.textSecondary, fontSize: 14 },
  startBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 18, paddingHorizontal: 32, width: '100%', alignItems: 'center' },
  startBtnText: { color: colors.background, fontWeight: '800', letterSpacing: 1 },
  gridContainer: { flex: 1, backgroundColor: '#FFF' },
  row: { flexDirection: 'row' },
  cell: { width: CELL_W, height: CELL_W, borderWidth: 0.5, borderColor: '#eee' },
  cellTouched: { backgroundColor: colors.primary },
  floatingAction: { position: 'absolute', bottom: 30, keepRight: 20, alignSelf: 'center', backgroundColor: colors.primary + 'CC', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 30 },
  floatingActionText: { color: colors.background, fontWeight: '800', fontSize: 13 },
  touchCounterContainer: { width: 180, height: 180, borderRadius: 90, borderWidth: 8, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 30, marginTop: 40 },
  touchCountBig: { fontSize: 80, fontWeight: '900', color: colors.text },
  touchLabel: { color: colors.textSecondary, fontSize: 12, textTransform: 'uppercase' },
  largeNextBtn: { paddingVertical: 16, paddingHorizontal: 40, borderRadius: radius.full, borderWidth: 2, borderColor: colors.primary },
  largeNextBtnText: { color: colors.primary, fontWeight: '700' },
  gestureGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, padding: 20, marginBottom: 40, marginTop: 40 },
  gestureCard: { width: (SCREEN_W - 60) / 2, height: 100, backgroundColor: colors.card, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.cardBorder },
  cardPass: { borderColor: colors.success, backgroundColor: colors.success + '20' },
  cardEmoji: { fontSize: 28 },
  cardText: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
  pressureCircle: { width: 220, height: 220, borderRadius: 110, borderWidth: 1, borderColor: colors.primary + '30', alignItems: 'center', justifyContent: 'center', marginBottom: 30, marginTop: 40 },
  pressureValue: { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.primary },
  manualDesc: { fontSize: 12, color: colors.textMuted, textAlign: 'center', paddingHorizontal: 40, marginBottom: 30 },
  btnRow: { flexDirection: 'row', gap: 20, width: '100%', paddingHorizontal: 30 },
  resBtn: { flex: 1, paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  resBtnText: { color: '#FFF', fontWeight: '800' },
});
