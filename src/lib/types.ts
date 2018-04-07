import { Accelerometer, Gyroscope, SensorData } from 'react-native-sensors';

export type StressLevel = 'none' | 'low' | 'medium' | 'high';
export type ChartType = 'hrv' | 'hr' | 'activity';

export interface StressMark {
  start: number;
  end: number;
  level: StressLevel;
}

export interface PulseMark {
  pulse: number;
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
  state: boolean; // stressed or not
  activityIndex: number; // activity intensity
  heartrate: number; // mean heartrate
  rmssd: number; // root mean square of the successive differences
  rmssdDiff: number; // RMSSD difference relative to the baseline
  stress?: StressLevel; // percieved stress level
  timestamp: number;
}

export type Sensor = typeof Accelerometer | typeof Gyroscope;
