import React, { Props } from 'react';
import { toJS } from 'mobx';
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
  Header,
  Content,
  Text,
  List,
  ListItem,
  Separator,
  Left,
  Icon,
  Body,
  Card,
  CardItem
} from 'native-base';
import { Device } from 'lib/device-kit';
import Component from 'lib/component';

class SettingsListItem extends Component<{ onPress?: () => void }, {}> {
  render() {
    return (
      <ListItem
        icon
        style={{ marginVertical: 10 }}
        onPress={this.props.onPress}
      >
        {this.props.children}
      </ListItem>
    );
  }
}

@inject('store')
@observer
export default class extends Component<{}, {}> {
  static navigationOptions = {
    title: 'Settings'
  };

  render() {
    const currentDevice = this.store.currentDevice;
    const onDeviceRemove = () => {
      this.store.removeDevice();
      this.store.restartScan();
    };

    // const deviceInfo = currentDevice ? (
    //   <Row styleName="small">
    //     <View styleName="vertical">
    //       <Subtitle>{currentDevice.name}</Subtitle>
    //       <Text numberOfLines={1}>
    //         {`${currentDevice.modelName} by ${currentDevice.manufacturer}`}
    //       </Text>
    //     </View>
    //     <Button styleName="right-icon" onPress={onDeviceRemove}>
    //       <Icon name="remove" size={20} />
    //     </Button>
    //   </Row>
    // ) : (
    //   <Text styleName="h-center" style={{ marginVertical: 12 }}>
    //     Please, choose a device from available devices.
    //   </Text>
    // );

    // const devices = toJS(this.store.devices);

    // const availableDevices =
    //   devices.length > 0 ? (
    //     <ListView
    //       data={toJS(this.store.devices)}
    //       renderRow={(device: Device) => {
    //         return (
    //           <TouchableHighlight onPress={() => this.store.setDevice(device)}>
    //             <Row styleName="small">
    //               <View styleName="vertical">
    //                 <Subtitle>{device.name}</Subtitle>
    //                 <Text numberOfLines={1}>
    //                   {`${device.modelName} by ${device.manufacturer}`}
    //                 </Text>
    //               </View>
    //               <Divider styleName="line" />
    //             </Row>
    //           </TouchableHighlight>
    //         );
    //       }}
    //     />
    //   ) : (
    //     <Text styleName="h-center" style={{ marginVertical: 12 }}>
    //       Scanning for devices. No devices found yet.
    //     </Text>
    //   );
    // <View>
    //   <Divider styleName="section-header">
    //     <Caption>CURRENT DEVICE</Caption>
    //   </Divider>
    //   {deviceInfo}
    //   <Divider styleName="section-header">
    //     <Caption>AVAILABLE DEVICES</Caption>
    //   </Divider>
    //   {availableDevices}
    // </View>
    const kek = this.store.currentDevice
      ? this.store.currentDevice.modelName
      : 'kek';

    return (
      <Container>
        <Content>
          <Modal
            animationType="slide"
            transparent={false}
            visible={this.state.modalVisible}
            onRequestClose={() => {
              alert('Modal has been closed.');
            }}
          >
            <View style={{ marginTop: 22 }}>
              <View>
                <Text>Hello World!</Text>

                <TouchableHighlight
                  onPress={() => {
                    this.setModalVisible(!this.state.modalVisible);
                  }}
                >
                  <Text>Hide Modal</Text>
                </TouchableHighlight>
              </View>
            </View>
          </Modal>
          <Separator bordered>
            <Text>DEVICES</Text>
          </Separator>
          <SettingsListItem
            onPress={() => {
              this.setModalVisible(true);
            }}
          >
            <Left>
              <Icon name="watch" />
            </Left>
            <Body>
              <Text>Current Device</Text>
              <Text note>{kek}</Text>
            </Body>
          </SettingsListItem>
          <SettingsListItem>
            <Left>
              <Icon name="pulse" />
            </Left>
            <Body>
              <Text>Calibration</Text>
              <Text note>Baseline HRV is 80. Acceletometer error is 10.</Text>
            </Body>
          </SettingsListItem>
          <Separator bordered>
            <Text>MISCELLANEOUS</Text>
          </Separator>
          <SettingsListItem>
            <Left>
              <Icon name="information-circle" />
            </Left>
            <Body>
              <Text>How To Use</Text>
            </Body>
          </SettingsListItem>
        </Content>
      </Container>
    );
  }

  state = {
    modalVisible: false
  };

  setModalVisible(visible: boolean) {
    this.setState({ modalVisible: visible });
  }

  componentDidMount() {
    this.store.startScan();
  }

  componentWillUnmount() {
    this.store.stopScan();
  }
}
