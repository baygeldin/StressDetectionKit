import React from 'react';
import { observer, inject } from 'mobx-react/native';
import { Text, Content } from 'native-base';
import { Circle } from 'react-native-progress';
import Component from 'lib/component';

@inject('ui')
@observer
class GatheringContent extends Component<{}, {}> {
  render() {
    return (
      <Content
        padder
        contentContainerStyle={{ justifyContent: 'center', flex: 1 }}
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
