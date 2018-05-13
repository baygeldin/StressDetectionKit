import { autorun } from 'mobx';
import { Vibration } from 'react-native';
import Store from 'stores/main';
import Ui from 'stores/ui';

export default (ui: Ui, store: Store) => {
  // Vibrate when stress starts
  autorun(() => {
    console.log('sidooo');
    if (ui.gatheredEnoughData) {
      console.log('damn...');
      const [prev, current] = store.currentSamples.slice(-2);
      if (current.state && !prev.state) Vibration.vibrate(500, false);
    }
  });

  // Vibrate when calibration ends
  autorun(() => {
    if (ui.calibrationProgress === 1) Vibration.vibrate(250, false);
  });
};
