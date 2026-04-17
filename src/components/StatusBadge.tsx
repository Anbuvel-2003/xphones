import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fontSize, radius } from '../common/theme';
import { TestStatus } from '../common/types';

interface StatusBadgeProps {
  status: TestStatus;
  size?: 'sm' | 'md';
}

const STATUS_CONFIG: Record<TestStatus, { label: string; color: string; bg: string; icon: string }> = {
  pending: { label: 'PENDING', color: colors.textMuted, bg: 'rgba(85,102,119,0.15)', icon: '⏳' },
  running: { label: 'RUNNING', color: colors.info, bg: colors.infoBg, icon: '⚙️' },
  pass: { label: 'PASS', color: colors.success, bg: colors.successBg, icon: '✅' },
  fail: { label: 'FAIL', color: colors.error, bg: colors.errorBg, icon: '❌' },
  skipped: { label: 'SKIP', color: colors.warning, bg: colors.warningBg, icon: '⏭️' },
};

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const isSmall = size === 'sm';

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }, isSmall && styles.badgeSm]}>
      <Text style={[styles.icon, isSmall && styles.iconSm]}>{config.icon}</Text>
      <Text style={[styles.label, { color: config.color }, isSmall && styles.labelSm]}>
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  badgeSm: {
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  icon: {
    fontSize: 11,
    marginRight: 4,
  },
  iconSm: {
    fontSize: 9,
    marginRight: 3,
  },
  label: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  labelSm: {
    fontSize: 9,
  },
});
