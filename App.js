/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  FlatList,
  Button,
  DeviceEventEmitter
} from 'react-native';
import { List, ListItem, Header } from "react-native-elements"
import { StackNavigator, DrawerNavigator } from 'react-navigation'
import Icon from 'react-native-vector-icons/FontAwesome'
import DeviceKit from './DeviceKit'

let HomeScreen = ({ navigation }) => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
    <Text>Home Screen</Text>
    <Button
      onPress={() => navigation.navigate('Settings')}
      title="Go to settings"
    />
  </View>
);

class SettingsScreen extends Component<{}> {
  constructor(props) {
    super(props);
    this.state = {devices: []};
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <List>
          <FlatList
            data={this.state.devices}
            keyExtractor={(i) => i.id}
            renderItem={({ item }) => {
              let title = `${item.manufacturer} ${item.modelName}`
              return <ListItem title={title} subtitle={item.address} />
            }}
          />
        </List>
      </View>
    );
  }

  componentDidMount() {
    this.deviceObserver = DeviceEventEmitter.addListener('DeviceKit:deviceFound', (d) => this.setState({ devices: [...this.state.devices, d] }))
    DeviceKit.startScan()
  }

  componentWillUnmount() {
    this.deviceObserver.remove()
    DeviceKit.stopScan()
  }
}



const RootNavigator = StackNavigator({
  Home: {
    screen: HomeScreen,
    navigationOptions: ({ navigation }) => ({
      headerTitle: 'Reactive Device Kit',
      headerRight: (<Icon.Button name="cog" style={{backgroundColor: 'white'}} color="black" onPress={() => navigation.navigate('Settings')} />)
    })
  },
  Settings: {
    screen: SettingsScreen,
    navigationOptions: {
      headerTitle: 'Settings',
    }
  },
});

export default RootNavigator;
