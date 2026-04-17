import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { colors, radius, fontSize, spacing } from '../common/theme';
import { TestItem } from '../common/types';
import StatusBadge from './StatusBadge';

interface TestCardProps {
  test: TestItem;
  onPress?: () => void;
  compact?: boolean;
}

export default function TestCard({ test, onPress, compact }: TestCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, compact && styles.cardCompact]}
      onPress={onPress}
      activeOpacity={0.75}
      disabled={!onPress}
    >
      <View style={styles.left}>
        <View style={styles.iconBox}>
          <Text style={styles.icon}>{test.icon}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{test.name}</Text>
          {!compact && (
            <Text style={styles.description} numberOfLines={1}>
              {test.description}
            </Text>
          )}
          <Text style={styles.category}>{test.category}</Text>
        </View>
      </View>
      <StatusBadge status={test.status} size={compact ? 'sm' : 'md'} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 2,
  },
  cardCompact: {
    padding: 10,
    marginBottom: 6,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(0,212,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 20,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: '600',
  },
  description: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  category: {
    fontSize: fontSize.xs,
    color: colors.primary,
    marginTop: 2,
    fontWeight: '500',
  },
});
