import Component from 'lib/component';
import { BLACK, WHITE } from 'lib/constants';
import { inject, observer } from 'mobx-react/native';
import * as React from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';

@inject('router')
@observer
class CogButton extends Component<{}, {}> {
  render() {
    return (
      <Icon.Button
        name="cog"
        style={{ backgroundColor: WHITE }}
        color={BLACK}
        onPress={() => this.router.goToSettings()}
      />
    );
  }
}

export default CogButton;
