import React from 'react';
import { observer } from 'mobx-react/native';
import { Text, View } from 'react-native';
import { SensorData } from 'react-native-sensors';
import Component from 'lib/component';
import { StressLevels, StressMark, HeartrateMark } from 'lib/types';

type Props = {
  accelerometer: SensorData[];
  gyroscope: SensorData[];
  heartrate: HeartrateMark[];
  stress: StressMark[];
};

@observer
class Stats extends Component<Props, {}> {
  render() {
    return (
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          borderColor: 'black',
          borderWidth: 1,
          width: 200,
          padding: 10,
          margin: 10
        }}
      >
        <View>
          <Text style={{ textAlign: 'left' }}>Accelerometer</Text>
          <Text style={{ textAlign: 'left' }}>Gyroscope</Text>
          <Text style={{ textAlign: 'left' }}>Heartrate</Text>
          <Text style={{ textAlign: 'left' }}>Stress</Text>
        </View>
        <View>
          <Text style={{ textAlign: 'right', fontWeight: 'bold' }}>
            {this.props.accelerometer.length}
          </Text>
          <Text style={{ textAlign: 'right', fontWeight: 'bold' }}>
            {this.props.gyroscope.length}
          </Text>
          <Text style={{ textAlign: 'right', fontWeight: 'bold' }}>
            {this.props.heartrate.length}
          </Text>
          <Text style={{ textAlign: 'right', fontWeight: 'bold' }}>
            {this.props.stress.length}
          </Text>
        </View>
      </View>
    );
  }
}

export default Stats;
