import { TESTING_MODE } from 'lib/constants';
import DeviceKit from 'lib/device-kit';
import { requestBluetooth } from 'lib/helpers';
import initSideEffects from 'lib/side-effects';
import { configure } from 'mobx';
import { observer, Provider } from 'mobx-react/native';
import { Component } from 'react';
import * as React from 'react';
import { Alert, BackHandler, PermissionsAndroid, Platform } from 'react-native';
import SplashScreen from 'react-native-splash-screen';
import { addNavigationHelpers, StackNavigator } from 'react-navigation';
import DeveloperScreen from 'screens/developer';
import HomeScreen from 'screens/home';
import SettingsScreen from 'screens/settings';
import Store from 'stores/main';
import Router from 'stores/router';
import Ui from 'stores/ui';

configure({ enforceActions: true });

const RootNavigator = StackNavigator({
  Home: { screen: HomeScreen },
  Settings: { screen: SettingsScreen },
  Developer: { screen: DeveloperScreen }
});

const sdk = new DeviceKit();
const store = new Store(sdk);
const router = new Router(RootNavigator.router);
const ui = new Ui(store);

initSideEffects(ui, store);

@observer
export default class extends Component<any, any> {
  render() {
    if (!store.initialized) return null;

    return (
      <Provider router={router} store={store} sdk={sdk} ui={ui}>
        <RootNavigator navigation={addNavigationHelpers(router)} />
      </Provider>
    );
  }

  componentDidMount() {
    this.setup()
  }

  componentWillUnmount() {
    if (Platform.OS === 'android') {
      BackHandler.removeEventListener('hardwareBackPress', router.goBack);
    }
  }

  async setup() {
    // Setup DeviceKit
    const key = process.env.MEDM_DEVICEKIT_LICENSE_KEY;

    if (key) {
      await store.initialize(key);
    } else {
      throw new Error('MEDM_DEVICEKIT_LICENSE_KEY is not provided!');
    }

    // Hide splash screen
    SplashScreen.hide();

    // Turn on bluetooth
    await requestBluetooth();

    if (Platform.OS === 'android') {
      // Setup required permissions for Android (iOS only needs bluetooth)
      const requests = [PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION];

      if (__DEV__ || TESTING_MODE) {
        requests.push(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
        );
      }

      const permissions = await PermissionsAndroid.requestMultiple(requests);

      if (!Object.values(permissions).every(p => p === 'granted')) {
        Alert.alert(
          'Permissions Not Granted',
          'Requested permissions are required for the app to work properly. Please, grant them next time.',
          [{ text: 'OK' }],
          { cancelable: false }
        );
      }

      // Setup back button for Android (not relevant for iOS)
      BackHandler.addEventListener('hardwareBackPress', () => {
        if (router.state.index === 0) {
          return false;
        } else {
          router.goBack();
          return true;
        }
      });
    }
  }
}
