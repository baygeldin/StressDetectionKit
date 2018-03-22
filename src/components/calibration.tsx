import React from 'react';
import { observer, inject } from 'mobx-react/native';
import { View } from 'react-native';
import {
  Container,
  Content,
  Text,
  Body,
  Footer,
  FooterTab,
  Button,
  Icon
} from 'native-base';
import { Divider } from 'react-native-elements';
import { Bar, Circle } from 'react-native-progress';
import Component from 'lib/component';
import { Device } from 'lib/device-kit';

@inject('store')
@observer
class Calibration extends Component<{}, {}> {
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
            <Icon name="options" style={{ fontSize: 60, color: 'black' }} />
            <Text style={{ textAlign: 'center', marginTop: 10 }}>
              Put your phone down, relax and wait for calibration to finish.
            </Text>
          </View>
          <Divider style={{ marginBottom: 15 }} />
          <Bar progress={0.3} width={null} borderColor="lightgrey" />
          <Text style={{ textAlign: 'center', marginTop: 10 }}>
            Remaining time: ...eeeh.
          </Text>
        </Content>
        <Footer>
          <FooterTab>
            <Button full onPress={this.store.stopCalibration}>
              <Text>Cancel</Text>
            </Button>
          </FooterTab>
        </Footer>
      </Container>
    );
  }
}

export default Calibration;
