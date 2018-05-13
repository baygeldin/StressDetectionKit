import Component from 'lib/component';
import {
  ACCELERATION_UNITS,
  AGE_UNITS,
  BLACK,
  BLUE,
  HEARTRATE_UNITS,
  HRV_UNITS,
  LIGHT,
  WHITE
} from 'lib/constants';
import { PromptValues } from 'lib/types';
import { inject, observer } from 'mobx-react/native';
import * as React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const styles = StyleSheet.create({
  dialog: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  },
  content: {
    elevation: 20,
    width: 300,
    backgroundColor: WHITE,
    borderRadius: 2,
    overflow: 'hidden',
    paddingHorizontal: 25,
    paddingVertical: 20
  },
  title: {},
  titleText: {
    fontSize: 19,
    fontWeight: '500',
    color: BLACK
  },
  body: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  input: {
    height: 40,
    fontSize: 18,
    flex: 1
  },
  units: {
    flex: 0,
    fontSize: 18,
    fontWeight: '500',
    color: BLACK
  },
  footer: {
    flexDirection: 'row',
    paddingTop: 15,
    height: 40
  },
  action: {
    flex: 1
  },
  actionText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center'
  },
  cancel: {
    color: LIGHT
  },
  submit: {
    color: BLUE
  }
});

@inject('ui', 'store')
@observer
class PromptContent extends Component<{ type: PromptValues }, {}> {
  render() {
    const prompt = this.props.type;

    let title, value, units: string;
    let action: (value: any) => void;

    if (prompt === 'hrv') {
      title = 'Baseline HRV';
      action = this.store.setBaselineHrv;
      value = Math.round(this.store.baselineHrv).toString();
      units = HRV_UNITS;
    } else if (prompt === 'heartRate') {
      title = 'Baseline heart rate';
      action = this.store.setBaselineHeartRate;
      value = Math.round(this.store.baselineHeartRate).toString();
      units = HEARTRATE_UNITS;
    } else if (prompt === 'accelerometerError') {
      title = 'Accelerometer error';
      action = this.store.setAccelerometerError;
      value = this.store.accelerometerError.toFixed(5);
      units = ACCELERATION_UNITS;
    } else if (prompt === 'age') {
      title = 'Age';
      action = (value: number) => {};
      value = Math.round(0).toString();
      units = AGE_UNITS;
    } else {
      return null;
    }

    this.ui.inputPrompt(value); // actions are untracked ;)

    return (
      <View style={styles.dialog}>
        <View style={styles.overlay} />
        <View style={styles.content}>
          <View style={styles.title}>
            <Text style={styles.titleText}>{title}</Text>
          </View>
          <View style={styles.body}>
            <TextInput
              style={styles.input}
              onChangeText={this.ui.inputPrompt}
              defaultValue={value}
              placeholder={value}
              autoFocus={true}
              underlineColorAndroid={LIGHT}
              keyboardType="numeric"
            />
            <Text style={styles.units}>{units}</Text>
          </View>
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.action}
              onPress={this.ui.hidePrompt}
            >
              <Text style={[styles.actionText, styles.cancel]}>CANCEL</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.action}
              onPress={() => this.ui.submitPrompt(action)}
            >
              <Text style={[styles.actionText, styles.submit]}>SUBMIT</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
}

@inject('ui')
@observer
class SettingsPrompt extends Component<{}, {}> {
  render() {
    const prompt = this.ui.currentPrompt;
    const content = prompt ? <PromptContent type={prompt} /> : null;

    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={!!prompt}
        onRequestClose={this.ui.hidePrompt}
      >
        {content}
      </Modal>
    );
  }
}

export default SettingsPrompt;
