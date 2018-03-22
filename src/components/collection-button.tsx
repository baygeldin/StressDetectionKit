import React from 'react';
import { observer, inject } from 'mobx-react/native';
import { Button } from 'react-native';
import Component from 'lib/component';

@inject('store')
@observer
class CollectionButton extends Component<{}, {}> {
  render() {
    const collecting = this.store.collecting;
    const action = collecting
      ? () => this.store.stopCollection()
      : () => this.store.startCollection();
    const title = collecting ? 'Stop Collection' : 'Start Collection';

    return <Button onPress={action} title={title} />;
  }
}

export default CollectionButton;
