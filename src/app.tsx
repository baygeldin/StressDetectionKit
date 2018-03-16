import React, { Component } from 'react';
import { View, BackHandler, PermissionsAndroid, Alert } from 'react-native';
import { StackNavigator, addNavigationHelpers } from 'react-navigation';
import { observable, action, configure } from 'mobx';
import { observer, Provider } from 'mobx-react/native';
import DeviceKit from 'lib/device-kit';
import Router from 'stores/router';
import Store from 'stores/main';
import HomeScreen from 'screens/home';
import SettingsScreen from 'screens/settings';

configure({ enforceActions: true });

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
    const key = process.env.MEDM_DEVICEKIT_LICENSE_KEY;

    if (key) {
      store.initialize(key);
    } else {
      throw new Error('MEDM_DEVICEKIT_LICENSE_KEY is not provided!');
    }

    PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
    ]).then(permissions => {
      if (!Object.values(permissions).every(p => p === 'granted')) {
        Alert.alert(
          'Permissions Not Granted',
          'Requested permissions are required for the app to work properly. Please, grant them next time.',
          [{ text: 'OK' }],
          { cancelable: false }
        );
      }
    });

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
