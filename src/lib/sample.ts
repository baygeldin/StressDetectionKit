import { properties } from 'config/features';
import { parameters } from 'config/model';
import Svm, { SvmParameters } from 'lib/classifiers/svm';
import { calcActivityIndex, calcHeartRate, calcRmssd } from 'lib/features';
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
  timestamp: number
): Sample {
  const activityIndex = calcActivityIndex(
    flatten(chunks.map(c => c.accelerometer)),
    accelerometerError
  );
  const hrv = calcRmssd(
    flatten(chunks.map(c => c.rrIntervals)).sort(
      (a, b) => a.timestamp - b.timestamp
    )
  );
  const heartRate = calcHeartRate(flatten(chunks.map(c => c.pulse)));

  const vector = [
    hrv / baselineHrv,
    heartRate / baselineHeartRate,
    activityIndex
  ] as FeatureVector;

  const stdVector = vector.map((f, i) => normalizers[i](f)) as FeatureVector;

  const state = classifier.predict(stdVector) === 1;

  return {
    state,
    vector,
    stdVector,
    activityIndex,
    heartRate,
    hrv,
    timestamp
  };
}
