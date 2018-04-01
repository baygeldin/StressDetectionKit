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
import { deviceTitle, confirmAction } from 'lib/helpers';
import DevicesList from 'components/devices-list';
import Calibration from 'components/calibration';
import SettingsItem from 'components/settings-item';

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
      <SettingsItem onPress={this.router.goToDeveloperScreen}>
        <Left>
          <Icon name="code" />
        </Left>
        <Body>
          <Text>Developer Mode</Text>
        </Body>
      </SettingsItem>
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
          <SettingsItem>
            <Left>
              <Icon name="watch" />
            </Left>
            <Body>
              <Text>Current device</Text>
              <Text note>{title}</Text>
            </Body>
          </SettingsItem>
          <SettingsItem onPress={this.store.startScan}>
            <Left>
              <Icon name="bluetooth" />
            </Left>
            <Body>
              <Text>Select a device</Text>
              <Text note>Choose from available devices</Text>
            </Body>
          </SettingsItem>
          <SettingsItem onPress={() => this.confirmDeviceRemoval()}>
            <Left>
              <Icon name="trash" />
            </Left>
            <Body>
              <Text>Remove the device</Text>
              <Text note>Unpair the current device</Text>
            </Body>
          </SettingsItem>
          <Separator bordered>
            <Text>CALIBRATION</Text>
          </Separator>
          <SettingsItem>
            <Left>
              <Icon name="pulse" />
            </Left>
            <Body>
              <Text>Baseline HRV</Text>
              <Text note>{Math.round(this.store.baselineRmssd)}</Text>
            </Body>
          </SettingsItem>
          <SettingsItem>
            <Left>
              <Icon name="move" />
            </Left>
            <Body>
              <Text>Acceletometer error</Text>
              <Text note>{this.store.accelerometerError.toPrecision(4)}</Text>
            </Body>
          </SettingsItem>
          <SettingsItem onPress={this.store.startCalibration}>
            <Left>
              <Icon name="options" />
            </Left>
            <Body>
              <Text>Calibrate</Text>
              <Text note>Identify baseline values</Text>
            </Body>
          </SettingsItem>
          <SettingsItem onPress={() => this.confirmCalibrationReset()}>
            <Left>
              <Icon name="trash" />
            </Left>
            <Body>
              <Text>Reset</Text>
              <Text note>Reset to default settings</Text>
            </Body>
          </SettingsItem>
          <Separator bordered>
            <Text>MISCELLANEOUS</Text>
          </Separator>
          {developer}
          <SettingsItem onPress={() => this.showHelp()}>
            <Left>
              <Icon name="information-circle" />
            </Left>
            <Body>
              <Text>About</Text>
            </Body>
          </SettingsItem>
        </Content>
      </Container>
    );
  }

  confirmDeviceRemoval() {
    confirmAction(this.store.removeDevice, 'Current device will be unpaired.');
  }

  confirmCalibrationReset() {
    confirmAction(
      this.store.resetBaselineValues,
      'Baseline values will reset.'
    );
  }

  showHelp() {
    Alert.alert(
      'About',
      'First calibrate the baselines values. Put on your HRM, put your phone down and sit still. You should do it right after you wake up to get best results. Stress will be detected relative to these baseline values.\n\nApp icon is made by Roundicons.',
      [{ text: 'Got it' }]
    );
  }
}
