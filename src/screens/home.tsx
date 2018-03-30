import React from 'react';
import { View } from 'react-native';
import { observer, inject } from 'mobx-react/native';
import { Container, Text, Footer, FooterTab, Icon } from 'native-base';
import { Bar } from 'react-native-progress';
import Component from 'lib/component';
import { APP_NAME, DATE_FORMAT, WINDOW_SIZE, STEP_SIZE } from 'lib/constants';
import CogButton from 'components/cog-button';
import CollectionButton from 'components/collection-button';
import InitialContent from 'components/initial-content';
import GatheringContent from 'components/gathering-content';
import MainContent from 'components/main-content';

@inject('store', 'ui')
@observer
export default class extends Component<{}, {}> {
  static navigationOptions = {
    title: APP_NAME,
    headerRight: <CogButton />
  };

  render() {
    let content: JSX.Element;

    if (!this.store.collecting) {
      content = <InitialContent />;
    } else if (!this.ui.gatheredEnoughData) {
      content = <GatheringContent />;
    } else {
      content = <MainContent />;
    }

    return (
      <Container>
        {content}
        <Footer>
          <FooterTab>
            <CollectionButton />
          </FooterTab>
        </Footer>
      </Container>
    );
  }
}
