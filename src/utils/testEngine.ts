import { TestItem, TestCategory } from '../common/types';

export const ALL_TESTS: TestItem[] = [
  // Display
  {
    id: 'display_colors',
    name: 'Color Accuracy',
    description: 'Automated RGB color cycle check',
    category: 'Display',
    icon: '🖥️',
    isManual: true,
    isAuto: false,
    status: 'pending',
  },
  {
    id: 'dead_pixels',
    name: 'Dead Pixels',
    description: 'Visual scan for dead or stuck pixels',
    category: 'Display',
    icon: '🔲',
    isManual: true,
    isAuto: false,
    status: 'pending',
  },
  {
    id: 'display_brightness',
    name: 'Screen Brightness',
    description: 'Check uniform lighting and gradients',
    category: 'Display',
    icon: '☀️',
    isManual: true,
    isAuto: false,
    status: 'pending',
  },
  {
    id: 'display_patterns',
    name: 'Display Patterns',
    description: 'Checkerboard and grid distortion check',
    category: 'Display',
    icon: '🏁',
    isManual: true,
    isAuto: false,
    status: 'pending',
  },
  {
    id: 'display_smoothness',
    name: 'Refresh Rate',
    description: 'Test motion smoothness and frame drops',
    category: 'Display',
    icon: '➰',
    isManual: true,
    isAuto: false,
    status: 'pending',
  },
  {
    id: 'display_burnin',
    name: 'AMOLED Burn-in',
    description: 'Scan for persistent ghost images',
    category: 'Display',
    icon: '👻',
    isManual: true,
    isAuto: false,
    status: 'pending',
  },

  // Touch
  {
    id: 'touch_screen',
    name: 'Touch Grid',
    description: 'Device adaptive grid touch coverage',
    category: 'Touch',
    icon: '👆',
    isManual: true,
    isAuto: false,
    status: 'pending',
  },
  {
    id: 'multi_touch',
    name: 'Multi-Touch',
    description: 'Detect 2-5 concurrent finger touches',
    category: 'Touch',
    icon: '🤲',
    isManual: true,
    isAuto: false,
    status: 'pending',
  },
  {
    id: 'gesture_test',
    name: 'Gestures',
    description: 'Verify Swipe, Pinch, and Zoom interactions',
    category: 'Touch',
    icon: '🤏',
    isManual: true,
    isAuto: false,
    status: 'pending',
  },
  {
    id: 'pressure_test',
    name: 'Pressure Sensitivity',
    description: 'Detect touch force/pressure changes',
    category: 'Touch',
    icon: '⏬',
    isManual: true,
    isAuto: false,
    status: 'pending',
  },

  // Audio
  {
    id: 'speaker',
    name: 'Speaker',
    description: 'Play test tone through the speaker',
    category: 'Audio',
    icon: '🔊',
    isManual: true,
    isAuto: false,
    status: 'pending',
  },
  {
    id: 'microphone',
    name: 'Microphone',
    description: 'Record audio and check microphone',
    category: 'Audio',
    icon: '🎙️',
    isManual: true,
    isAuto: false,
    status: 'pending',
  },
  {
    id: 'earpiece',
    name: 'Earpiece',
    description: 'Test the earpiece speaker',
    category: 'Audio',
    icon: '📞',
    isManual: true,
    isAuto: false,
    status: 'pending',
  },

  // Camera
  {
    id: 'rear_camera',
    name: 'Rear Camera',
    description: 'Test main rear camera capture',
    category: 'Camera',
    icon: '📷',
    isManual: true,
    isAuto: false,
    status: 'pending',
  },
  {
    id: 'front_camera',
    name: 'Front Camera',
    description: 'Test selfie / front camera',
    category: 'Camera',
    icon: '🤳',
    isManual: true,
    isAuto: false,
    status: 'pending',
  },
  {
    id: 'flash',
    name: 'Flash / Torch',
    description: 'Test camera flash and torch mode',
    category: 'Camera',
    icon: '⚡',
    isManual: true,
    isAuto: false,
    status: 'pending',
  },

  // Sensors
  {
    id: 'accelerometer',
    name: 'Accelerometer',
    description: 'Read device motion along X, Y, Z axes',
    category: 'Sensors',
    icon: '📐',
    isManual: false,
    isAuto: true,
    status: 'pending',
  },
  {
    id: 'gyroscope',
    name: 'Gyroscope',
    description: 'Measure angular velocity of device rotation',
    category: 'Sensors',
    icon: '🔄',
    isManual: false,
    isAuto: true,
    status: 'pending',
  },
  {
    id: 'magnetometer',
    name: 'Magnetometer',
    description: 'Measure magnetic field / compass direction',
    category: 'Sensors',
    icon: '🧭',
    isManual: false,
    isAuto: true,
    status: 'pending',
  },
  {
    id: 'proximity',
    name: 'Proximity Sensor',
    description: 'Detects objects near the screen',
    category: 'Sensors',
    icon: '📡',
    isManual: true,
    isAuto: false,
    status: 'pending',
  },
  {
    id: 'light_sensor',
    name: 'Ambient Light',
    description: 'Measures surrounding light level (lux)',
    category: 'Sensors',
    icon: '💡',
    isManual: false,
    isAuto: true,
    status: 'pending',
  },

  // Connectivity
  {
    id: 'wifi',
    name: 'WiFi',
    description: 'Check WiFi connection and signal',
    category: 'Connectivity',
    icon: '📶',
    isManual: false,
    isAuto: true,
    status: 'pending',
  },
  {
    id: 'cellular',
    name: 'Cellular / SIM',
    description: 'Check cellular network and SIM status',
    category: 'Connectivity',
    icon: '📲',
    isManual: false,
    isAuto: true,
    status: 'pending',
  },
  {
    id: 'gps',
    name: 'GPS / Location',
    description: 'Test GPS accuracy and location fix',
    category: 'Connectivity',
    icon: '🗺️',
    isManual: false,
    isAuto: true,
    status: 'pending',
  },
  {
    id: 'bluetooth',
    name: 'Bluetooth',
    description: 'Check Bluetooth adapter availability',
    category: 'Connectivity',
    icon: '🔷',
    isManual: false,
    isAuto: true,
    status: 'pending',
  },

  // Battery
  {
    id: 'battery_level',
    name: 'Battery Level',
    description: 'Read current battery charge level',
    category: 'Battery',
    icon: '🔋',
    isManual: false,
    isAuto: true,
    status: 'pending',
  },
  {
    id: 'battery_temp',
    name: 'Battery Temperature',
    description: 'Check battery operating temperature',
    category: 'Battery',
    icon: '🌡️',
    isManual: false,
    isAuto: true,
    status: 'pending',
  },
  {
    id: 'charging',
    name: 'Charging Port',
    description: 'Verify USB charging functionality',
    category: 'Battery',
    icon: '🔌',
    isManual: true,
    isAuto: false,
    status: 'pending',
  },

  // Hardware
  {
    id: 'vibration',
    name: 'Vibration Motor',
    description: 'Test haptic feedback motor',
    category: 'Hardware',
    icon: '📳',
    isManual: true,
    isAuto: false,
    status: 'pending',
  },
  {
    id: 'volume_up',
    name: 'Volume Up Button',
    description: 'Press the volume up button to test',
    category: 'Hardware',
    icon: '🔼',
    isManual: true,
    isAuto: false,
    status: 'pending',
  },
  {
    id: 'volume_down',
    name: 'Volume Down Button',
    description: 'Press the volume down button to test',
    category: 'Hardware',
    icon: '🔽',
    isManual: true,
    isAuto: false,
    status: 'pending',
  },
  {
    id: 'storage_check',
    name: 'Storage',
    description: 'Verify internal storage read/write',
    category: 'Hardware',
    icon: '💾',
    isManual: false,
    isAuto: true,
    status: 'pending',
  },
  {
    id: 'ram_check',
    name: 'RAM',
    description: 'Check total and available RAM',
    category: 'Hardware',
    icon: '🧠',
    isManual: false,
    isAuto: true,
    status: 'pending',
  },
];

// Biometric test (added for launch flow)
const BIOMETRIC_TEST: TestItem = {
  id: 'biometric',
  name: 'Biometric Security',
  description: 'Test fingerprint / face unlock. Place finger on sensor or look at camera.',
  category: 'Hardware',
  icon: '🔐',
  isManual: true,
  isAuto: false,
  status: 'pending',
};

// Ordered sequence used on every app launch
const LAUNCH_SEQUENCE_IDS: string[] = [
  // Display — each sub-test is its own step before moving to touch
  'display_colors',
  'dead_pixels',
  'display_brightness',
  'display_patterns',
  'display_smoothness',
  'display_burnin',
  // Touch
  'touch_screen',     // Touch grid
  'pressure_test',    // Pressure sensitivity
  'gesture_test',     // Swipe / pinch / zoom
  'biometric',        // Fingerprint / face
  'rear_camera',      // Rear camera capture
  'front_camera',     // Front camera capture
  'volume_up',        // Volume up button
  'volume_down',      // Volume down button
  'wifi',             // WiFi
  'bluetooth',        // Bluetooth / BLE
  'gps',              // GPS / Location
  'accelerometer',    // Motion sensor
  'gyroscope',        // Rotation sensor
  'magnetometer',     // Compass sensor
  'proximity',        // Proximity sensor
  'light_sensor',     // Ambient light sensor
  'battery_level',    // Battery health
  'battery_temp',     // Battery temperature
  'charging',         // Charging port
  'multi_touch',
  'speaker',
  'microphone',
  'earpiece',
  'flash',
  'vibration',
  'storage_check',
  'ram_check',
  'cellular',
];

export function getLaunchSequenceTests(): TestItem[] {
  const pool = [...ALL_TESTS, BIOMETRIC_TEST];
  return LAUNCH_SEQUENCE_IDS
    .map(id => pool.find(t => t.id === id))
    .filter((t): t is TestItem => Boolean(t));
}

export function getTestsByCategory(category: TestCategory): TestItem[] {
  return ALL_TESTS.filter(t => t.category === category);
}

export function getTestsForCategories(categories: TestCategory[] | 'all'): TestItem[] {
  if (categories === 'all') return getLaunchSequenceTests();
  if (!categories || !Array.isArray(categories)) return [];
  return ALL_TESTS.filter(t => categories.includes(t.category));
}

export const CATEGORY_ICONS: Record<TestCategory, string> = {
  Display: '🖥️',
  Touch: '👆',
  Audio: '🔊',
  Camera: '📷',
  Sensors: '🧭',
  Connectivity: '📡',
  Battery: '🔋',
  Hardware: '⚙️',
};

export const TEST_CATEGORIES: TestCategory[] = [
  'Display',
  'Touch',
  'Audio',
  'Camera',
  'Sensors',
  'Connectivity',
  'Battery',
  'Hardware',
];
