import React, { Props } from 'react';
import { observer, inject } from 'mobx-react/native';
import {
  FlatList,
  SectionList,
  TouchableHighlight,
  Modal,
  View
} from 'react-native';
import {
  Container,
  Content,
  Text,
  List,
  Separator,
  Left,
  Icon,
  Body
} from 'native-base';
import { Device } from 'lib/device-kit';
import Component from 'lib/component';
import { deviceTitle } from 'lib/helpers';
import DevicesList from 'components/devices-list';
import Calibration from 'components/calibration';
import ListItem from 'components/list-item';

@inject('store', 'ui')
@observer
export default class extends Component<{}, {}> {
  static navigationOptions = {
    title: 'Settings'
  };

  render() {
    const title = this.store.currentDevice
      ? deviceTitle(this.store.currentDevice)
      : 'Select an HRM device';

    return (
      <Container>
        <Content>
          <Modal
            animationType="slide"
            transparent={false}
            visible={this.store.scanning}
            onRequestClose={this.store.stopScan}
          >
            <DevicesList />
          </Modal>
          <Modal
            animationType="slide"
            transparent={false}
            visible={this.store.calibrating}
            onRequestClose={this.store.stopCalibration}
          >
            <Calibration />
          </Modal>
          <Separator bordered>
            <Text>DEVICES</Text>
          </Separator>
          <ListItem>
            <Left>
              <Icon name="watch" />
            </Left>
            <Body>
              <Text>Current device</Text>
              <Text note>{title}</Text>
            </Body>
          </ListItem>
          <ListItem onPress={this.store.startScan}>
            <Left>
              <Icon name="bluetooth" />
            </Left>
            <Body>
              <Text>Select a device</Text>
              <Text note>Choose from available devices</Text>
            </Body>
          </ListItem>
          <ListItem onPress={this.store.removeDevice}>
            <Left>
              <Icon name="trash" />
            </Left>
            <Body>
              <Text>Remove the device</Text>
              <Text note>Unpair the current device</Text>
            </Body>
          </ListItem>
          <Separator bordered>
            <Text>CALIBRATION</Text>
          </Separator>
          <ListItem>
            <Left>
              <Icon name="pulse" />
            </Left>
            <Body>
              <Text>Baseline HRV</Text>
              <Text note>{this.store.baselineHrv}</Text>
            </Body>
          </ListItem>
          <ListItem>
            <Left>
              <Icon name="move" />
            </Left>
            <Body>
              <Text>Acceletometer error</Text>
              <Text note>{this.store.accelerometerError}</Text>
            </Body>
          </ListItem>
          <ListItem onPress={this.store.startCalibration}>
            <Left>
              <Icon name="options" />
            </Left>
            <Body>
              <Text>Calibrate</Text>
              <Text note>Identify baseline values</Text>
            </Body>
          </ListItem>
          <ListItem>
            <Left>
              <Icon name="trash" />
            </Left>
            <Body>
              <Text>Reset</Text>
              <Text note>Reset to default settings</Text>
            </Body>
          </ListItem>
          <Separator bordered>
            <Text>MISCELLANEOUS</Text>
          </Separator>
          <ListItem>
            <Left>
              <Icon name="information-circle" />
            </Left>
            <Body>
              <Text>How To Use</Text>
            </Body>
          </ListItem>
        </Content>
      </Container>
    );
  }
}
