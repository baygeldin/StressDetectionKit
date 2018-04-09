import Component from 'lib/component';
import { BLACK, BLUE, GREEN, RED } from 'lib/constants';
import { ChartType } from 'lib/types';
import { inject, observer } from 'mobx-react/native';
import { Text } from 'native-base';
import React from 'react';
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
    borderColor: 'grey'
  },
  title: {
    fontSize: 18,
    textAlign: 'center',
    color: 'grey',
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
    color: 'grey'
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
          <Text style={style('value', 'hrv')}>{Math.round(last.rmssd)}</Text>
          <Text style={styles.units}>ms</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.column}
          onPress={() => this.ui.selectChart('hr')}
        >
          <Text style={style('title', 'hr')}>HR</Text>
          <Text style={style('value', 'hr')}>{Math.round(last.heartrate)}</Text>
          <Text style={styles.units}>bpm</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.column}
          onPress={() => this.ui.selectChart('activity')}
        >
          <Text style={style('title', 'activity')}>ACTIVITY</Text>
          <Text style={style('value', 'activity')}>
            {last.activityIndex.toFixed(1)}
          </Text>
          <Text style={styles.units}>{'m\u00b2 / s'}</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

export default MainStats;
