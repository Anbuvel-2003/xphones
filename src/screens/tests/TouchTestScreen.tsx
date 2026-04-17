import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  PanResponder,
  Dimensions,
  Animated,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../common/types';

type Props = NativeStackScreenProps<RootStackParamList, 'TouchTest'>;

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const COLS = 7;
const CELL_W = Math.floor(SCREEN_W / COLS);
const ROWS = Math.ceil(SCREEN_H / CELL_W);
const TOTAL_CELLS = COLS * ROWS;
const TEST_DURATION = 10;

export default function TouchTestScreen({ navigation }: Props) {
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(TEST_DURATION);
  const [phase, setPhase] = useState<'tip' | 'testing' | 'done'>('tip');
  const [showTip, setShowTip] = useState(true);
  const tipOpacity = useRef(new Animated.Value(1)).current;
  const gridOrigin = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchedRef = useRef<Set<string>>(new Set());

  const coverage = Math.round((touched.size / TOTAL_CELLS) * 100);

  const finish = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase('done');
  }, []);

  const startTimer = useCallback(() => {
    setPhase('testing');
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          finish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [finish]);

  // Auto-dismiss tip after 2s and start timer
  useEffect(() => {
    const t = setTimeout(() => {
      Animated.timing(tipOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        setShowTip(false);
        startTimer();
      });
    }, 2000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const markCell = useCallback((pageX: number, pageY: number) => {
    const col = Math.floor((pageX - gridOrigin.current.x) / CELL_W);
    const row = Math.floor((pageY - gridOrigin.current.y) / CELL_W);
    if (col >= 0 && col < COLS && row >= 0 && row < ROWS) {
      const key = `${row}-${col}`;
      if (!touchedRef.current.has(key)) {
        touchedRef.current = new Set([...touchedRef.current, key]);
        setTouched(new Set(touchedRef.current));
      }
    }
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: e => markCell(e.nativeEvent.pageX, e.nativeEvent.pageY),
      onPanResponderMove: e => markCell(e.nativeEvent.pageX, e.nativeEvent.pageY),
    })
  ).current;

  const reset = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    touchedRef.current = new Set();
    setTouched(new Set());
    setTimeLeft(TEST_DURATION);
    setPhase('tip');
    setShowTip(true);
    tipOpacity.setValue(1);
  };

  // ── DONE SCREEN ──
  if (phase === 'done') {
    const pass = coverage >= 75;
    return (
      <View style={styles.doneScreen}>
        <StatusBar hidden />
        <Text style={styles.doneEmoji}>{pass ? '✅' : '⚠️'}</Text>
        <Text style={styles.doneTitle}>Touch Test Complete</Text>
        <Text style={[styles.doneScore, { color: pass ? '#00E676' : '#FFAB00' }]}>
          {coverage}% Coverage
        </Text>
        <Text style={styles.doneDesc}>
          {touched.size} of {TOTAL_CELLS} cells touched
        </Text>
        <Text style={[styles.doneVerdict, { color: pass ? '#00E676' : '#FFAB00' }]}>
          {pass ? '🎉 Touchscreen working correctly!' : '⚠️ Some areas may be unresponsive'}
        </Text>
        <View style={styles.doneBtns}>
          <TouchableOpacity style={styles.doneRetryBtn} onPress={reset}>
            <Text style={styles.doneRetryText}>↺  Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.doneRetryBtn, styles.doneDoneBtn]}
            onPress={() => navigation.goBack()}
          >
            <Text style={[styles.doneRetryText, { color: '#000' }]}>✓  Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── GRID SCREEN ──
  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {/* Full-screen touch grid */}
      <View
        style={styles.grid}
        onLayout={() => {
          // measure after layout so we get screen coords
        }}
        ref={(ref: any) => {
          if (ref) {
            ref.measureInWindow((x: number, y: number) => {
              gridOrigin.current = { x, y };
            });
          }
        }}
        {...panResponder.panHandlers}
      >
        {Array.from({ length: ROWS }, (_, row) => (
          <View key={row} style={styles.row}>
            {Array.from({ length: COLS }, (_, col) => {
              const key = `${row}-${col}`;
              const isTouched = touched.has(key);
              return (
                <View
                  key={col}
                  style={[
                    styles.cell,
                    { width: CELL_W, height: CELL_W },
                    isTouched && styles.cellTouched,
                  ]}
                />
              );
            })}
          </View>
        ))}
      </View>

      {/* Skip / countdown button */}
      {phase === 'testing' && (
        <TouchableOpacity style={styles.skipBtn} onPress={finish} activeOpacity={0.8}>
          <Text style={styles.skipText}>
            {timeLeft > 0 ? `Skip ${timeLeft}...` : 'Skip'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Back button top-left */}
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>✕</Text>
      </TouchableOpacity>

      {/* Tip overlay */}
      {showTip && (
        <Animated.View style={[styles.tipOverlay, { opacity: tipOpacity }]} pointerEvents="none">
          <Text style={styles.tipTitle}>SCREEN TEST TIP</Text>
          <Text style={styles.tipDesc}>
            Swipe Your Finger Across Boxes To Change The Color
          </Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  grid: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    backgroundColor: '#FFFFFF',
    borderWidth: 0.5,
    borderColor: '#000000',
  },
  cellTouched: {
    backgroundColor: '#3355FF',
  },

  // Skip button
  skipBtn: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: 'rgba(200,200,200,0.85)',
    borderRadius: 20,
    paddingHorizontal: 28,
    paddingVertical: 10,
  },
  skipText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },

  // Back button
  backBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '700',
  },

  // Tip overlay (centered)
  tipOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  tipTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#000',
    textDecorationLine: 'underline',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 1,
  },
  tipDesc: {
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
    lineHeight: 24,
  },

  // Done screen
  doneScreen: {
    flex: 1,
    backgroundColor: '#0A0E1A',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  doneEmoji: { fontSize: 72, marginBottom: 16 },
  doneTitle: { fontSize: 26, fontWeight: '800', color: '#FFF', marginBottom: 8 },
  doneScore: { fontSize: 48, fontWeight: '900', marginBottom: 4 },
  doneDesc: { fontSize: 15, color: '#8899AA', marginBottom: 16 },
  doneVerdict: { fontSize: 16, fontWeight: '600', textAlign: 'center', marginBottom: 40 },
  doneBtns: { flexDirection: 'row', gap: 12 },
  doneRetryBtn: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#1E2435',
    borderWidth: 1,
    borderColor: '#2A3349',
  },
  doneDoneBtn: { backgroundColor: '#00D4FF' },
  doneRetryText: { fontSize: 15, fontWeight: '700', color: '#FFF' },
});
