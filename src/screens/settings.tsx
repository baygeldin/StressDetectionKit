import React from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import { toJS } from 'mobx';
import { observer, inject } from 'mobx-react/native';
import { View, FlatList }  from 'react-native';
import { List, ListItem } from 'react-native-elements';
import Component from 'lib/component';

@inject('store', 'sdk')
@observer
export default class extends Component<{}, {}> {
  static navigationOptions = {
    title: 'Settings'
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <List>
          <FlatList
            data={toJS(this.store.devices)}
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
    this.sdk.on('deviceFound', (d) => this.store.addDevice(d));
    this.sdk.startScan();
  }

  componentWillUnmount() {
    this.sdk.removeAllListeners('deviceFound');
    this.sdk.stopScan();
  }
}