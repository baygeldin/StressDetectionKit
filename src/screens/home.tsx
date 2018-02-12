import React, { Component } from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Text, View, Button }  from 'react-native';
import { observer, inject } from 'mobx-react/native'

@inject('navigation')
class CogButton extends Component<any, any> {
  render() {
    return (
      <Icon.Button name="cog" style={{backgroundColor: 'white'}} color="black"
        onPress={() => this.props.navigation.goToSettings()} /> 
    )
  }
}

@inject('navigation')
export default class extends Component<any, any> {
  static navigationOptions = {
    title: 'Stress Detection Kit',
    headerRight: <CogButton />
  }

  render() {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Home Screen</Text>
        <Button
          onPress={() => this.props.navigation.goToSettings()}
          title="Go to settings"
        />
      </View>
    )
  }
}