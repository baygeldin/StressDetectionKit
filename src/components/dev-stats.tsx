import Component from 'lib/component';
import { inject, observer } from 'mobx-react/native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderColor: 'black',
    borderWidth: 1,
    width: 200,
    padding: 10,
    margin: 10
  },
  right: {
    textAlign: 'right',
    fontWeight: 'bold'
  },
  left: {
    textAlign: 'left'
  }
});

@inject('store')
@observer
class DevStats extends Component<{}, {}> {
  render() {
    return (
      <View style={styles.container}>
        <View>
          <Text style={styles.left}>Accelerometer Queue</Text>
          <Text style={styles.left}>Gyroscope Queue</Text>
          <Text style={styles.left}>Pulse Queue</Text>
          <Text style={styles.left}>RR Intervals Queue</Text>
          <Text style={styles.left}>Percieved Stress</Text>
          <Text style={styles.left}>Collected Chunks</Text>
          <Text style={styles.left}>Current Samples</Text>
        </View>
        <View>
          <Text style={styles.right}>
            {this.store.accelerometerBuffer.length}
          </Text>
          <Text style={styles.right}>{this.store.gyroscopeBuffer.length}</Text>
          <Text style={styles.right}>{this.store.pulseBuffer.length}</Text>
          <Text style={styles.right}>{this.store.pulseBuffer.length}</Text>
          <Text style={styles.right}>{this.store.percievedStress.length}</Text>
          <Text style={styles.right}>{this.store.chunksCollected}</Text>
          <Text style={styles.right}>{this.store.currentSamples.length}</Text>
        </View>
      </View>
    );
  }
}

export default DevStats;
