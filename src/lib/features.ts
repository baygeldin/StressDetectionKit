import math from 'mathjs';

import { RrIntervalMark } from 'lib/types';
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
  const successiveDiffs = measurements
    .map((m, i, arr) => m.rrInterval - (arr[i - 1] || {}).rrInterval)
    .slice(1);

  return math.sqrt(
    math.sum(successiveDiffs.map(m => m * m)) / successiveDiffs.length
  );
}

// Jiawei Bai et al. An Activity Index for Raw Accelerometry Data and Its Comparison with Other Activity Metrics.
export function calcActivityIndex(measurements: SensorData[], error: number) {
  math.sqrt(math.max((calcAccelerometerVariance(measurements) - error) / 3, 0));
}
