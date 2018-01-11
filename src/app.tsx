import React, { Component } from 'react'
import { Platform, StyleSheet, Text, View, FlatList, Button }  from 'react-native'
import { List, ListItem, Header } from "react-native-elements"
import { StackNavigator, DrawerNavigator, NavigationRouteConfigMap, NavigationRouteConfig, NavigationScreenConfig } from 'react-navigation'
import Icon from 'react-native-vector-icons/FontAwesome'
import DeviceKit, { Device, Reading } from './device_kit'
import { observable, action, useStrict } from 'mobx'
import { observer } from 'mobx-react/native'

useStrict(true)

class Store {
  @observable initialized = false
  @observable devices: Device[] = []

  @action initialize() {
    this.initialized = true
  }

  @action addDevice(d: Device) {
    if (!this.devices.find((_d) => _d.id == d.id)) {
      this.devices.push(d)
    }
  }
}

const store = new Store()

let HomeScreen = ({ navigation }: { navigation: any }) => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
    <Text>Home Screen</Text>
    <Button
      onPress={() => navigation.navigate('Settings')}
      title="Go to settings"
    />
  </View>
)

@observer
class SettingsScreen extends Component<any, any> {
  render() {
    console.log('DAMN: yup')
    return (
      <View style={{ flex: 1 }}>
        <List>
          <FlatList
            data={store.devices}
            keyExtractor={(i) => i.id}
            renderItem={({ item }) => {
              let title = `${item.manufacturer} ${item.modelName}`
              return <ListItem title={title} subtitle={item.address} />
            }}
          />
        </List>
      </View>
    )
  }

  componentDidMount() {
    DeviceKit.on('deviceFound', (d) => {
      store.addDevice(d)
      this.forceUpdate() // WTF, WHY IT DOESN'T UPDATE AUTOMATICALLY, WHERE IS MY MAGIC?!
    })
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
    navigationOptions: ({ navigation }: { navigation: any }) => ({
      headerTitle: 'Reactive Device Kit',
      headerRight: (<Icon.Button name="cog" style={{backgroundColor: 'white'}} color="black" onPress={() => navigation.navigate('Settings')} />)
    })
  },
  Settings: {
    screen: SettingsScreen,
    navigationOptions: {
      headerTitle: 'Settings',
    }
  }
})

@observer
class App extends Component<any, any> {
  render() {
    return store.initialized ? <RootNavigator /> : <Text>Wait...</Text>
  }

  componentDidMount() {
    DeviceKit.init('device-kit-demo-key').then(() => store.initialize())
  }
}

export default App
