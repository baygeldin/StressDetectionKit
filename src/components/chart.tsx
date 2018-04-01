import React from 'react';
import { View, Dimensions } from 'react-native';
import { observer } from 'mobx-react/native';
import Svg, { Circle, Rect, Path } from 'react-native-svg';
import { area, scaleLinear, curveCardinal } from 'd3';
import Component from 'lib/component';
import { Sample } from 'lib/types';

import { STEP_LENGTH } from 'lib/constants';
import { chunkByPattern } from 'lib/helpers';
import { observable, action, toJS } from 'mobx';

const date = Date.now();
const baseline = 60;

function generateSample(index: number): Sample {
  const rmssd = Math.floor(Math.random() * 100);
  const activityIndex = Math.floor(Math.random() * 50);
  const state = Math.random() >= 0.5;
  const timestamp = date + 30000 * index;

  return {
    state,
    activityIndex,
    rmssd,
    rmssdDiff: rmssd - baseline,
    stress: 'none',
    timestamp
  };
}

const initial = new Array(30).fill(0).map((s, i) => generateSample(i));
const samples = observable.array(initial, { deep: false });

const timer = setInterval(
  action(() => samples.push(generateSample(samples.length))),
  3000
);

setTimeout(() => clearInterval(timer), 60000);

@observer
class Chart extends Component<{}, {}> {
  componentWillMount() {
    Dimensions.addEventListener('change', () => this.forceUpdate());
  }

  render() {
    const height = 150;
    const { width } = Dimensions.get('window');

    const segments = chunkByPattern(samples, s => s.state).map(g => {
      const start = g[0].timestamp - STEP_LENGTH;
      const end = g[g.length - 1].timestamp;
      const duration = end - start;
      const state = g[0].state;

      return { start, end, duration, state };
    });

    const data = samples.map(s => [s.timestamp, s.rmssd] as [number, number]);
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

    const rects = segments.map(s => {
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

    const res = path(data)!;
    return (
      <Svg height={height} width={width}>
        <Path d={res} strokeWidth={1.5} stroke="steelblue" fill="steelblue" />
        {rects}
      </Svg>
    );
  }
}

export default Chart;
