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
import CollectionButton from 'components/collection-button';

@inject('store', 'router')
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
        <Text>{JSON.stringify(this.store.lastSample)}</Text>
      </View>
    ) : (
      <Text>Hello! Start collection first!</Text>
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
        <View style={{ height: 50 }}>
          <CollectionButton />
          <Button
            onPress={() => this.router.goToDeveloperScreen()}
            title="lalala"
          />
        </View>
        <View style={{ flex: 1, justifyContent: 'center' }}>{content}</View>
      </View>
    );
  }
}
