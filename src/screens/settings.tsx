import React, { Props } from 'react';
import { observer, inject } from 'mobx-react/native';
import {
  FlatList,
  SectionList,
  TouchableHighlight,
  Modal,
  View,
  Alert
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

@inject('store', 'ui', 'router')
@observer
export default class extends Component<{}, {}> {
  static navigationOptions = {
    title: 'Settings'
  };

  render() {
    const title = this.store.currentDevice
      ? deviceTitle(this.store.currentDevice)
      : 'Select an HRM device';

    const developer = __DEV__ ? (
      <ListItem onPress={this.router.goToDeveloperScreen}>
        <Left>
          <Icon name="code" />
        </Left>
        <Body>
          <Text>Developer Mode</Text>
        </Body>
      </ListItem>
    ) : null;

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
          <ListItem onPress={() => this.confirmDeviceRemoval()}>
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
              <Text note>{Math.round(this.store.baselineRmssd)}</Text>
            </Body>
          </ListItem>
          <ListItem>
            <Left>
              <Icon name="move" />
            </Left>
            <Body>
              <Text>Acceletometer error</Text>
              <Text note>{this.store.accelerometerError.toPrecision(4)}</Text>
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
          <ListItem onPress={() => this.confirmCalibrationReset()}>
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
          {developer}
          <ListItem onPress={() => this.showHelp()}>
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

  confirmAction(msg: string, fn: () => void) {
    Alert.alert('Are you sure?', msg, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'OK', onPress: fn }
    ]);
  }

  confirmDeviceRemoval() {
    this.confirmAction(
      'Current device will be unpaired.',
      this.store.removeDevice
    );
  }

  confirmCalibrationReset() {
    this.confirmAction(
      'Baseline values will reset.',
      this.store.resetBaselineValues
    );
  }

  showHelp() {
    Alert.alert(
      'How To Use',
      'First calibrate the baselines values: put on your HRM, put your phone down and sit still. You should do it right after you wake up to get best results. Stress will be detected relative to these baseline values.',
      [{ text: 'Got it' }]
    );
  }
}
