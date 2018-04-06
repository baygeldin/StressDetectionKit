import Chart from 'components/chart';
import MainStats from 'components/main-stats';
import Stats from 'components/stats-list';
import Component from 'lib/component';
import { observer } from 'mobx-react/native';
import { Content } from 'native-base';
import React from 'react';

@observer
class MainContent extends Component<{}, {}> {
  render() {
    return (
      <Content>
        <MainStats />
        <Chart />
        <Stats />
      </Content>
    );
  }
}

export default MainContent;
