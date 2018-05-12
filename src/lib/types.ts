import { Accelerometer, Gyroscope, SensorData } from 'react-native-sensors';

export type StressLevel = 'none' | 'low' | 'medium' | 'high';
export type ChartType = 'hrv' | 'heartRate' | 'activity';

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
  timestamp: number;
}

// HRV / baseline HRV, heart rate / baseline heart rate, activity index
export type FeatureVector = [number, number, number];

export interface Sample {
  state: boolean; // stressed or not
  vector: FeatureVector; // feature vector for the classificator
  stdVector: FeatureVector; // standardized feature vector
  activity: number; // activity intensity
  heartRate: number; // mean heart rate
  hrv: number; // root mean square of RR intervals successive differences
  stress?: StressLevel; // percieved stress level
  timestamp: number; // last chunk's timestamp
}

export type Sensor = typeof Accelerometer | typeof Gyroscope;
