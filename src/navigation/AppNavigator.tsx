import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet } from 'react-native';
import { colors } from '../common/theme';
import { RootStackParamList, TabParamList } from '../common/types';

import SplashScreen from '../screens/SplashScreen';
import HomeScreen from '../screens/HomeScreen';
import DeviceInfoScreen from '../screens/DeviceInfoScreen';
import TestSelectionScreen from '../screens/TestSelectionScreen';
import ReportScreen from '../screens/ReportScreen';
import SettingsScreen from '../screens/SettingsScreen';
import RunningTestScreen from '../screens/RunningTestScreen';
import TestResultScreen from '../screens/TestResultScreen';
import DisplayTestScreen from '../screens/tests/DisplayTestScreen';
import TouchTestScreen from '../screens/tests/TouchTestScreen';
import AudioTestScreen from '../screens/tests/AudioTestScreen';
import SensorTestScreen from '../screens/tests/SensorTestScreen';
import NetworkTestScreen from '../screens/tests/NetworkTestScreen';
import BatteryTestScreen from '../screens/tests/BatteryTestScreen';
import CameraTestScreen from '../screens/tests/CameraTestScreen';
import ManualTestScreen from '../screens/tests/ManualTestScreen';
import InteractiveDiagnosticScreen from '../screens/InteractiveDiagnosticScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

interface TabIconProps {
  icon: string;
  label: string;
  focused: boolean;
}

function TabIcon({ icon, label, focused }: TabIconProps) {
  return (
    <View style={styles.tabIcon}>
      <Text style={[styles.tabEmoji, focused && styles.tabEmojiActive]}>{icon}</Text>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="🏠" label="Home" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="DeviceInfo"
        component={DeviceInfoScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="📱" label="Device" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Tests"
        component={TestSelectionScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="🔬" label="Tests" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Reports"
        component={ReportScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="📊" label="Reports" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="⚙️" label="Settings" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Main" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen
        name="RunningTest"
        component={RunningTestScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="TestResult"
        component={TestResultScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen name="DisplayTest" component={DisplayTestScreen} />
      <Stack.Screen name="TouchTest" component={TouchTestScreen} />
      <Stack.Screen name="AudioTest" component={AudioTestScreen} />
      <Stack.Screen name="SensorTest" component={SensorTestScreen} />
      <Stack.Screen name="NetworkTest" component={NetworkTestScreen} />
      <Stack.Screen name="BatteryTest" component={BatteryTestScreen} />
      <Stack.Screen name="CameraTest" component={CameraTestScreen} />
      <Stack.Screen name="ManualTest" component={ManualTestScreen} />
      <Stack.Screen name="InteractiveDiagnostic" component={InteractiveDiagnosticScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.cardBorder,
    borderTopWidth: 1,
    height: 64,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabEmoji: {
    fontSize: 20,
    opacity: 0.5,
  },
  tabEmojiActive: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 2,
  },
  tabLabelActive: {
    color: colors.primary,
  },
});
