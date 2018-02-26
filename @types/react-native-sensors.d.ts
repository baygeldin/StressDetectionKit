declare module 'react-native-sensors' {
  export interface SensorData {
    timestamp: number;
    x: number;
    y: number;
    z: number;
  }

  export type SensorObservable = Rx.Observable<SensorData> & {
    stop: () => void;
  };

  type SensorFunction = (
    options?: { updateInterval: number }
  ) => Promise<SensorObservable>;

  export const Gyroscope: SensorFunction;

  export const Accelerometer: SensorFunction;
}
