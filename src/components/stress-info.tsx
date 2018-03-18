import React from 'react';
import { observer, inject } from 'mobx-react/native';
import { Text, View } from 'react-native';
import moment from 'moment';
import Component from 'lib/component';
import { StressLevels } from 'lib/types';
import { DATE_FORMAT } from 'lib/constants';
import { stressColor } from 'lib/helpers';

@inject('store')
@observer
class StressInfo extends Component<{}, {}> {
  render() {
    const level = this.store.currentPercievedStressLevel;

    return (
      <View style={{ margin: 10 }}>
        <Text style={{ textAlign: 'center' }}>
          {'Current stress level is '}
          <Text style={{ backgroundColor: stressColor(level) }}>
            {` ${level} `}
          </Text>.
        </Text>
        <Text style={{ textAlign: 'center' }}>
          {'Stress started at '}
          <Text style={{ fontWeight: 'bold' }}>
            {moment(this.store.percievedStressStartedAt).format(DATE_FORMAT)}
          </Text>.
        </Text>
      </View>
    );
  }
}

export default StressInfo;
