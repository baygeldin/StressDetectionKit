import React from 'react';
import { observer } from 'mobx-react/native';
import { View, Dimensions } from 'react-native';
import { Text } from 'native-base';
import Component from 'lib/component';

import Svg, { Circle, Rect, Path } from 'react-native-svg';
import { area, scaleLinear } from 'd3';

class SvgExample extends Component<{}, {}> {
  componentWillMount() {
    Dimensions.addEventListener('change', () => this.forceUpdate());
  }

  render() {
    const height = 150;
    const { width } = Dimensions.get('window');

    const data = [50, 60, 65, 55, 70, 60, 40];

    const x = scaleLinear()
      .domain([0, data.length - 1])
      .range([0, width]);

    const y = scaleLinear()
      .domain([0, 100])
      .range([height, 0]);

    const path = area<number>()
      .x((d, i) => x(i))
      .y0(height)
      .y1(d => y(d));

    const res = path(data)!;
    return (
      <Svg height={height} width={width}>
        <Path d={res} strokeWidth={1.5} stroke="crimson" fill="crimson" />
      </Svg>
    );
  }
}

@observer
class InitialContent extends Component<{}, {}> {
  render() {
    return (
      <View>
        <Text style={{ textAlign: 'center', marginTop: 10 }}>
          Start collection first.
        </Text>
        <SvgExample />
      </View>
    );
  }
}

export default InitialContent;
