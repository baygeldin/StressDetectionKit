import { area, curveCardinal, scaleLinear } from 'd3';
import Component from 'lib/component';
import {
  BLUE,
  CHART_HEIGHT,
  DEFAULT_ACTIVITY_MIN,
  DEFAULT_HEARTRATE_MIN,
  DEFAULT_HRV_MIN,
  GREEN,
  RED,
  WHITE
} from 'lib/constants';
import { Sample } from 'lib/types';
import { inject, observer } from 'mobx-react/native';
import * as React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { Slider } from 'react-native-elements';
import Svg, { Path, Rect } from 'react-native-svg';

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
class Pin extends Component<{ x: (sampleId: number) => number }, {}> {
  render() {
    const x = this.props.x(this.ui.sliderOffset);

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

    let mapper: (s: Sample) => number;
    let defaultMin: number;

    if (this.ui.currentChart === 'hrv') {
      mapper = s => s.hrv;
      defaultMin = DEFAULT_HRV_MIN;
    } else if (this.ui.currentChart === 'heartRate') {
      mapper = s => s.heartRate;
      defaultMin = DEFAULT_HEARTRATE_MIN;
    } else {
      mapper = s => s.activity;
      defaultMin = DEFAULT_ACTIVITY_MIN;
    }

    const data = this.store.currentSamples.map(mapper);

    const x = scaleLinear()
      .domain([0, this.store.currentSamples.length - 1])
      // Create buffers around the chart for the slider thumb
      .range([thumbHalfWidth, width - thumbHalfWidth]);

    const y = scaleLinear()
      // Create a 20% buffer at the top
      .domain([Math.min(...data, defaultMin), Math.max(...data) * 1.2])
      .range([height, 0]);

    const fakeStart = x.invert(0);
    const fakeEnd = x.invert(width);

    const processedData = [
      [fakeStart, data[0]] as [number, number],
      ...data.map((d, i) => [i, d] as [number, number]),
      [fakeEnd, data[data.length - 1]] as [number, number]
    ];

    const path = area()
      .x(d => x(d[0]))
      .y0(height)
      .y1(d => y(d[1]))
      .curve(curveCardinal);

    const rects = this.ui.stressSegments.map((s, i, arr) => {
      // Rects should start before actual samples, because it makes more sense that
      // stress starts one STEP_LENGTH before a sample than at the time it was recorded.
      const offset = s.offset - 1;
      const start = i === 0 ? fakeStart : offset;
      const end = i === arr.length - 1 ? fakeEnd : offset + s.samples.length;

      return (
        <Rect
          key={s.offset}
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
    return (
      <View>
        <Area />
        <Slider
          style={{ marginTop: -10 }}
          minimumValue={0}
          // Workaround for a bug with slider:
          // the thumb disappears if maximumValue equals value.
          maximumValue={this.store.currentSamples.length - 0.9999}
          value={this.ui.sliderOffset}
          step={1}
          trackStyle={styles.track}
          thumbStyle={styles.thumb}
          minimumTrackTintColor={BLUE}
          onValueChange={s => this.ui.moveSliderTo(s)}
          onSlidingComplete={s =>
            this.ui.selectSample(this.store.currentSamples[s])
          }
        />
      </View>
    );
  }
}

export default Chart;
