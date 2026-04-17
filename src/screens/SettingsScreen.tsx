import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  StatusBar,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, radius, fontSize } from '../common/theme';

interface SettingRow {
  icon: string;
  label: string;
  sub?: string;
  type: 'toggle' | 'action' | 'info';
  value?: boolean;
  onPress?: () => void;
  onToggle?: (v: boolean) => void;
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const [darkMode, setDarkMode] = useState(true);
  const [autoReport, setAutoReport] = useState(false);
  const [vibrationFeedback, setVibrationFeedback] = useState(true);
  const [technicianMode, setTechnicianMode] = useState(false);

  const settingsGroups: Array<{ title: string; rows: SettingRow[] }> = [
    {
      title: 'Appearance',
      rows: [
        {
          icon: '🌙',
          label: 'Dark Mode',
          sub: 'Use dark theme throughout the app',
          type: 'toggle',
          value: darkMode,
          onToggle: setDarkMode,
        },
      ],
    },
    {
      title: 'Testing',
      rows: [
        {
          icon: '📊',
          label: 'Auto Generate Report',
          sub: 'Automatically create report after full test',
          type: 'toggle',
          value: autoReport,
          onToggle: setAutoReport,
        },
        {
          icon: '📳',
          label: 'Vibration Feedback',
          sub: 'Haptic feedback during tests',
          type: 'toggle',
          value: vibrationFeedback,
          onToggle: setVibrationFeedback,
        },
        {
          icon: '🔧',
          label: 'Technician Mode',
          sub: 'Enable advanced testing options',
          type: 'toggle',
          value: technicianMode,
          onToggle: setTechnicianMode,
        },
      ],
    },
    {
      title: 'Permissions',
      rows: [
        {
          icon: '📍',
          label: 'Location',
          sub: 'Required for GPS tests',
          type: 'action',
          onPress: () => Alert.alert('Location', 'Go to device settings to manage location permission.'),
        },
        {
          icon: '🎤',
          label: 'Microphone',
          sub: 'Required for audio tests',
          type: 'action',
          onPress: () => Alert.alert('Microphone', 'Go to device settings to manage microphone permission.'),
        },
        {
          icon: '📷',
          label: 'Camera',
          sub: 'Required for camera tests',
          type: 'action',
          onPress: () => Alert.alert('Camera', 'Go to device settings to manage camera permission.'),
        },
      ],
    },
    {
      title: 'Data',
      rows: [
        {
          icon: '🗑️',
          label: 'Clear Reports',
          sub: 'Delete all saved diagnostic reports',
          type: 'action',
          onPress: () =>
            Alert.alert('Clear Reports', 'Delete all saved reports?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: () => Alert.alert('Done', 'Reports cleared.') },
            ]),
        },
      ],
    },
    {
      title: 'About',
      rows: [
        { icon: '📱', label: 'App Version', sub: '1.0.0', type: 'info' },
        { icon: '👨‍💻', label: 'Developer', sub: 'Xphones Team', type: 'info' },
        {
          icon: '⭐',
          label: 'Rate App',
          sub: 'Leave a review on the App Store',
          type: 'action',
          onPress: () => Alert.alert('Rate App', 'Thank you!'),
        },
      ],
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <View style={styles.header}>
        <Text style={styles.title}>⚙️  Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {settingsGroups.map(group => (
          <View key={group.title} style={styles.group}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            <View style={styles.card}>
              {group.rows.map((row, i) => (
                <TouchableOpacity
                  key={row.label}
                  style={[styles.row, i < group.rows.length - 1 && styles.rowBorder]}
                  onPress={row.type === 'action' ? row.onPress : undefined}
                  activeOpacity={row.type === 'action' ? 0.7 : 1}
                >
                  <View style={styles.rowLeft}>
                    <View style={styles.rowIcon}>
                      <Text style={styles.rowIconText}>{row.icon}</Text>
                    </View>
                    <View style={styles.rowInfo}>
                      <Text style={styles.rowLabel}>{row.label}</Text>
                      {row.sub ? <Text style={styles.rowSub}>{row.sub}</Text> : null}
                    </View>
                  </View>
                  {row.type === 'toggle' && (
                    <Switch
                      value={row.value}
                      onValueChange={row.onToggle}
                      trackColor={{ false: colors.cardBorder, true: colors.primary }}
                      thumbColor={colors.text}
                    />
                  )}
                  {row.type === 'action' && (
                    <Text style={styles.chevron}>›</Text>
                  )}
                  {row.type === 'info' && (
                    <Text style={styles.infoValue}>{row.sub}</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
        <View style={{ height: 80 }} />
      </ScrollView>
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
  title: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.text,
  },
  scroll: { padding: spacing.md },
  group: { marginBottom: spacing.md },
  groupTitle: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
    paddingLeft: 4,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowIconText: { fontSize: 18 },
  rowInfo: { flex: 1 },
  rowLabel: {
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: '500',
  },
  rowSub: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  chevron: {
    fontSize: 22,
    color: colors.textMuted,
    fontWeight: '300',
  },
  infoValue: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
});
