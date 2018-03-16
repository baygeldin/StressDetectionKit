import React from 'react';
import { observer } from 'mobx-react/native';
import { Text, View } from 'react-native';
import moment from 'moment';
import Component from 'lib/component';
import { StressLevels } from 'lib/types';
import { DATE_FORMAT } from 'lib/constants';
import { stressColor } from 'lib/helpers';

type Props = { level: StressLevels; startedAt: number };

@observer
class StressInfo extends Component<Props, {}> {
  render() {
    const startedAt = moment(this.props.startedAt).format(DATE_FORMAT);
    return (
      <View style={{ margin: 10 }}>
        <Text style={{ textAlign: 'center' }}>
          {'Current stress level is '}
          <Text style={{ backgroundColor: stressColor(this.props.level) }}>
            {` ${this.props.level} `}
          </Text>.
        </Text>
        <Text style={{ textAlign: 'center' }}>
          {'Stress started at '}
          <Text style={{ fontWeight: 'bold' }}>{startedAt}</Text>.
        </Text>
      </View>
    );
  }
}

export default StressInfo;
