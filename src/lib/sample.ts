import { properties } from 'config/features';
import { parameters } from 'config/model';
import { STEP_SIZE } from 'lib/constants';
import { calcActivityIndex, calcHeartRate, calcRmssd } from 'lib/features';
import Svm, { SvmParameters } from 'lib/svm';
import { Chunk, FeatureVector, Sample } from 'lib/types';

const classifier = new Svm(parameters as SvmParameters);

const normalizers = properties.map(p => (value: number) =>
  (value - p.mean) / p.std
);

function flatten<T>(array: T[][]) {
  return array.reduce((acc, c) => acc.concat(c));
}

export function calcSample(
  chunks: Chunk[],
  accelerometerError: number,
  baselineHrv: number,
  baselineHeartRate: number,
  timestamp: number,
  state?: boolean
): Sample {
  // Calculate HRV based on whole window (5 minutes)
  const hrv = calcRmssd(
    flatten(chunks.map(c => c.rrIntervals)).sort(
      (a, b) => a.timestamp - b.timestamp
    )
  );

  // Calculate mean HR based on chunks from 2 last steps.
  const heartRateChunks = chunks.slice(-2 * STEP_SIZE);
  const heartRate = calcHeartRate(flatten(heartRateChunks.map(c => c.pulse)));

  // Calculate AI based on chunks that account for mean HR.
  // There is a ~1 chunk delay between sypathetic stimulation and HR increase.
  const activityIndexChunks = chunks.slice(-2 * STEP_SIZE - 1, -1);
  const activityIndex = calcActivityIndex(
    flatten(activityIndexChunks.map(c => c.accelerometer)),
    accelerometerError
  );

  // Calculate AI for representation based on chunks from last step.
  const activityIndexUiChunks = chunks.slice(-STEP_SIZE);
  const activityIndexUi = calcActivityIndex(
    flatten(activityIndexUiChunks.map(c => c.accelerometer)),
    accelerometerError
  );

  const vector = [
    hrv / baselineHrv,
    heartRate / baselineHeartRate,
    activityIndex
  ] as FeatureVector;

  const stdVector = vector.map((f, i) => normalizers[i](f)) as FeatureVector;

  return {
    state: state !== undefined ? state : classifier.predict(stdVector) === 1,
    vector,
    stdVector,
    activityIndex: activityIndexUi,
    heartRate,
    hrv,
    timestamp
  };
}
