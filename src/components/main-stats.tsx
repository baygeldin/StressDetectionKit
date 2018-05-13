import Component from 'lib/component';
import {
  ACTIVITY_UNITS,
  BLACK,
  BLUE,
  GREEN,
  HEARTRATE_UNITS,
  HRV_UNITS,
  RED,
  GREY
} from 'lib/constants';
import { ChartType } from 'lib/types';
import { inject, observer } from 'mobx-react/native';
import { Text } from 'native-base';
import * as React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 5,
    marginBottom: 6
  },
  column: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'column',
    borderRightWidth: 0,
    paddingVertical: 5,
    borderColor: GREY
  },
  title: {
    fontSize: 18,
    textAlign: 'center',
    color: GREY,
    fontWeight: 'bold'
  },
  value: {
    fontSize: 40,
    fontWeight: 'bold',
    textAlign: 'center',
    color: BLACK
  },
  units: {
    fontSize: 12,
    marginBottom: 4,
    textAlign: 'center',
    color: GREY
  },
  highlight: {
    color: BLUE
  }
});

@inject('store', 'ui')
@observer
class MainStats extends Component<{}, {}> {
  render() {
    const last = this.store.lastSample;
    const stressed = last.state;

    const style = (field: string, type: ChartType) => {
      const res = [field === 'title' ? styles.title : styles.value];
      if (type === this.ui.currentChart) res.push(styles.highlight);
      return res;
    };

    return (
      <View style={styles.container}>
        <View style={styles.column}>
          <Icon
            name={`emoticon-${stressed ? 'devil' : 'happy'}`}
            size={80}
            color={stressed ? RED : GREEN}
          />
          <Text style={{ color: stressed ? RED : GREEN }}>
            {stressed ? 'STRESSED' : 'RELAXED'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.column}
          onPress={() => this.ui.selectChart('hrv')}
        >
          <Text style={style('title', 'hrv')}>HRV</Text>
          <Text style={style('value', 'hrv')}>{Math.round(last.hrv)}</Text>
          <Text style={styles.units}>{HRV_UNITS}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.column}
          onPress={() => this.ui.selectChart('heartRate')}
        >
          <Text style={style('title', 'heartRate')}>HR</Text>
          <Text style={style('value', 'heartRate')}>
            {Math.round(last.heartRate)}
          </Text>
          <Text style={styles.units}>{HEARTRATE_UNITS}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.column}
          onPress={() => this.ui.selectChart('activity')}
        >
          <Text style={style('title', 'activity')}>ACTIVITY</Text>
          <Text style={style('value', 'activity')}>
            {Math.round(last.activity)}
          </Text>
          <Text style={styles.units}>{ACTIVITY_UNITS}</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

export default MainStats;
