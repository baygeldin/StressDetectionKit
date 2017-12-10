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
  DeviceEventEmitter
} from 'react-native';
import { List, ListItem } from "react-native-elements"
import DeviceKit from './DeviceKit'

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' +
    'Cmd+D or shake for dev menu',
  android: 'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});

export default class App extends Component<{}> {
  constructor(props) {
    super(props);
    this.state = {devices: []};
  }

  render() {
    let devices = this.state.devices.map((d) => Object.assign({ key: d.id }, d))

    console.log(devices)
    return (
      <View style={styles.container}>
        <List>
          <FlatList data={devices} renderItem={(i) => <ListItem title={i.name} /> } />
        </List>
      </View>
    );
  }

  componentDidMount() {
    DeviceEventEmitter.addListener('DeviceKit:deviceFound', (d) => this.setState({ devices: [...this.state.devices, d] }))
    DeviceKit.startScan()
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
