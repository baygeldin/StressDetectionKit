import React, { Component } from 'react'
import { View, BackHandler }  from 'react-native';
import { StackNavigator, addNavigationHelpers } from 'react-navigation';
import DeviceKit from 'lib/device-kit';
import { observable, action, useStrict } from 'mobx';
import { observer, Provider } from 'mobx-react/native';
import Router from 'stores/router';
import Store from 'stores/main';
import HomeScreen from 'screens/home';
import SettingsScreen from 'screens/settings';

useStrict(true);

const RootNavigator = StackNavigator({
  Home: { screen: HomeScreen },
  Settings: { screen: SettingsScreen }
});

const store = new Store();
const router = new Router(RootNavigator.router);

const sdk = new DeviceKit();

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
    sdk.register('device-kit-demo-key').then(() => store.initialize());
    
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