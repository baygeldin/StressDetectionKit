import React from 'react';
import { toJS } from 'mobx';
import { observer, inject } from 'mobx-react/native';
import { View } from 'react-native';
import {
  Container,
  Content,
  Text,
  List,
  ListItem,
  Body,
  Footer,
  FooterTab,
  Button
} from 'native-base';
import { Divider } from 'react-native-elements';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Component from 'lib/component';
import { Device } from 'lib/device-kit';
import { deviceTitle } from 'lib/helpers';

@inject('store')
@observer
class DevicesList extends Component<{}, {}> {
  render() {
    return (
      <Container>
        <Content padder>
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              marginVertical: 20
            }}
          >
            <Icon name="bluetooth-audio" size={60} color="black" />
            <Text style={{ textAlign: 'center', marginTop: 10 }}>
              Started scanning for devices.
            </Text>
            <Text style={{ textAlign: 'center' }}>
              Please, choose an HRM device from the list.
            </Text>
          </View>
          <Divider />
          <List
            dataArray={toJS(this.store.devices)}
            renderRow={(device: Device) => (
              <ListItem button onPress={() => this.chooseDevice(device)}>
                <Body>
                  <Text>{deviceTitle(device)}</Text>
                  <Text note>{device.modelName}</Text>
                </Body>
              </ListItem>
            )}
          />
        </Content>
        <Footer>
          <FooterTab>
            <Button full onPress={this.store.stopScan}>
              <Text>Cancel</Text>
            </Button>
          </FooterTab>
        </Footer>
      </Container>
    );
  }

  chooseDevice(device: Device) {
    this.store.setDevice(device);
    this.store.stopScan();
  }
}

export default DevicesList;
