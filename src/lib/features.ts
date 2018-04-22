import { PulseMark, RrIntervalMark } from 'lib/types';
import { max, mean, sqrt, std, sum } from 'mathjs';
import { SensorData } from 'react-native-sensors';

export function calcAccelerometerVariance(measurements: SensorData[]) {
  return (
    std(measurements.map(m => m.x)) +
    std(measurements.map(m => m.y)) +
    std(measurements.map(m => m.z))
  );
}

// Root Mean Square of the Successive Differences
export function calcRmssd(measurements: RrIntervalMark[]) {
  if (!measurements.length) return 0;

  const successiveDiffs = measurements
    .map((m, i, arr) => m.rrInterval - (arr[i - 1] || {}).rrInterval)
    .slice(1);

  return sqrt(sum(successiveDiffs.map(m => m * m)) / successiveDiffs.length);
}

// Mean heart rate
export function calcHeartRate(measurements: PulseMark[]) {
  if (!measurements.length) return 0;
  return mean(measurements.map(m => m.pulse)) as number;
}

// Jiawei Bai et al. An Activity Index for Raw Accelerometry Data and Its Comparison with Other Activity Metrics.
export function calcActivityIndex(measurements: SensorData[], error: number) {
  return sqrt(max((calcAccelerometerVariance(measurements) - error) / 3, 0));
}
