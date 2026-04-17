import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fontSize } from '../common/theme';

interface InfoRowProps {
  label: string;
  value: string;
  icon?: string;
  highlight?: boolean;
}

export default function InfoRow({ label, value, icon, highlight }: InfoRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.labelRow}>
        {icon ? <Text style={styles.icon}>{icon}</Text> : null}
        <Text style={styles.label}>{label}</Text>
      </View>
      <Text style={[styles.value, highlight && styles.valueHighlight]} numberOfLines={1} ellipsizeMode="tail">
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    fontSize: 14,
    marginRight: 8,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  value: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: '500',
    maxWidth: '55%',
    textAlign: 'right',
  },
  valueHighlight: {
    color: colors.primary,
  },
});
