import { observable, action, computed } from 'mobx';
import Store from 'stores/main';
import {
  CHUNKS_REQUIRED,
  WINDOW_LENGTH,
  CALIBRATION_LENGTH
} from 'lib/constants';
import { chunkByPattern } from 'lib/helpers';

export default class Ui {
  @observable timestamp: number;

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
      const start = g[0].timestamp - WINDOW_LENGTH;
      const end = g[g.length - 1].timestamp;
      const duration = end - start;
      const state = g[0].state;

      return { start, end, duration, state };
    });
  }

  @action
  updateTimestamp() {}
}
