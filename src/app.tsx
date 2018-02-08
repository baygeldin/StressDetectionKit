import React, { Component } from 'react'
import { Platform, StyleSheet, Text, View, FlatList, Button, BackHandler }  from 'react-native'
import { List, ListItem, Header } from "react-native-elements"
import { StackNavigator, NavigationActions, addNavigationHelpers, NavigationRouter } from 'react-navigation'
import Icon from 'react-native-vector-icons/FontAwesome'
import DeviceKit, { Device, Reading } from './device_kit'
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

let initRoute = NavigationActions.navigate({ routeName: 'Home' })

@remotedev
class Navigation {
  constructor(public router: NavigationRouter<any, any, any>) {}

  @observable.ref state = this.router.getStateForAction(initRoute, null);
  
  @action dispatch = (action: any) => {
    return this.state = this.router.getStateForAction(action, this.state);
  }

  reset() {
    this.dispatch(NavigationActions.reset({ index: 0, actions: [initRoute] }));
  }

  goBack() {
    this.dispatch(NavigationActions.back());
  }

  goTo(route: string) {
    this.dispatch(NavigationActions.navigate({ routeName: route }));
  }
}

const store = new Store()

let HomeScreen = () => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
    <Text>Home Screen</Text>
    <Button
      onPress={() => navigation.goTo('Settings')}
      title="Go to settings"
    />
  </View>
)

@observer
class SettingsScreen extends Component<any, any> {
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

const RootNavigator = StackNavigator({
  Home: {
    screen: HomeScreen,
    navigationOptions: () => ({
      headerTitle: 'Reactive Device Kit',
      headerRight: (
        <Icon.Button name="cog" style={{backgroundColor: 'white'}} color="black"
          onPress={() => navigation.goTo('Settings')} />
      )
    })
  },
  Settings: {
    screen: SettingsScreen,
    navigationOptions: {
      headerTitle: 'Settings',
    }
  }
})

const navigation = new Navigation(RootNavigator.router)

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

export default App
