import React from 'react';
import { View } from 'react-native';
import { observer, inject } from 'mobx-react/native';
import { Container, Content, Text, Footer, FooterTab, Icon } from 'native-base';
import Component from 'lib/component';
import { APP_NAME, DATE_FORMAT, WINDOW_SIZE, STEP_SIZE } from 'lib/constants';
import CogButton from 'components/cog-button';
import CollectionButton from 'components/collection-button';

@inject('store')
@observer
export default class extends Component<{}, {}> {
  static navigationOptions = {
    title: APP_NAME,
    headerRight: <CogButton />
  };

  render() {
    const collecting = this.store.collecting;
    //(this.store.chunksCollected % (WINDOW_SIZE+STEP_SIZE)) / (WINDOW_SIZE+STEP_SIZE); it's progress, but maybe I should extract it to constants
    const content = collecting
      ? 'this.store.sampleProgress.toString()'
      : 'Hello! Start collection first!';

    return (
      <Container>
        <Content padder>
          <Text style={{ textAlign: 'center', marginTop: 10 }}>{content}</Text>
        </Content>
        <Footer>
          <FooterTab>
            <CollectionButton />
          </FooterTab>
        </Footer>
      </Container>
    );
  }
}
