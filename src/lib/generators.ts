import {
  CHUNK_LENGTH,
  SENSOR_UPDATE_INTERVAL,
  STEP_LENGTH,
  WINDOW_LENGTH
} from 'lib/constants';
import {
  Chunk,
  FeatureVector,
  PulseMark,
  RrIntervalMark,
  Sample
} from 'lib/types';
import { floor, random } from 'mathjs';
import { SensorData } from 'react-native-sensors';

const typescriptHeroFix = STEP_LENGTH;

function randomInt(from: number, to: number) {
  return floor(random(from, to));
}

export function generateChunk(timestamp: number): Chunk {
  const rrIntervals: RrIntervalMark[] = [];
  const pulse: PulseMark[] = [];
  const accelerometer: SensorData[] = [];

  const start = timestamp - CHUNK_LENGTH;
  const interval = (timestamp - start) / SENSOR_UPDATE_INTERVAL;

  for (let i = start; i <= timestamp; i += interval) {
    rrIntervals.push({ rrInterval: randomInt(600, 650), timestamp: i });
    pulse.push({ pulse: randomInt(50, 120), timestamp: i });
    accelerometer.push({
      x: randomInt(0, 15),
      y: randomInt(0, 15),
      z: randomInt(0, 15),
      timestamp: i
    });
  }

  return { rrIntervals, pulse, accelerometer, timestamp };
}

export function generateChunks(count: number, timestamp: number) {
  const start = timestamp - count * STEP_LENGTH;

  return new Array(count)
    .fill(0)
    .map((c, i) => generateChunk(start + CHUNK_LENGTH * i));
}

export function generateSample(
  baselineHrv: number,
  baselineHeartRate: number,
  timestamp: number
): Sample {
  const hrv = randomInt(20, 80);
  const heartRate = randomInt(60, 120);
  const vector = [random(), random(), random()] as FeatureVector;

  return {
    state: random() >= 0.75,
    vector,
    stdVector: vector,
    activityIndex: randomInt(0, 30),
    hrv,
    heartRate,
    timestamp
  };
}

export function generateSamples(count: number, timestamp: number) {
  const start = timestamp - WINDOW_LENGTH + CHUNK_LENGTH;
  const baselineHrv = floor(random(20, 80));
  const baselineHeartRate = floor(randomInt(50, 120));

  return new Array(count)
    .fill(0)
    .map((s, i) =>
      generateSample(baselineHrv, baselineHeartRate, start + STEP_LENGTH * i)
    );
}
