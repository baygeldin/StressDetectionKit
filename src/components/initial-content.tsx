import React from 'react';
import { observer } from 'mobx-react/native';
import { View, Dimensions } from 'react-native';
import { Text } from 'native-base';
import Component from 'lib/component';

@observer
class InitialContent extends Component<{}, {}> {
  render() {
    return (
      <View>
        <Text style={{ textAlign: 'center', marginTop: 10 }}>
          Start collection first.
        </Text>
      </View>
    );
  }
}

export default InitialContent;
