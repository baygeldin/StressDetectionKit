import Component from 'lib/component';
import { WHITE } from 'lib/constants';
import { confirmAction } from 'lib/helpers';
import { inject, observer } from 'mobx-react/native';
import { Button, Text } from 'native-base';
import * as React from 'react';

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
        <Text style={{ color: WHITE }}>{title.toUpperCase()}</Text>
      </Button>
    );
  }
}

export default CollectionButton;
