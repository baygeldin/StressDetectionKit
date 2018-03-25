import React from 'react';
import { observer, inject } from 'mobx-react/native';
import { Text, Button } from 'native-base';
import Component from 'lib/component';

@inject('store')
@observer
class CollectionButton extends Component<{}, {}> {
  render() {
    const collecting = this.store.collecting;
    const action = collecting
      ? this.store.stopCollection
      : this.store.startCollection;
    const title = collecting ? 'Stop Collection' : 'Start Collection';

    return (
      <Button full primary={!collecting} danger={collecting} onPress={action}>
        <Text>{title}</Text>
      </Button>
    );
  }
}

export default CollectionButton;
