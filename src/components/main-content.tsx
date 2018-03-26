import React from 'react';
import { observer, inject } from 'mobx-react/native';
import { View } from 'react-native';
import { Text } from 'native-base';
import Component from 'lib/component';

@inject('store')
@observer
class MainContent extends Component<{}, {}> {
  render() {
    return (
      <Text style={{ textAlign: 'center', marginTop: 10 }}>
        Here should be samples.
      </Text>
    );
  }
}

export default MainContent;
