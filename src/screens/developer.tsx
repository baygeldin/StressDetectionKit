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
import StressButtons from 'components/stress-buttons';
import StressInfo from 'components/stress-info';
import Stats from 'components/stats';
import CollectionButton from 'components/collection-button';

@inject('store')
@observer
export default class extends Component<{}, {}> {
  static navigationOptions = {
    title: 'Developer'
  };

  render() {
    const collecting = this.store.collecting;
    const content = collecting ? (
      <View style={{ alignItems: 'center' }}>
        <Stats />
        <StressButtons />
        <StressInfo />
      </View>
    ) : (
      <Text>Start data collection first.</Text>
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
        <View style={{ height: 50 }}>
          <CollectionButton />
        </View>
      </View>
    );
  }
}
