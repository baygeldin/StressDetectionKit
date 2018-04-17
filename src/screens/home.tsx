import CogButton from 'components/cog-button';
import CollectionButton from 'components/collection-button';
import GatheringContent from 'components/gathering-content';
import InitialContent from 'components/initial-content';
import MainContent from 'components/main-content';
import Component from 'lib/component';
import { APP_NAME } from 'lib/constants';
import { inject, observer } from 'mobx-react/native';
import { Container, Footer, FooterTab } from 'native-base';
import * as React from 'react';

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
