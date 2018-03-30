import React from 'react';
import { observer, inject } from 'mobx-react/native';
import { Text, Content } from 'native-base';
import { Bar } from 'react-native-progress';
import Component from 'lib/component';

@inject('ui')
@observer
class GatheringContent extends Component<{}, {}> {
  render() {
    return (
      <Content contentContainerStyle={{ justifyContent: 'center', flex: 1 }}>
        <Text style={{ textAlign: 'center', marginTop: 10 }}>
          Gathering data.
        </Text>
        <Bar
          progress={this.ui.dataGatheringProgress}
          useNativeDriver={true}
          width={null}
          borderColor="lightgrey"
        />
      </Content>
    );
  }
}

export default GatheringContent;
