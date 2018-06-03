import { TESTING_MODE } from 'lib/constants';
import DeviceKit from 'lib/device-kit';
import { requestPermissions } from 'lib/helpers';
import initSideEffects from 'lib/side-effects';
import { configure } from 'mobx';
import { observer, Provider } from 'mobx-react/native';
import { Component } from 'react';
import * as React from 'react';
import { Alert, BackHandler, Platform } from 'react-native';
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
    const key = process.env.MEDM_DEVICEKIT_LICENSE_KEY;
    
    if (key) {
      store.initialize(key).then(() => {
        SplashScreen.hide();

        const requests = Platform.select({
          ios: ['bluetooth'],
          android: ['location']
        });

        if ((__DEV__ || TESTING_MODE) && Platform.OS === 'android') {
          requests.push('storage');
        }

        requestPermissions(requests).catch(() => {
          Alert.alert(
            'Permissions Not Granted',
            'Requested permissions are required for the app to work properly. Please, grant them next time.',
            [{ text: 'OK' }],
            { cancelable: false }
          );
        });
      });
    } else {
      throw new Error('MEDM_DEVICEKIT_LICENSE_KEY is not provided!');
    }

    if (Platform.OS === 'android') {
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

  componentWillUnmount() {
    if (Platform.OS === 'android') {
      BackHandler.removeEventListener('hardwareBackPress', router.goBack);
    }
  }
}
