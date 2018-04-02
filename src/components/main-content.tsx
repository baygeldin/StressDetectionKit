import React from 'react';
import { observer, inject } from 'mobx-react/native';
import { View, StyleSheet } from 'react-native';
import { Text, Content } from 'native-base';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Slider } from 'react-native-elements';
import { STEP_LENGTH } from 'lib/constants';
import Component from 'lib/component';
import Chart from 'components/chart';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderColor: 'grey'
  },
  title: {
    fontSize: 25,
    textAlign: 'center',
    color: 'grey'
  },
  value: {
    fontSize: 40,
    textAlign: 'center',
    color: 'black'
  },
  units: {
    fontSize: 12,
    textAlign: 'center',
    color: 'grey'
  },
  highlight: {
    color: 'crimson'
  }
});

@inject('store', 'ui')
@observer
class MainContent extends Component<{}, {}> {
  render() {
    const first = this.store.currentSamples[0];
    const last = this.store.lastSample;

    return (
      <Content>
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <View style={styles.container}>
            <Icon name="emoticon-devil" size={80} color="crimson" />
            <Text>STRESSED</Text>
          </View>
          <View style={styles.container}>
            <Text style={[styles.title, styles.highlight]}>HRV</Text>
            <Text style={[styles.value, styles.highlight]}>{last.rmssd}</Text>
            <Text style={styles.units}>ms</Text>
          </View>
          <View style={styles.container}>
            <Text style={styles.title}>HR</Text>
            <Text style={styles.value}>{last.heartrate}</Text>
            <Text style={styles.units}>bpm</Text>
          </View>
          <View style={[styles.container, { borderRightWidth: 0 }]}>
            <Text style={styles.title}>Activity</Text>
            <Text style={styles.value}>{last.activityIndex}</Text>
            <Text style={styles.units}>m^2/s</Text>
          </View>
        </View>
        <Chart />
        <Slider
          minimumValue={first.timestamp}
          maximumValue={last.timestamp}
          step={STEP_LENGTH}
          value={this.ui.selectedSample.timestamp}
          minimumTrackTintColor="red"
          maximumTrackTintColor="red"
          thumbTintColor="red"
          onValueChange={v => this.ui.selectSample(v)}
        />
      </Content>
    );
  }
}

export default MainContent;
