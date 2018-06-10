declare module 'react-native-bluetooth-status' {
  const BluetoothStatus: {
    state: () => Promise<boolean>;
    enable: (state?: boolean) => Promise<void>;
    openBluetoothSettings: () => void;
  }

  export { BluetoothStatus };
}
