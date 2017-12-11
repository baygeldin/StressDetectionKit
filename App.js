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

export default class App extends Component<{}> {
  constructor(props) {
    super(props);
    this.state = {devices: []};
  }

  render() {
    return (
      <View style={styles.container}>
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
    DeviceEventEmitter.addListener('DeviceKit:deviceFound', (d) => this.setState({ devices: [...this.state.devices, d] }))
    DeviceKit.startScan()
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  }
});
