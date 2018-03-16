import React from 'react';
import { observer } from 'mobx-react/native';
import { Button, View } from 'react-native';
import Component from 'lib/component';
import {
  NONE_STRESS_COLOR,
  LOW_STRESS_COLOR,
  MEDIUM_STRESS_COLOR,
  HIGH_STRESS_COLOR
} from 'lib/constants';
import { StressLevels } from 'lib/types';

type Props = { changeStressLevel: (level: StressLevels) => void };

@observer
class StressButtons extends Component<Props, {}> {
  render() {
    return (
      <View style={{ margin: 10, width: 200 }}>
        <Button
          onPress={() => {
            this.props.changeStressLevel('none');
          }}
          title="No stress"
          color={NONE_STRESS_COLOR}
        />
        <Button
          onPress={() => {
            this.props.changeStressLevel('low');
          }}
          title="Low stress"
          color={LOW_STRESS_COLOR}
        />
        <Button
          onPress={() => {
            this.props.changeStressLevel('medium');
          }}
          title="Medium stress"
          color={MEDIUM_STRESS_COLOR}
        />
        <Button
          onPress={() => {
            this.props.changeStressLevel('high');
          }}
          title="High stress"
          color={HIGH_STRESS_COLOR}
        />
      </View>
    );
  }
}

export default StressButtons;
