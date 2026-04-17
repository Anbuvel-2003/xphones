import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, radius, fontSize } from '../common/theme';
import { TestCategory, RootStackParamList } from '../common/types';
import { TEST_CATEGORIES, CATEGORY_ICONS, getTestsByCategory } from '../utils/testEngine';

type Nav = NativeStackNavigationProp<RootStackParamList>;

interface CategoryCardProps {
  category: TestCategory;
  selected: boolean;
  onToggle: () => void;
}

function CategoryCard({ category, selected, onToggle }: CategoryCardProps) {
  const tests = getTestsByCategory(category);
  const autoCount = tests.filter(t => t.isAuto).length;
  const manualCount = tests.filter(t => t.isManual).length;

  return (
    <TouchableOpacity
      style={[styles.categoryCard, selected && styles.categoryCardSelected]}
      onPress={onToggle}
      activeOpacity={0.8}
    >
      <View style={styles.categoryCardLeft}>
        <View style={[styles.categoryIcon, selected && styles.categoryIconSelected]}>
          <Text style={styles.categoryIconText}>{CATEGORY_ICONS[category]}</Text>
        </View>
        <View>
          <Text style={[styles.categoryName, selected && styles.categoryNameSelected]}>{category}</Text>
          <Text style={styles.categoryCount}>{tests.length} tests</Text>
          <View style={styles.testTypePills}>
            {autoCount > 0 && (
              <View style={styles.pill}>
                <Text style={styles.pillText}>⚡ {autoCount} auto</Text>
              </View>
            )}
            {manualCount > 0 && (
              <View style={[styles.pill, styles.pillManual]}>
                <Text style={[styles.pillText, styles.pillTextManual]}>👆 {manualCount} manual</Text>
              </View>
            )}
          </View>
        </View>
      </View>
      <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
        {selected && <Text style={styles.checkboxIcon}>✓</Text>}
      </View>
    </TouchableOpacity>
  );
}

export default function TestSelectionScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const [selected, setSelected] = useState<Set<TestCategory>>(new Set());
  const [mode, setMode] = useState<'full' | 'custom'>('full');

  const toggleCategory = (cat: TestCategory) => {
    const next = new Set(selected);
    if (next.has(cat)) next.delete(cat);
    else next.add(cat);
    setSelected(next);
  };

  const totalSelected = mode === 'full'
    ? TEST_CATEGORIES.reduce((sum, c) => sum + getTestsByCategory(c).length, 0)
    : [...selected].reduce((sum, c) => sum + getTestsByCategory(c).length, 0);

  const canStart = mode === 'full' || selected.size > 0;

  const startTest = () => {
    if (!canStart) return;
    navigation.navigate('RunningTest', {
      selectedCategories: mode === 'full' ? 'all' : [...selected],
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <View style={styles.header}>
        <Text style={styles.title}>🔬  Select Tests</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Mode Toggle */}
        <View style={styles.modeRow}>
          <TouchableOpacity
            style={[styles.modeBtn, mode === 'full' && styles.modeBtnActive]}
            onPress={() => setMode('full')}
          >
            <Text style={[styles.modeBtnText, mode === 'full' && styles.modeBtnTextActive]}>
              🚀 Full Test
            </Text>
            <Text style={[styles.modeBtnSub, mode === 'full' && styles.modeBtnSubActive]}>
              All 28 tests
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeBtn, mode === 'custom' && styles.modeBtnActive]}
            onPress={() => setMode('custom')}
          >
            <Text style={[styles.modeBtnText, mode === 'custom' && styles.modeBtnTextActive]}>
              🎯 Custom
            </Text>
            <Text style={[styles.modeBtnSub, mode === 'custom' && styles.modeBtnSubActive]}>
              Choose categories
            </Text>
          </TouchableOpacity>
        </View>

        {mode === 'full' ? (
          <View style={styles.fullTestInfo}>
            <Text style={styles.fullTestInfoTitle}>Full Diagnostic Mode</Text>
            <Text style={styles.fullTestInfoDesc}>
              Runs all 28 hardware and software tests across 8 categories.
              Includes automated checks and manual interactive tests.
            </Text>
            <View style={styles.categoriesList}>
              {TEST_CATEGORIES.map(cat => {
                const tests = getTestsByCategory(cat);
                return (
                  <View key={cat} style={styles.categoryPill}>
                    <Text style={styles.categoryPillText}>
                      {CATEGORY_ICONS[cat]} {cat} ({tests.length})
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        ) : (
          <>
            <View style={styles.selectAll}>
              <TouchableOpacity
                onPress={() => {
                  if (selected.size === TEST_CATEGORIES.length) {
                    setSelected(new Set());
                  } else {
                    setSelected(new Set(TEST_CATEGORIES));
                  }
                }}
              >
                <Text style={styles.selectAllText}>
                  {selected.size === TEST_CATEGORIES.length ? '✗ Deselect All' : '✓ Select All'}
                </Text>
              </TouchableOpacity>
              <Text style={styles.selectedCount}>{selected.size} / {TEST_CATEGORIES.length} selected</Text>
            </View>
            {TEST_CATEGORIES.map(cat => (
              <CategoryCard
                key={cat}
                category={cat}
                selected={selected.has(cat)}
                onToggle={() => toggleCategory(cat)}
              />
            ))}
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Start Button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <View style={styles.footerInfo}>
          <Text style={styles.footerInfoLabel}>Selected Tests</Text>
          <Text style={styles.footerInfoValue}>{totalSelected}</Text>
        </View>
        <TouchableOpacity
          style={[styles.startBtn, !canStart && styles.startBtnDisabled]}
          onPress={startTest}
          disabled={!canStart}
          activeOpacity={0.85}
        >
          <Text style={styles.startBtnText}>
            {canStart ? '▶  Start Tests' : 'Select categories'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  title: { fontSize: fontSize.xl, fontWeight: '800', color: colors.text },
  scroll: { padding: spacing.md },
  modeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: spacing.md,
  },
  modeBtn: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
  },
  modeBtnActive: {
    backgroundColor: colors.primary + '18',
    borderColor: colors.primary,
  },
  modeBtnText: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  modeBtnTextActive: { color: colors.primary },
  modeBtnSub: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 4,
  },
  modeBtnSubActive: { color: colors.primary + 'AA' },
  fullTestInfo: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  fullTestInfoTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  fullTestInfoDesc: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  categoriesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryPill: {
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  categoryPillText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  selectAll: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectAllText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: '600',
  },
  selectedCount: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  categoryCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '08',
  },
  categoryCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  categoryIconSelected: {
    backgroundColor: colors.primary + '20',
  },
  categoryIconText: { fontSize: 24 },
  categoryName: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  categoryNameSelected: { color: colors.primary },
  categoryCount: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  testTypePills: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  pill: {
    backgroundColor: colors.infoBg,
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  pillManual: { backgroundColor: colors.warningBg },
  pillText: {
    fontSize: 9,
    color: colors.info,
    fontWeight: '600',
  },
  pillTextManual: { color: colors.warning },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxIcon: {
    fontSize: 14,
    color: colors.background,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    gap: 12,
  },
  footerInfo: {
    backgroundColor: colors.card,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  footerInfoLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  footerInfoValue: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.primary,
  },
  startBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  startBtnDisabled: {
    backgroundColor: colors.card,
  },
  startBtnText: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.background,
  },
});
