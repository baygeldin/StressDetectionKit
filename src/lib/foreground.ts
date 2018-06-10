import { NativeModules, Platform } from 'react-native';

// This module helps to persist application even
// when the screen is locked and the app is hidden.

export function startForegroundService() {
  if (Platform.OS === 'ios') return;
  NativeModules.Foreground.startService();
}

export function stopForegroundService() {
  if (Platform.OS === 'ios') return;
  NativeModules.Foreground.stopService();
}
