import CollectionButton from 'components/collection-button';
import Stats from 'components/dev-stats';
import StressButtons from 'components/stress-buttons';
import StressInfo from 'components/stress-info';
import Component from 'lib/component';
import { inject, observer } from 'mobx-react/native';
import { Container, Content, Footer, FooterTab, Text } from 'native-base';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});

@inject('store')
@observer
export default class extends Component<{}, {}> {
  static navigationOptions = {
    title: 'Developer'
  };

  render() {
    const collecting = this.store.collecting;
    const content = collecting ? (
      <View style={styles.inner}>
        <Stats />
        <StressButtons />
        <StressInfo />
      </View>
    ) : (
      <View style={styles.inner}>
        <Icon name="developer-mode" size={80} color="black" />
        <Text style={{ textAlign: 'center', marginTop: 10 }}>
          Hi! Start monitoring to see statistics.
        </Text>
      </View>
    );

    return (
      <Container>
        <Content contentContainerStyle={styles.container}>{content}</Content>
        <Footer>
          <FooterTab>
            <CollectionButton />
          </FooterTab>
        </Footer>
      </Container>
    );
  }
}
