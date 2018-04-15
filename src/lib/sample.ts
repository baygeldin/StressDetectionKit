import minmax from 'config/minmax.json';
import model from 'config/model.json';
import { scaleLinear } from 'd3';
import Svm from 'lib/classifiers/svm';
import { Chunk, Sample } from 'lib/types';
import { calcActivityIndex, calcRmssd, calcHeartRate } from 'lib/features';

const classifier = new Svm(model);

const normalizeHrv = scaleLinear()
  .domain(minmax.hrvRatio)
  .range([0, 1]);

const normalizeHeartRate = scaleLinear()
  .domain(minmax.heartRateRatio)
  .range([0, 1]);

const normalizeActivity = scaleLinear()
  .domain(minmax.activityIndex)
  .range([0, 1]);

function flatten<T>(array: T[][]) {
  return array.reduce((acc, c) => acc.concat(c));
}

export default function (
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
    normalizeHrv(hrv),
    normalizeHeartRate(heartRate),
    normalizeActivity(activityIndex)
  ] as [number, number, number];
  const state = classifier.predict(vector) === 1;

  return {
    state,
    vector,
    activityIndex,
    heartRate,
    hrv,
    timestamp
  };
}
