import React, { Props } from 'react';
import { ListItem } from 'native-base';
import Component from 'lib/component';

class CustomListItem extends Component<{ onPress?: () => void }, {}> {
  render() {
    return (
      <ListItem
        icon
        style={{ marginVertical: 10 }}
        onPress={this.props.onPress}
      >
        {this.props.children}
      </ListItem>
    );
  }
}

export default CustomListItem;
