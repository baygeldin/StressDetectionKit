import Component from 'lib/component';
import { inject, observer } from 'mobx-react/native';
import { Content, Text } from 'native-base';
import * as React from 'react';
import { Circle } from 'react-native-progress';

@inject('ui')
@observer
class GatheringContent extends Component<{}, {}> {
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
        <Circle
          progress={this.ui.dataGatheringProgress}
          showsText={true}
          size={80}
        />
        <Text style={{ textAlign: 'center', marginTop: 10 }}>
          Gathering initial data. Hang on!
        </Text>
      </Content>
    );
  }
}

export default GatheringContent;
