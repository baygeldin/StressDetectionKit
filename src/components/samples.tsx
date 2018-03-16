import React from 'react';
import { observer } from 'mobx-react/native';
import { Text, View } from 'react-native';
import moment from 'moment';
import Component from 'lib/component';
import { DATE_FORMAT } from 'lib/constants';
import { Sample } from 'lib/types';

@observer
class Row extends Component<{ data: Sample }, {}> {
  render() {
    const sample = this.props.data;
    const timestamp = moment(sample.timestamp).format(DATE_FORMAT);
    const duration = moment.duration(sample.duration, 'ms').humanize();

    return (
      <Text style={{ textAlign: 'center' }}>
        {'At '}
        <Text style={{ fontWeight: 'bold' }}>{timestamp}</Text>
        {' during '}
        <Text style={{ fontWeight: 'bold' }}>{duration}</Text>
      </Text>
    );
  }
}

@observer
class Samples extends Component<{ data: Sample[] }, {}> {
  render() {
    const samplesList = this.props.data.map(s => (
      <Row data={s} key={s.timestamp} />
    ));
    const title = this.props.data.length
      ? 'Samples collected:'
      : 'No samples collected yet.';

    return (
      <View>
        <Text
          style={{
            textAlign: 'center',
            fontSize: 16,
            fontWeight: 'bold',
            margin: 10
          }}
        >
          {title}
        </Text>
        {samplesList}
      </View>
    );
  }
}

export default Samples;
