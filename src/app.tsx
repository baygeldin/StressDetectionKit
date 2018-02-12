import React, { Component } from 'react'
import { View, BackHandler }  from 'react-native';
import { StackNavigator, addNavigationHelpers } from 'react-navigation';
import DeviceKit from 'lib/device-kit';
import { observable, action, useStrict } from 'mobx';
import { observer, Provider } from 'mobx-react/native';

import Navigation from 'stores/navigation';
import Store from 'stores/main';
import HomeScreen from 'screens/home';
import SettingsScreen from 'screens/settings';

useStrict(true);

const RootNavigator = StackNavigator({
  Home: { screen: HomeScreen },
  Settings: { screen: SettingsScreen }
});

const store = new Store();
const navigation = new Navigation(RootNavigator.router);

@observer
class App extends Component<any, any> {
  render() {
    if (!store.initialized) return <View />;
    
    return (
      <Provider navigation={navigation} store={store}>
        <RootNavigator navigation={addNavigationHelpers(navigation)} />
      </Provider>
    );
  }

  componentDidMount() {
    DeviceKit.init('device-kit-demo-key').then(() => store.initialize());
    
    BackHandler.addEventListener('hardwareBackPress', () => {
      if (navigation.state.index === 0) {
        return false;
      } else {
        navigation.goBack();
        return true;
      }
    });
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', navigation.goBack);
  }
}

export default App;
