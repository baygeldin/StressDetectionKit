import Component from 'lib/component';
import { inject, observer } from 'mobx-react/native';
import { Card, CardItem, Left, Right, Text } from 'native-base';
import React from 'react';
import { StyleSheet, View } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    marginHorizontal: 5
  }
});

@inject('store', 'ui')
@observer
class StatsList extends Component<{}, {}> {
  render() {
    return (
      <View style={styles.container}>
        <Card>
          <CardItem>
            <Left>
              <Text>Heart rate variability</Text>
            </Left>
            <Right>
              <Text>80 ms</Text>
            </Right>
          </CardItem>
          <CardItem>
            <Left>
              <Text>Heart rate</Text>
            </Left>
            <Right>
              <Text>100 bpm</Text>
            </Right>
          </CardItem>
        </Card>
      </View>
    );
  }
}

export default StatsList;
