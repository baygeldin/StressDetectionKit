import {
  CHUNK_LENGTH,
  SENSOR_UPDATE_INTERVAL,
  STEP_LENGTH,
  WINDOW_LENGTH
} from 'lib/constants';
import { Chunk, PulseMark, RrIntervalMark, Sample } from 'lib/types';
import math from 'mathjs';
import { SensorData } from 'react-native-sensors';

const typescriptHeroFix = STEP_LENGTH;

function random(from: number, to: number) {
  return math.floor(math.random(from, to));
}

export function generateChunk(timestamp: number): Chunk {
  const rrIntervals: RrIntervalMark[] = [];
  const pulse: PulseMark[] = [];
  const accelerometer: SensorData[] = [];
  const gyroscope: SensorData[] = [];

  const start = timestamp - CHUNK_LENGTH;
  const interval = (timestamp - start) / SENSOR_UPDATE_INTERVAL;

  for (let i = start; i <= timestamp; i += interval) {
    rrIntervals.push({ rrInterval: random(600, 650), timestamp: i });
    pulse.push({ pulse: random(50, 120), timestamp: i });
    accelerometer.push({
      x: random(0, 15),
      y: random(0, 15),
      z: random(0, 15),
      timestamp: i
    });
    gyroscope.push({
      x: random(0, 15),
      y: random(0, 15),
      z: random(0, 15),
      timestamp: i
    });
  }

  return { rrIntervals, pulse, accelerometer, gyroscope, timestamp };
}

export function generateChunks(count: number, timestamp: number) {
  const start = timestamp - count * STEP_LENGTH;

  return new Array(count)
    .fill(0)
    .map((c, i) => generateChunk(start + CHUNK_LENGTH * i));
}

export function generateSample(baseline: number, timestamp: number): Sample {
  const rmssd = random(20, 80);

  return {
    state: math.random() >= 0.75,
    activityIndex: random(0, 30),
    rmssd,
    heartrate: random(60, 120),
    rmssdDiff: rmssd - baseline,
    timestamp
  };
}

export function generateSamples(count: number, timestamp: number) {
  const start = timestamp - WINDOW_LENGTH + CHUNK_LENGTH;
  const baseline = math.floor(math.random(20, 80));

  return new Array(count)
    .fill(0)
    .map((s, i) => generateSample(baseline, start + STEP_LENGTH * i));
}
