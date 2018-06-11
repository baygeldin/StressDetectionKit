import {
  APP_NAME,
  HIGH_STRESS_COLOR,
  LOW_STRESS_COLOR,
  MEDIUM_STRESS_COLOR,
  NONE_STRESS_COLOR
} from 'lib/constants';
import { Device, Reading } from 'lib/device-kit';
import { StressLevel } from 'lib/types';
import { Alert, Platform } from 'react-native';
import { BluetoothStatus } from 'react-native-bluetooth-status';
import * as RNFS from 'react-native-fs';
import { DOMParser } from 'xmldom';

export function chunkBySize<T>(array: T[], size: number) {
  const results: T[][] = [];

  for (let i = 0; i < array.length; i += size) {
    results.push(array.slice(i, i + size));
  }

  return results;
}

export function chunkByPattern<T>(
  array: T[],
  pattern: (elem: T, index: number, array: T[]) => any
) {
  const results: T[][] = [[array[0]]];

  for (let i = 1, state = pattern(array[0], 0, array); i < array.length; i++) {
    const current = pattern(array[i], i, array);

    if (state === current || isNaN(state)) {
      results[results.length - 1].push(array[i]);
    } else {
      state = current;
      results.push([array[i]]);
    }
  }

  return results;
}

export function calcOffsets<T>(array: T[][]) {
  return array
    .map(c => c.length)
    .reduce(
      ({ acc, offsets }, c) => ({ acc: acc + c, offsets: [...offsets, acc] }),
      {
        acc: 0,
        offsets: [] as number[]
      }
    ).offsets;
}

export function stressColor(level: StressLevel) {
  switch (level) {
    case 'none':
      return NONE_STRESS_COLOR;
    case 'low':
      return LOW_STRESS_COLOR;
    case 'medium':
      return MEDIUM_STRESS_COLOR;
    case 'high':
      return HIGH_STRESS_COLOR;
  }
}

export function deviceTitle(device: Device) {
  return `${device.modelName} by ${device.manufacturer}`;
}

export function confirmAction(fn: () => void, msg?: string) {
  Alert.alert('Are you sure?', msg, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'OK', onPress: fn }
  ]);
}

export function tryLaterAlert() {
  Alert.alert('Not now', 'Stop stress monitoring first.', [{ text: 'Got it' }]);
}

// Extract strings from XML
function getTextContent(node: Document | Element, tag: string) {
  return node.getElementsByTagName(tag)[0].textContent!.trim();
}

// Apply quality and split the stream to points
function processStream(originalPoints: number[], originalQuality: number[]) {
  const points = chunkBySize(originalPoints, 2);
  const quality = chunkBySize(originalQuality, 2);
  return points.filter((p, i) => quality[i][0] === 255);
}

export function readingToStreams(reading: Reading) {
  const doc = new DOMParser().parseFromString(reading.data);

  // According to MedM there is always only one chunk in the reading
  const chunk = doc.getElementsByTagName('chunk')[0];

  const start =
    Date.parse(getTextContent(doc, 'measured-at')) +
    parseInt(getTextContent(chunk, 'start'), 10);

  const {
    pulse,
    pulse_quality,
    rr_intervals,
    rr_intervals_quality
  } = JSON.parse(getTextContent(chunk, 'heartrate')).irregular;

  const pulseStream = processStream(pulse, pulse_quality).map(p => ({
    pulse: p[0],
    timestamp: start + p[1]
  }));

  const rrIntervalsStream = processStream(
    rr_intervals,
    rr_intervals_quality
  ).map(p => ({
    rrInterval: p[0],
    timestamp: start + p[1]
  }));

  return { pulse: pulseStream, rrIntervals: rrIntervalsStream };
}

const APP_DATA_FOLDER = Platform.select({
  ios: `${RNFS.DocumentDirectoryPath}/app_data`,
  android: `${RNFS.ExternalStorageDirectoryPath}/${APP_NAME}`
});

// Persist data to disk to the application folder
export function persist(
  folder: string,
  filename: string,
  data: any
): Promise<void> {
  const path = `${APP_DATA_FOLDER}/${folder}`;
  return RNFS.mkdir(path).then(() =>
    RNFS.writeFile(`${path}/${filename}`, JSON.stringify(data), 'ascii')
  );
}

export async function requestBluetooth() {
  const status = await BluetoothStatus.state();

  if (!status) {
    if (Platform.OS === 'android') {
      await BluetoothStatus.enable();
    } else {
      await new Promise(resolve => {
        const onPress = () => {
          BluetoothStatus.openBluetoothSettings();
          resolve();
        };

        Alert.alert(
          'Turn on Bluetooth',
          'Bluetooth is required for the app to work properly.',
          [{ text: 'OK', onPress }],
          { cancelable: false }
        );
      });
    }
  }
}
