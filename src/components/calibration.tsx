import Component from 'lib/component';
import { LIGHT } from 'lib/constants';
import { inject, observer } from 'mobx-react/native';
import moment from 'moment';
import {
  Button,
  Container,
  Content,
  Footer,
  FooterTab,
  Icon,
  Text
} from 'native-base';
import * as React from 'react';
import { View } from 'react-native';
import { Divider } from 'react-native-elements';
import { Bar } from 'react-native-progress';

@inject('store', 'ui')
@observer
class Calibration extends Component<{}, {}> {
  render() {
    const timeRemaining = moment
      .duration(this.store.calibrationTimeRemaining)
      .humanize();

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
              Put your phone down, relax and wait for the calibration to finish.
            </Text>
          </View>
          <Divider style={{ marginBottom: 15 }} />
          <Bar
            progress={this.ui.calibrationProgress}
            useNativeDriver={true}
            width={null}
            borderColor={LIGHT}
          />
          <Text style={{ textAlign: 'center', marginTop: 10 }}>
            The calibration will finish in {timeRemaining}.
          </Text>
        </Content>
        <Footer>
          <FooterTab>
            <Button full onPress={this.store.stopCalibration}>
              <Text>CANCEL</Text>
            </Button>
          </FooterTab>
        </Footer>
      </Container>
    );
  }
}

export default Calibration;
