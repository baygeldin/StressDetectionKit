import React from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import { toJS } from 'mobx';
import { observer, inject } from 'mobx-react/native';
import { FlatList, SectionList, TouchableHighlight } from 'react-native';
import { List, ListItem } from 'react-native-elements';
import {
  Divider,
  Caption,
  Button,
  Row,
  Text,
  Subtitle,
  View,
  ListView
} from '@shoutem/ui';
import { Device } from 'lib/device-kit';
import Component from 'lib/component';

@inject('store')
@observer
export default class extends Component<{}, {}> {
  static navigationOptions = {
    title: 'Settings'
  };

  render() {
    let currentDevice = this.store.currentDevice;
    let onDeviceRemove = () => {
      this.store.removeDevice();
      this.store.restartScan();
    };

    let deviceInfo = currentDevice ? (
      <Row styleName="small">
        <View styleName="vertical">
          <Subtitle>{currentDevice.name}</Subtitle>
          <Text numberOfLines={1}>
            {`${currentDevice.modelName} by ${currentDevice.manufacturer}`}
          </Text>
        </View>
        <Button styleName="right-icon" onPress={onDeviceRemove}>
          <Icon name="remove" size={20} />
        </Button>
      </Row>
    ) : (
      <Text styleName="h-center" style={{ marginVertical: 12 }}>
        Please, choose a device from available devices.
      </Text>
    );

    let devices = toJS(this.store.devices);

    let availableDevices =
      devices.length > 0 ? (
        <ListView
          data={toJS(this.store.devices)}
          renderRow={(device: Device) => {
            return (
              <TouchableHighlight onPress={() => this.store.setDevice(device)}>
                <Row styleName="small">
                  <View styleName="vertical">
                    <Subtitle>{device.name}</Subtitle>
                    <Text numberOfLines={1}>
                      {`${device.modelName} by ${device.manufacturer}`}
                    </Text>
                  </View>
                  <Divider styleName="line" />
                </Row>
              </TouchableHighlight>
            );
          }}
        />
      ) : (
        <Text styleName="h-center" style={{ marginVertical: 12 }}>
          Scanning for devices. No devices found yet.
        </Text>
      );

    return (
      <View>
        <Divider styleName="section-header">
          <Caption>CURRENT DEVICE</Caption>
        </Divider>
        {deviceInfo}
        <Divider styleName="section-header">
          <Caption>AVAILABLE DEVICES</Caption>
        </Divider>
        {availableDevices}
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
