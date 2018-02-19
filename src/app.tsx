import React, { Component } from 'react';
import { View, BackHandler } from 'react-native';
import { StackNavigator, addNavigationHelpers } from 'react-navigation';
import { observable, action, useStrict } from 'mobx';
import { observer, Provider } from 'mobx-react/native';
import DeviceKit from 'lib/device-kit';
import Router from 'stores/router';
import Store from 'stores/main';
import HomeScreen from 'screens/home';
import SettingsScreen from 'screens/settings';

useStrict(true);

const RootNavigator = StackNavigator({
  Home: { screen: HomeScreen },
  Settings: { screen: SettingsScreen }
});

const sdk = new DeviceKit();
const store = new Store(sdk);
const router = new Router(RootNavigator.router);

@observer
export default class extends Component<any, any> {
  render() {
    if (!store.initialized) return <View />;

    return (
      <Provider router={router} store={store} sdk={sdk}>
        <RootNavigator navigation={addNavigationHelpers(router)} />
      </Provider>
    );
  }

  componentDidMount() {
    store.initialize('device-kit-demo-key');

    BackHandler.addEventListener('hardwareBackPress', () => {
      if (router.state.index === 0) {
        return false;
      } else {
        router.goBack();
        return true;
      }
    });
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', router.goBack);
  }
}
