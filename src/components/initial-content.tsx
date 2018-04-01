import React from 'react';
import { observer } from 'mobx-react/native';
import { View, StyleSheet, Slider } from 'react-native';
import { Text, Content } from 'native-base';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
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

@observer
class InitialContent extends Component<{}, {}> {
  render() {
    /*return (
      <Content padder contentContainerStyle={{ justifyContent: 'center', flex: 1 }}>
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
          <Icon name="heart-pulse" size={80} color="black" />
        </View>
        <Text style={{ textAlign: 'center' }}>
          Hi! Press start to monitor your stress.
        </Text>
      </Content>
    );*/
    return (
      <Content>
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <View style={styles.container}>
            <Icon name="emoticon-devil" size={80} color="crimson" />
            <Text>STRESSED</Text>
          </View>
          <View style={styles.container}>
            <Text style={[styles.title, styles.highlight]}>HRV</Text>
            <Text style={[styles.value, styles.highlight]}>62</Text>
            <Text style={styles.units}>ms</Text>
          </View>
          <View style={styles.container}>
            <Text style={styles.title}>HR</Text>
            <Text style={styles.value}>84</Text>
            <Text style={styles.units}>bpm</Text>
          </View>
          <View style={[styles.container, { borderRightWidth: 0 }]}>
            <Text style={styles.title}>Activity</Text>
            <Text style={styles.value}>32</Text>
            <Text style={styles.units}>m^2/s</Text>
          </View>
        </View>
        <Chart />
        <Slider
          minimumValue={0}
          maximumValue={12000}
          step={3000}
          minimumTrackTintColor="red"
          maximumTrackTintColor="red"
          thumbTintColor="red"
          onValueChange={v => console.log(v)}
        />
      </Content>
    );
  }
}

export default InitialContent;
