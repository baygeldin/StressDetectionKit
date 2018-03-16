import React from 'react';
import { Text, View, Button } from 'react-native';
import { observer, inject } from 'mobx-react/native';
import Component from 'lib/component';
import {
  APP_NAME,
  DATE_FORMAT,
  NONE_STRESS_COLOR,
  LOW_STRESS_COLOR,
  MEDIUM_STRESS_COLOR,
  HIGH_STRESS_COLOR
} from 'lib/constants';
import CogButton from 'components/cog-button';
import Samples from 'components/samples';
import StressButtons from 'components/stress-buttons';
import StressInfo from 'components/stress-info';
import Stats from 'components/stats';

@inject('store')
@observer
export default class extends Component<{}, {}> {
  static navigationOptions = {
    title: APP_NAME,
    headerRight: <CogButton />
  };

  render() {
    const collecting = this.store.collecting;
    const content = collecting ? (
      <View style={{ alignItems: 'center' }}>
        <Stats
          accelerometer={this.store.accelerometerData}
          gyroscope={this.store.gyroscopeData}
          heartrate={this.store.heartrateData}
          stress={this.store.stressData}
        />
        <StressButtons changeStressLevel={this.store.changeStressLevel} />
        <StressInfo
          level={this.store.currentStressLevel}
          startedAt={this.store.stressStartedAt}
        />
      </View>
    ) : (
      <Samples data={this.store.samplesSaved} />
    );
    const button = collecting ? (
      <Button
        onPress={() => this.store.stopCollection()}
        title={'Stop Collection'}
      />
    ) : (
      <Button
        onPress={() => this.store.startCollection()}
        title={'Start Collection'}
      />
    );

    return (
      <View
        style={{
          flex: 1,
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <View style={{ flex: 1, justifyContent: 'center' }}>{content}</View>
        <View style={{ height: 50 }}>{button}</View>
      </View>
    );
  }
}
