import { Props } from 'react';
import * as React from 'react';
import { StyleSheet } from 'react-native';
import { ListItem } from 'native-base';
import Component from 'lib/component';

const styles = StyleSheet.create({
  container: {
    marginVertical: 10
  }
});

class CustomListItem extends Component<{ onPress?: () => void }, {}> {
  render() {
    return (
      <ListItem icon style={styles.container} onPress={this.props.onPress}>
        {this.props.children}
      </ListItem>
    );
  }
}

export default CustomListItem;
