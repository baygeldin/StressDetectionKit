import React from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import { toJS } from 'mobx';
import { observer, inject } from 'mobx-react/native';
import { View, FlatList } from 'react-native';
import { List, ListItem, Divider, Text } from 'react-native-elements';
import { Device } from 'lib/device-kit';
import Component from 'lib/component';

@inject('store')
@observer
export default class extends Component<{}, {}> {
  static navigationOptions = {
    title: 'Settings'
  };

  render() {
    let deviceInfo = this.store.currentDevice ? (
      <Text>{JSON.stringify(toJS(this.store.currentDevice))}</Text>
    ) : (
      <Text>Choose a device, pal.</Text>
    );

    return (
      <View style={{ flex: 1 }}>
        {deviceInfo}
        <Divider style={{ backgroundColor: 'black' }} />
        <Text h4 style={{ color: 'black' }}>
          Available devices
        </Text>
        <List>
          <FlatList
            data={toJS(this.store.devices)}
            keyExtractor={i => i.id}
            renderItem={({ item }) => {
              return (
                <ListItem
                  title={`${item.manufacturer} ${item.modelName}`}
                  subtitle={item.address}
                  hideChevron={true}
                  underlayColor={'skyblue'}
                  onPress={() => this.store.setDevice(item)}
                />
              );
            }}
          />
        </List>
      </View>
    );
  }

  componentDidMount() {
    this.store.startScan();
  }

  componentWillUnmount() {
    this.store.stopScan();
  }
}
