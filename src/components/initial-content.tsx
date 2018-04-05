import Component from 'lib/component';
import { observer } from 'mobx-react/native';
import { Content, Text } from 'native-base';
import React from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

@observer
class InitialContent extends Component<{}, {}> {
  render() {
    return (
      <Content
        padder
        contentContainerStyle={{
          justifyContent: 'center',
          alignItems: 'center',
          flex: 1
        }}
      >
        <Icon name="heart-pulse" size={80} color="black" />
        <Text style={{ textAlign: 'center' }}>
          Hi! Press start to monitor your stress.
        </Text>
      </Content>
    );
  }
}

export default InitialContent;
