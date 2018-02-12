import React, { Component } from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import { toJS } from 'mobx';
import { observer, inject } from 'mobx-react/native';
import { View, FlatList }  from 'react-native';
import { List, ListItem } from 'react-native-elements';
import DeviceKit from 'lib/device-kit';

@inject('store')
@observer
export default class extends Component<any, any> {
  static navigationOptions = {
    title: 'Settings'
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <List>
          <FlatList
            data={toJS(this.props.store.devices)}
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
    DeviceKit.on('deviceFound', (d) => this.props.store.addDevice(d))
    DeviceKit.startScan()
  }

  componentWillUnmount() {
    DeviceKit.removeAllListeners('deviceFound')
    DeviceKit.stopScan()
  }
}