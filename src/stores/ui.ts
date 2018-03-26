import { observable, action, computed } from 'mobx';
import Store from 'stores/main';
import { CHUNKS_REQUIRED } from 'lib/constants';

export default class Ui {
  constructor(private store: Store) {}

  // An opimization to unsubscribe @computed once the gathering is done
  private dataGatheringCompleted = false;

  @computed
  get gatheredEnoughData() {
    if (this.dataGatheringCompleted) return true;
    return this.store.chunksCollected >= CHUNKS_REQUIRED;
  }

  @computed
  get dataGatheringProgress() {
    if (this.dataGatheringCompleted) return 1;
    return (this.store.chunksCollected % CHUNKS_REQUIRED) / CHUNKS_REQUIRED;
  }

  @computed
  get stressSegments() {
    // split samples by stress state, assign start and end
    // then if the topmost segment is bad, show STRESSED, if not show OK
    // also show duration.
    return null;
  }
}
