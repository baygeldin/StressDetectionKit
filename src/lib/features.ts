import { Chunk, PulseMark, RrIntervalMark, Sample } from 'lib/types';
import math from 'mathjs';
import { SensorData } from 'react-native-sensors';

export function calcAccelerometerVariance(measurements: SensorData[]) {
  return (
    math.std(measurements.map(m => m.x)) +
    math.std(measurements.map(m => m.y)) +
    math.std(measurements.map(m => m.z))
  );
}

// Root Mean Square of the Successive Differences
export function calcRmssd(measurements: RrIntervalMark[]) {
  console.log(measurements.map(m => m.rrInterval), 'hrv');
  const successiveDiffs = measurements
    .map((m, i, arr) => m.rrInterval - (arr[i - 1] || {}).rrInterval)
    .slice(1);
  console.log(successiveDiffs);

  return math.sqrt(
    math.sum(successiveDiffs.map(m => m * m)) / successiveDiffs.length
  );
}

// Mean heart rate
export function calcHeartRate(measurements: PulseMark[]) {
  return math.mean(measurements.map(m => m.pulse));
}

// Jiawei Bai et al. An Activity Index for Raw Accelerometry Data and Its Comparison with Other Activity Metrics.
export function calcActivityIndex(measurements: SensorData[], error: number) {
  return math.sqrt(
    math.max((calcAccelerometerVariance(measurements) - error) / 3, 0)
  );
}

function flatten<T>(array: T[][]) {
  return array.reduce((acc, c) => acc.concat(c));
}

export function calcSample(
  chunks: Chunk[],
  accelerometerError: number,
  baselineRmssd: number,
  baselineHeartRate: number,
  timestamp: number
): Sample {
  const activityIndex = calcActivityIndex(
    flatten(chunks.map(c => c.accelerometer)),
    accelerometerError
  );
  const rmssd = calcRmssd(
    flatten(chunks.map(c => c.rrIntervals)).sort(
      (a, b) => a.timestamp - b.timestamp
    )
  );
  const heartrate = calcHeartRate(flatten(chunks.map(c => c.pulse)));
  const rmssdDiff = rmssd - baselineRmssd;
  const heartrateDiff = heartrate - baselineHeartRate;
  const state = math.random() >= 0.75;

  return {
    state,
    activityIndex,
    heartrate,
    heartrateDiff,
    rmssd,
    rmssdDiff,
    timestamp
  };
}
