import React from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Text, View, Button } from 'react-native';
import { observer, inject } from 'mobx-react/native';
import Component from 'lib/component';

@inject('router')
class CogButton extends Component<{}, {}> {
  render() {
    return (
      <Icon.Button
        name="cog"
        style={{ backgroundColor: 'white' }}
        color="black"
        onPress={() => this.router.goToSettings()}
      />
    );
  }
}

@inject('router', 'store')
@observer
export default class extends Component<{}, {}> {
  static navigationOptions = {
    title: 'Stress Detection Kit',
    headerRight: <CogButton />
  };

  render() {
    let title = this.store.collecting ? 'Stop Collection' : 'Start Collection';
    let cb = () => {
      this.store.collecting ? this.stopCollection() : this.startCollection();
    };

    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>
          Accelerometer data collected: {this.store.accelerometerData.length}
        </Text>
        <Text>Gyroscope data collected: {this.store.gyroscopeData.length}</Text>
        <Text>Readings collected: {this.store.readings.length}</Text>
        <Button onPress={cb} title={title} />
      </View>
    );
  }

  startCollection() {
    this.store.startCollection();
  }

  stopCollection() {
    this.store.stopCollection();
  }
}
