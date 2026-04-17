export type TestStatus = 'pending' | 'running' | 'pass' | 'fail' | 'skipped';

export interface TestItem {
  id: string;
  name: string;
  description: string;
  category: TestCategory;
  icon: string;
  isManual: boolean;
  isAuto: boolean;
  status: TestStatus;
  value?: string;
  error?: string;
  duration?: number;
}

export type TestCategory =
  | 'Display'
  | 'Touch'
  | 'Audio'
  | 'Camera'
  | 'Sensors'
  | 'Connectivity'
  | 'Battery'
  | 'Hardware';

export interface TestResult {
  testId: string;
  name: string;
  category: TestCategory;
  status: TestStatus;
  value?: string;
  error?: string;
  timestamp: number;
  duration: number;
}

export interface DiagnosticReport {
  id: string;
  deviceModel: string;
  deviceBrand: string;
  timestamp: number;
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  results: TestResult[];
}

export interface DeviceSpecs {
  // Identity
  model: string;
  brand: string;
  manufacturer: string;
  deviceName: string;
  uniqueId: string;
  // OS
  systemName: string;
  systemVersion: string;
  buildId: string;
  apiLevel: string;
  isEmulator: boolean;
  // Processor
  cpuCores: number;
  // Memory
  totalMemory: number;
  usedMemory: number;
  totalStorage: number;
  freeStorage: number;
  // Battery
  batteryLevel: number;
  isBatteryCharging: boolean;
  // Network
  carrier: string;
  ipAddress: string;
  macAddress: string;
  // Display
  screenWidth: number;
  screenHeight: number;
  fontScale: number;
}

export type RootStackParamList = {
  Splash: undefined;
  Main: undefined;
  RunningTest: {
    selectedCategories?: TestCategory[] | 'all';
    testResult?: { testId: string; pass: boolean; value?: string };
  };
  TestResult: { results: TestResult[] };
  DisplayTest: { testId: string };
  TouchTest: { testId: string };
  AudioTest: { testId: string };
  SensorTest: { testId: string };
  NetworkTest: { testId: string };
  BatteryTest: { testId: string };
  CameraTest: { testId: string };
  ManualTest: { testId: string; testName: string; instruction: string };
  InteractiveDiagnostic: { selectedCategories?: TestCategory[] | 'all' };
};

export type TabParamList = {
  Home: undefined;
  DeviceInfo: undefined;
  Tests: undefined;
  Reports: undefined;
  Settings: undefined;
};
