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
    let handler = this.store.collecting
      ? () => this.stopCollection()
      : () => this.startCollection();
    let stressButtons = this.store.collecting ? (
      <View style={{ marginTop: 20 }}>
        <Button
          onPress={() => {
            this.store.addStressMark('low');
          }}
          title="Low stress"
          color="bisque"
        />
        <Button
          onPress={() => {
            this.store.addStressMark('medium');
          }}
          title="Medium stress"
          color="tomato"
        />
        <Button
          onPress={() => {
            this.store.addStressMark('high');
          }}
          title="High stress"
          color="crimson"
        />
      </View>
    ) : null;

    return (
      <View
        style={{
          flex: 1,
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Text style={{ textAlign: 'center' }}>
            Accelerometer data collected: {this.store.accelerometerData.length}
          </Text>
          <Text style={{ textAlign: 'center' }}>
            Gyroscope data collected: {this.store.gyroscopeData.length}
          </Text>
          <Text style={{ textAlign: 'center' }}>
            Readings collected: {this.store.readings.length}
          </Text>
          <Text style={{ textAlign: 'center' }}>
            Stress marks collected: {this.store.stressMarks.length}
          </Text>
          {stressButtons}
        </View>
        <View style={{ height: 50 }}>
          <Button onPress={handler} title={title} />
        </View>
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
