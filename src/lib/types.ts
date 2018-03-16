import { Accelerometer, Gyroscope, SensorData } from 'react-native-sensors';

export type StressLevels = 'none' | 'low' | 'medium' | 'high';

export interface StressMark {
  start: number;
  end: number;
  level: StressLevels;
}

export interface PulseMark {
  rr: number;
  timestamp: number;
}

export interface RrIntervalMark {
  rrInterval: number;
  timestamp: number;
}

export interface Chunk {
  rrIntervals: RrIntervalMark[];
  pulse: PulseMark[];
  accelerometer: SensorData[];
  gyroscope: SensorData[];
  timestamp: number;
}

export interface Sample {
  activityIndex: number;
  hrv: number;
  stress: boolean;
  timestamp: number;
}

export type Sensor = typeof Accelerometer | typeof Gyroscope;
