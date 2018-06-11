import Component from 'lib/component';
import {
  HIGH_STRESS_COLOR,
  LOW_STRESS_COLOR,
  MEDIUM_STRESS_COLOR,
  NONE_STRESS_COLOR
} from 'lib/constants';
import { inject, observer } from 'mobx-react/native';
import * as React from 'react';
import { Button, View } from 'react-native';

@inject('store')
@observer
class StressButtons extends Component<{}, {}> {
  render() {
    return (
      <View style={{ margin: 10, width: 200 }}>
        <Button
          onPress={() => {
            this.store.changeStressLevel('none');
          }}
          title="No stress"
          color={NONE_STRESS_COLOR}
        />
        <Button
          onPress={() => {
            this.store.changeStressLevel('low');
          }}
          title="Low stress"
          color={LOW_STRESS_COLOR}
        />
        <Button
          onPress={() => {
            this.store.changeStressLevel('medium');
          }}
          title="Medium stress"
          color={MEDIUM_STRESS_COLOR}
        />
        <Button
          onPress={() => {
            this.store.changeStressLevel('high');
          }}
          title="High stress"
          color={HIGH_STRESS_COLOR}
        />
      </View>
    );
  }
}

export default StressButtons;
