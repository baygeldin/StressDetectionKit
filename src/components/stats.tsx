import React from 'react';
import { observer, inject } from 'mobx-react/native';
import { Text, View } from 'react-native';
import { SensorData } from 'react-native-sensors';
import Component from 'lib/component';

@inject('store')
@observer
class Stats extends Component<{}, {}> {
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
          <Text style={{ textAlign: 'left' }}>Accelerometer Queue</Text>
          <Text style={{ textAlign: 'left' }}>Gyroscope Queue</Text>
          <Text style={{ textAlign: 'left' }}>Pulse Queue</Text>
          <Text style={{ textAlign: 'left' }}>RR Intervals Queue</Text>
          <Text style={{ textAlign: 'left' }}>Percieved Stress</Text>
          <Text style={{ textAlign: 'left' }}>Collected Chunks</Text>
          <Text style={{ textAlign: 'left' }}>Current Samples</Text>
        </View>
        <View>
          <Text style={{ textAlign: 'right', fontWeight: 'bold' }}>
            {this.store.accelerometerBuffer.length}
          </Text>
          <Text style={{ textAlign: 'right', fontWeight: 'bold' }}>
            {this.store.gyroscopeBuffer.length}
          </Text>
          <Text style={{ textAlign: 'right', fontWeight: 'bold' }}>
            {this.store.pulseBuffer.length}
          </Text>
          <Text style={{ textAlign: 'right', fontWeight: 'bold' }}>
            {this.store.pulseBuffer.length}
          </Text>
          <Text style={{ textAlign: 'right', fontWeight: 'bold' }}>
            {this.store.percievedStress.length}
          </Text>
          <Text style={{ textAlign: 'right', fontWeight: 'bold' }}>
            {this.store.chunksCollected}
          </Text>
          <Text style={{ textAlign: 'right', fontWeight: 'bold' }}>
            {this.store.currentSamples.length}
          </Text>
        </View>
      </View>
    );
  }
}

export default Stats;
