import { area, curveCardinal, scaleLinear } from 'd3';
import Component from 'lib/component';
import {
  BLUE,
  CHART_HEIGHT,
  GREEN,
  RED,
  STEP_LENGTH,
  WHITE
} from 'lib/constants';
import { inject, observer } from 'mobx-react/native';
import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { Slider } from 'react-native-elements';
import Svg, { Path, Rect } from 'react-native-svg';
import { Sample } from 'lib/types';

const thumbWidth = 20;
const thumbHalfWidth = Math.floor(thumbWidth / 2);

const styles = StyleSheet.create({
  track: {
    height: thumbWidth,
    borderRadius: 0,
    backgroundColor: WHITE
  },
  thumb: {
    width: thumbWidth,
    height: thumbWidth,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: BLUE,
    backgroundColor: WHITE,
    marginTop: thumbHalfWidth - 2
  }
});

@inject('ui')
@observer
class Pin extends Component<{ x: (timestamp: number) => number }, {}> {
  render() {
    const x = this.props.x(this.ui.selectedSample.timestamp) - 1;

    return <Rect x={x} y={0} width={3} height={CHART_HEIGHT} fill={BLUE} />;
  }
}

@inject('store', 'ui')
@observer
class Area extends Component<{}, {}> {
  componentWillMount() {
    Dimensions.addEventListener('change', () => this.forceUpdate());
  }

  render() {
    const { width } = Dimensions.get('window');
    const height = CHART_HEIGHT;

    let mapper: (s: Sample) => [number, number];

    if (this.ui.currentChart === 'hrv') {
      mapper = s => [s.timestamp, s.rmssd];
    } else if (this.ui.currentChart === 'hr') {
      mapper = s => [s.timestamp, s.heartrate];
    } else {
      mapper = s => [s.timestamp, s.activityIndex];
    }

    const data = this.store.currentSamples.map(mapper);

    const first = data[0];
    const last = data[data.length - 1];

    const max = Math.max(...data.map(d => d[1]));

    const x = scaleLinear()
      .domain([first[0], last[0]])
      // Create buffers around the chart for the slider thumb
      .range([thumbHalfWidth, width - thumbHalfWidth]);

    const y = scaleLinear()
      // Create a 20% buffer at the top
      .domain([0, max * 1.2])
      .range([height, 0]);

    const fakeStart = x.invert(0);
    const fakeEnd = x.invert(width);

    const processedData = [
      [fakeStart, first[1]] as [number, number],
      ...data,
      [fakeEnd, last[1]] as [number, number]
    ];

    const path = area()
      .x(d => x(d[0]))
      .y0(height)
      .y1(d => y(d[1]))
      .curve(curveCardinal);

    const rects = this.ui.stressSegments.map((s, i, arr) => {
      const start = i === 0 ? fakeStart : s.start;
      const end = i === arr.length - 1 ? fakeEnd : s.end;

      return (
        <Rect
          key={start}
          x={x(start)}
          y={0}
          width={x(end) - x(start)}
          height={height}
          fill={s.state ? RED : GREEN}
          fillOpacity={0.4}
        />
      );
    });

    return (
      <Svg height={height} width={width}>
        <Path d={path(processedData)!} strokeWidth={1.5} fill={BLUE} />
        {rects}
        <Pin x={x} />
      </Svg>
    );
  }
}

@inject('store', 'ui')
@observer
class Chart extends Component<{}, {}> {
  render() {
    const first = this.store.currentSamples[0];
    const last = this.store.lastSample;

    return (
      <View>
        <Area />
        <Slider
          style={{ marginTop: -10 }}
          minimumValue={first.timestamp}
          maximumValue={last.timestamp}
          step={STEP_LENGTH}
          value={this.ui.selectedSample.timestamp}
          trackStyle={styles.track}
          thumbStyle={styles.thumb}
          minimumTrackTintColor={BLUE}
          onValueChange={v => this.ui.selectSample(v)}
        />
      </View>
    );
  }
}

export default Chart;
