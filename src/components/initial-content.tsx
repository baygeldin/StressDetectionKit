import React from 'react';
import { observer } from 'mobx-react/native';
import { View } from 'react-native';
import { Text, Content } from 'native-base';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Component from 'lib/component';

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
