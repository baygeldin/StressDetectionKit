import { NativeModules } from 'react-native';

// This module helps to persist application even
// when the screen is locked and the app is hidden.

export function startForegroundService() {
  NativeModules.Foreground.startService();
}

export function stopForegroundService() {
  NativeModules.Foreground.stopService();
}
