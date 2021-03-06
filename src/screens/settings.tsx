import Calibration from 'components/calibration';
import DevicesList from 'components/devices-list';
import SettingsItem from 'components/settings-item';
import SettingsPrompt from 'components/settings-prompt';
import Component from 'lib/component';
import {
  ACCELERATION_UNITS,
  AGE_UNITS,
  HEARTRATE_UNITS,
  HRV_UNITS,
  TESTING_MODE
} from 'lib/constants';
import { confirmAction, deviceTitle, tryLaterAlert } from 'lib/helpers';
import { inject, observer } from 'mobx-react/native';
import {
  Body,
  Container,
  Content,
  Icon,
  Left,
  Separator,
  Text
} from 'native-base';
import { Props } from 'react';
import * as React from 'react';
import { Alert, Modal } from 'react-native';

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

    const developer =
      __DEV__ || TESTING_MODE ? (
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
          <SettingsPrompt />
          <Separator bordered>
            <Text>DEVICES</Text>
          </Separator>
          <SettingsItem onPress={() => this.showDeviceInfo()}>
            <Left>
              <Icon name="watch" />
            </Left>
            <Body>
              <Text>Current device</Text>
              <Text note>{title}</Text>
            </Body>
          </SettingsItem>
          <SettingsItem onPress={() => this.startScan()}>
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
          <SettingsItem onPress={() => this.ui.prompt('age')}>
            <Left>
              <Icon name="person" />
            </Left>
            <Body>
              <Text>Age</Text>
              <Text note>{`${Math.round(this.store.age)} ${AGE_UNITS}`}</Text>
            </Body>
          </SettingsItem>
          <SettingsItem onPress={() => this.ui.prompt('hrv')}>
            <Left>
              <Icon name="pulse" />
            </Left>
            <Body>
              <Text>Baseline heart rate variability</Text>
              <Text note>{`${Math.round(
                this.store.baselineHrv
              )} ${HRV_UNITS}`}</Text>
            </Body>
          </SettingsItem>
          <SettingsItem onPress={() => this.ui.prompt('heartRate')}>
            <Left>
              <Icon name="heart" />
            </Left>
            <Body>
              <Text>Baseline heart rate</Text>
              <Text note>{`${Math.round(
                this.store.baselineHeartRate
              )} ${HEARTRATE_UNITS}`}</Text>
            </Body>
          </SettingsItem>
          <SettingsItem onPress={() => this.ui.prompt('accelerometerError')}>
            <Left>
              <Icon name="move" />
            </Left>
            <Body>
              <Text>Acceletometer error</Text>
              <Text note>{`${this.store.accelerometerError.toFixed(
                5
              )} ${ACCELERATION_UNITS}`}</Text>
            </Body>
          </SettingsItem>
          <SettingsItem onPress={() => this.startCalibration()}>
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
    this.store.collecting
      ? tryLaterAlert()
      : confirmAction(
          this.store.removeCurrentDevice,
          'Current device will be unpaired.'
        );
  }

  confirmCalibrationReset() {
    this.store.collecting
      ? tryLaterAlert()
      : confirmAction(
          this.store.resetBaselineValues,
          'Baseline values will reset.'
        );
  }

  startCalibration() {
    this.store.collecting ? tryLaterAlert() : this.store.startCalibration();
  }

  startScan() {
    this.store.collecting ? tryLaterAlert() : this.store.startScan();
  }

  showHelp() {
    Alert.alert(
      'About',
      'First calibrate the baselines values. Put on your HRM, put your phone down and sit still. You should do it right after you wake up to get best results. Stress will be detected relative to these baseline values.\n\nApp icon is made by Roundicons.',
      [{ text: 'Got it' }]
    );
  }

  showDeviceInfo() {
    const device = this.store.currentDevice;

    if (device) {
      Alert.alert(deviceTitle(device), device.address, [{ text: 'Got it' }]);
    }
  }
}
