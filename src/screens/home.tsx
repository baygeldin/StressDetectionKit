import React from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Text, View, Button }  from 'react-native';
import { observer, inject } from 'mobx-react/native';
import Component from 'lib/component';

@inject('router')
class CogButton extends Component<{}, {}> {
  render() {
    return (
      <Icon.Button name="cog" style={{backgroundColor: 'white'}} color='black'
        onPress={() => this.router.goToSettings()} /> 
    )
  }
}

@inject('router')
export default class extends Component<{}, {}> {
  static navigationOptions = {
    title: 'Stress Detection Kit',
    headerRight: <CogButton />
  }

  render() {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Home Screen</Text>
        <Button
          onPress={() => this.router.goToSettings()}
          title='Go to settings'
        />
      </View>
    )
  }
}