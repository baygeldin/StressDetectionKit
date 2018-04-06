import {
  CALIBRATION_LENGTH,
  CHUNKS_REQUIRED,
  STEP_LENGTH
} from 'lib/constants';
import { chunkByPattern } from 'lib/helpers';
import { ChartType } from 'lib/types';
import { action, computed, observable } from 'mobx';
import Store from 'stores/main';

export default class Ui {
  @observable.ref selectedTimestamp = Infinity;
  @observable currentChart = 'hrv' as ChartType;

  constructor(private store: Store) {}

  @computed
  get calibrationProgress() {
    return this.store.calibrationTimePassed / CALIBRATION_LENGTH;
  }

  @computed
  get gatheredEnoughData() {
    return this.store.chunksCollected >= CHUNKS_REQUIRED;
  }

  @computed
  get dataGatheringProgress() {
    return (this.store.chunksCollected % CHUNKS_REQUIRED) / CHUNKS_REQUIRED;
  }

  // NOTE:
  // This will be re-evaluated on each sample (if it's currently used in active components of course).
  // This could get huge when there're a lot of samples collected.
  // So, if you really want to optimize it, use lazy-arrays and show only topmost entries in your views.
  @computed
  get stressSegments() {
    return chunkByPattern(this.store.currentSamples, s => s.state).map(g => {
      const start = g[0].timestamp - STEP_LENGTH;
      const end = g[g.length - 1].timestamp;
      const duration = end - start;
      const state = g[0].state;

      return { start, end, duration, state };
    });
  }

  @computed
  get selectedSample() {
    return (
      this.store.currentSamples.find(
        s => s.timestamp >= this.selectedTimestamp
      ) || this.store.lastSample
    );
  }

  @computed
  get selectedSegment() {
    return (
      this.stressSegments.find(s => s.end >= this.selectedTimestamp) ||
      this.lastSegment
    );
  }

  @computed
  get lastSegment() {
    return this.stressSegments[this.stressSegments.length - 1];
  }

  @action.bound
  selectTimestamp(timestamp: number) {
    this.selectedTimestamp =
      timestamp >= this.store.lastSample.timestamp ? Infinity : timestamp;
  }

  @action.bound
  selectChart(chart: ChartType) {
    this.currentChart = chart;
  }
}
