import React from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import { observer, inject } from 'mobx-react/native';
import Component from 'lib/component';

@inject('router')
@observer
class CogButton extends Component<{}, {}> {
  render() {
    return (
      <Icon.Button
        name="cog"
        style={{ backgroundColor: 'white' }}
        color="black"
        onPress={() => this.router.goToSettings()}
      />
    );
  }
}

export default CogButton;
