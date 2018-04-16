import * as React from 'react';
import { observer, inject } from 'mobx-react/native';
import { Text, Button } from 'native-base';
import Component from 'lib/component';
import { confirmAction } from 'lib/helpers';

@inject('store', 'ui')
@observer
class CollectionButton extends Component<{}, {}> {
  render() {
    const collecting = this.store.collecting;
    const title = collecting ? 'Stop monitoring' : 'Start monitoring';

    let action: () => void;

    if (collecting) {
      if (this.ui.gatheredEnoughData) {
        action = () =>
          confirmAction(
            this.store.stopCollection,
            'All collected data will be lost.'
          );
      } else {
        action = this.store.stopCollection;
      }
    } else {
      action = this.store.startCollection;
    }

    return (
      <Button full primary={!collecting} danger={collecting} onPress={action}>
        <Text>{title}</Text>
      </Button>
    );
  }
}

export default CollectionButton;
