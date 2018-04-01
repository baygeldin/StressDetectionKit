import React from 'react';
import { View, Dimensions, Text } from 'react-native';
import { observer, inject } from 'mobx-react/native';
import Svg, { Circle, Rect, Path } from 'react-native-svg';
import { area, scaleLinear, curveCardinal } from 'd3';
import Component from 'lib/component';
import { Sample } from 'lib/types';

@inject('store', 'ui')
@observer
class Chart extends Component<{}, {}> {
  componentWillMount() {
    Dimensions.addEventListener('change', () => this.forceUpdate());
  }

  render() {
    const height = 150;
    const { width } = Dimensions.get('window');

    const data = this.store.currentSamples.map(
      s => [s.timestamp, s.rmssd] as [number, number]
    );
    const first = data[0];
    const last = data[data.length - 1];

    const x = scaleLinear()
      .domain([first[0], last[0]])
      .range([0, width]);

    const y = scaleLinear()
      .domain([0, 100])
      .range([height, 0]);

    const path = area()
      .x(d => x(d[0]))
      .y0(height)
      .y1(d => y(d[1]))
      .curve(curveCardinal);

    const rects = this.ui.stressSegments.map(s => {
      return (
        <Rect
          key={s.start}
          x={x(s.start)}
          y={0}
          width={x(s.end) - x(s.start)}
          height={height}
          fill={s.state ? 'crimson' : 'forestgreen'}
          fillOpacity={0.5}
        />
      );
    });

    const sample = this.ui.selectedSample;

    const res = path(data)!;
    return (
      <Svg height={height} width={width}>
        <Path d={res} strokeWidth={1.5} stroke="steelblue" fill="steelblue" />
        {rects}
        <Rect
          x={x(sample.timestamp) - 2}
          y={0}
          width={5}
          height={height}
          fill="black"
        />
      </Svg>
    );
  }
}

export default Chart;
