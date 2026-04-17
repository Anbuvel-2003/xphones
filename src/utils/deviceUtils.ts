import { Platform, Dimensions } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { DeviceSpecs } from '../common/types';

export async function fetchDeviceSpecs(): Promise<DeviceSpecs> {
  const { width, height } = Dimensions.get('screen');

  const [
    uniqueId,
    manufacturer,
    buildId,
    carrier,
    ipAddress,
    macAddress,
    totalMemory,
    usedMemory,
    totalStorage,
    freeStorage,
    batteryLevel,
    isBatteryCharging,
    isEmulator,
    apiLevel,
    fontScale,
  ] = await Promise.all([
    DeviceInfo.getUniqueId(),
    DeviceInfo.getManufacturer(),
    DeviceInfo.getBuildId(),
    DeviceInfo.getCarrier(),
    DeviceInfo.getIpAddress(),
    DeviceInfo.getMacAddress(),
    DeviceInfo.getTotalMemory(),
    DeviceInfo.getUsedMemory(),
    DeviceInfo.getTotalDiskCapacity(),
    DeviceInfo.getFreeDiskStorage(),
    DeviceInfo.getBatteryLevel(),
    DeviceInfo.isBatteryCharging(),
    DeviceInfo.isEmulator(),
    DeviceInfo.getApiLevel(),
    DeviceInfo.getFontScale(),
  ]);

  return {
    model: DeviceInfo.getModel(),
    brand: DeviceInfo.getBrand(),
    manufacturer,
    deviceName: DeviceInfo.getDeviceId(),
    uniqueId,
    systemName: Platform.OS === 'ios' ? 'iOS' : 'Android',
    systemVersion: DeviceInfo.getSystemVersion(),
    buildId,
    apiLevel: Platform.OS === 'android' ? String(apiLevel) : 'N/A',
    isEmulator,
    cpuCores: 0, // Not available without native module
    totalMemory,
    usedMemory,
    totalStorage,
    freeStorage,
    batteryLevel: Math.round(batteryLevel * 100),
    isBatteryCharging,
    carrier: carrier || 'Unknown',
    ipAddress: ipAddress || 'Not connected',
    macAddress: macAddress || 'N/A',
    screenWidth: Math.round(width),
    screenHeight: Math.round(height),
    fontScale,
  };
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

export function getBatteryColor(level: number): string {
  if (level > 60) return '#00E676';
  if (level > 30) return '#FFAB00';
  return '#FF4444';
}

export function getBatteryIcon(level: number, charging: boolean): string {
  if (charging) return '⚡';
  if (level > 80) return '🔋';
  if (level > 50) return '🔋';
  if (level > 20) return '🪫';
  return '🪫';
}
