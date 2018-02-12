import React, { Component } from 'react'
import { Platform, StyleSheet, Text, View, FlatList, Button, BackHandler }  from 'react-native'
import { List, ListItem, Header } from "react-native-elements"
import { StackNavigator, NavigationActions, addNavigationHelpers, NavigationRouter, NavigationNavigateAction } from 'react-navigation'
import Icon from 'react-native-vector-icons/FontAwesome'
import DeviceKit, { Device, Reading } from 'DeviceKit'
import { observable, action, useStrict, toJS } from 'mobx'
import { observer, Observer } from 'mobx-react/native'
import remotedev from 'mobx-remotedev'

useStrict(true)

@remotedev
class Store {
  @observable initialized = false
  @observable devices: Device[] = []

  @action initialize() {
    this.initialized = true
  }

  @action addDevice(device: Device) {
    if (!this.devices.find((d) => d.id == device.id)) {
      this.devices.push(device)
    }
  }
}

let initRoute = NavigationActions.navigate({ routeName: 'Home' });

@remotedev
class Navigation {
  router: NavigationRouter<any, any, any>;

  configure (router: NavigationRouter<any, any, any>) {
    this.router = router;
  }

  @observable.ref state: any;
  
  @action dispatch = (action: any) => {
    return this.state = this.router.getStateForAction(action, this.state);
  }

  @action reset() {
    this.state = this.router.getStateForAction(NavigationActions.init(), null);
  }

  goBack() {
    this.dispatch(NavigationActions.back());
  }

  goTo(route: string) {
    this.dispatch(NavigationActions.navigate({ routeName: route }));
  }

  goToSettings() {
    this.goTo('Settings');
  }
}

const store = new Store()

class HomeScreen extends Component<any, any> {
  static navigationOptions = {
    title: 'Stress Detection Kit',
    headerRight: (
      <Icon.Button name="cog" style={{backgroundColor: 'white'}} color="black"
        onPress={() => navigation.goToSettings()} />
    )
  }

  render() {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Home Screen</Text>
        <Button
          onPress={() => navigation.goToSettings()}
          title="Go to settings"
        />
      </View>
    )
  }
}

@observer
class SettingsScreen extends Component<any, any> {
  static navigationOptions = {
    title: 'Settings'
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <List>
          <FlatList
            data={toJS(store.devices)}
            keyExtractor={(i) => i.id}
            renderItem={({ item }) => {
              return <ListItem title={`${item.manufacturer} ${item.modelName}`} subtitle={item.address} />
            }}
          />
        </List>
      </View>
    )
  }

  componentDidMount() {
    DeviceKit.on('deviceFound', (d) => store.addDevice(d))
    DeviceKit.startScan()
  }

  componentWillUnmount() {
    DeviceKit.removeAllListeners('deviceFound')
    DeviceKit.stopScan()
  }
}

const SETTINGS = 'Settings'

const RootNavigator = StackNavigator({
  Home: { screen: HomeScreen },
  [SETTINGS]: { screen: SettingsScreen }
})

const navigation = new Navigation();
navigation.configure(RootNavigator.router);
navigation.reset();

@observer
class App extends Component<any, any> {
  render() {
    return store.initialized ? <RootNavigator navigation={addNavigationHelpers({ state: navigation.state, dispatch: navigation.dispatch })} /> : <View />
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
