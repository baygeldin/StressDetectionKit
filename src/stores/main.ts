import remotedev from 'mobx-remotedev';
import { observable, action, computed, toJS } from 'mobx';
import {
  Accelerometer,
  Gyroscope,
  SensorData,
  SensorObservable
} from 'react-native-sensors';
import RNFS from 'react-native-fs';
import { DOMParser } from 'xmldom';
import Denque from 'denque';
import { Device, Reading } from 'lib/device-kit';
import DeviceKit from 'lib/device-kit';
import {
  APP_NAME,
  WINDOW_SIZE,
  STEP_SIZE,
  CHUNK_LENGTH,
  SENSOR_UPDATE_INTERVAL
} from 'lib/constants';
import { chunkArray } from 'lib/helpers';
import {
  Chunk,
  Sample,
  StressLevels,
  PulseMark,
  RrIntervalMark,
  StressMark,
  Sensor
} from 'lib/types';

//@remotedev
export default class Main {
  @observable initialized = false;
  @observable collecting = false;
  @observable scanning = false;

  @observable.shallow devices: Device[] = [];
  @observable.ref currentDevice?: Device;

  @observable.shallow percievedStress: StressMark[] = [];
  @observable currentPercievedStressLevel: StressLevels = 'none';
  @observable percievedStressStartedAt: number;

  @observable collectionStartedAt: number;

  @observable.shallow pulseBuffer: PulseMark[] = [];
  @observable.shallow rrIntervalsBuffer: RrIntervalMark[] = [];
  @observable.shallow accelerometerBuffer: SensorData[] = [];
  @observable.shallow gyroscopeBuffer: SensorData[] = [];

  private chunksQueue = new Denque<Chunk>([]);
  @observable chunksCollected = 0;

  @observable.shallow currentSamples: Sample[] = [];

  private accelerometer: SensorObservable;
  private gyroscope: SensorObservable;

  constructor(private sdk: DeviceKit) {}

  @computed
  get lastSample() {
    return this.currentSamples[this.currentSamples.length - 1];
  }

  @action.bound
  initialize(key: string) {
    this.sdk
      .register(key)
      .then(() => this.sdk.fetchDevices())
      .then(
        action('initialize', (devices: Device[]) => {
          this.initialized = true;

          if (devices[0]) {
            this.currentDevice = devices[0];
          }
        })
      );
  }

  @action.bound
  startCollection() {
    if (this.collecting) return;

    this.collecting = true;

    const timestamp = Date.now();
    this.percievedStressStartedAt = timestamp;
    this.collectionStartedAt = timestamp;

    this.startSensorCollection(Accelerometer);
    this.startSensorCollection(Gyroscope);
    this.startHeartrateCollection();

    setTimeout(() => this.pushChunk(), CHUNK_LENGTH * 1000);
  }

  @action.bound
  processReading(reading: Reading) {
    const doc = new DOMParser().parseFromString(reading.data);

    // According to MedM there is always only one chunk in the reading
    const chunk = doc.getElementsByTagName('chunk')[0];

    const start =
      Date.parse(this.getTextContent(doc, 'measured-at')) +
      parseInt(this.getTextContent(chunk, 'start'));

    const {
      pulse,
      pulse_quality,
      rr_intervals,
      rr_intervals_quality
    } = JSON.parse(this.getTextContent(chunk, 'heartrate')).irregular;

    const pulseStream = this.processStream(pulse, pulse_quality).map(p => ({
      pulse: p[0],
      timestamp: start + p[1]
    }));

    const rrIntervalsStream = this.processStream(
      rr_intervals,
      rr_intervals_quality
    ).map(p => ({
      rrInterval: p[0],
      timestamp: start + p[1]
    }));

    this.pulseBuffer.push(...pulseStream);
    this.rrIntervalsBuffer.push(...rrIntervalsStream);
  }

  @action.bound
  stopCollection() {
    if (!this.collecting) return;

    this.collecting = false;
    this.changeStressLevel('none');
    this.sdk.stopCollection();
    this.accelerometer.stop();
    this.gyroscope.stop();

    if (__DEV__) {
      Promise.all([this.persistSamples(), this.persistStress()])
        .then(this.flushSamples)
        .catch(err => {
          console.error(err);
        });
    } else {
      this.flushSamples();
    }
  }

  @action.bound
  flushSamples() {
    this.currentSamples = [];
    this.percievedStress = [];
  }

  @action.bound
  startScan() {
    if (this.scanning) return;

    this.scanning = true;

    this.sdk.on('deviceFound', d => this.addDevice(d));
    this.sdk.startScan();
  }

  @action.bound
  stopScan() {
    if (!this.scanning) return;

    this.scanning = false;

    this.sdk.removeAllListeners('deviceFound');
    this.sdk.stopScan();
  }

  @action.bound
  restartScan() {
    this.stopScan();
    this.startScan();
  }

  @action.bound
  addDevice(device: Device) {
    if (!this.devices.find(d => d.id === device.id)) {
      this.devices.push(device);
    }
  }

  @action.bound
  setDevice(device: Device) {
    if (this.currentDevice) {
      this.sdk.removeDevice(this.currentDevice);
    }

    this.sdk.addDevice(device).then(
      action('setDevice', () => {
        this.devices = this.devices.filter(d => d.id !== device!.id);
        this.currentDevice = device;
      })
    );
  }

  @action.bound
  removeDevice() {
    if (this.currentDevice) {
      this.sdk.removeDevice(this.currentDevice);
      this.currentDevice = undefined;
    }
  }

  @action.bound
  changeStressLevel(level: StressLevels) {
    if (level === this.currentPercievedStressLevel) return;

    const timestamp = Date.now();

    this.percievedStress.push({
      level: this.currentPercievedStressLevel,
      start: this.percievedStressStartedAt,
      end: timestamp
    });

    this.percievedStressStartedAt = timestamp;
    this.currentPercievedStressLevel = level;
  }

  // Private

  private pushChunk() {
    this.chunksQueue.push({
      rrIntervals: this.rrIntervalsBuffer.splice(0),
      pulse: this.pulseBuffer.splice(0),
      gyroscope: this.gyroscopeBuffer.splice(0),
      accelerometer: this.accelerometerBuffer.splice(0),
      timestamp: Date.now()
    });

    this.chunksCollected++;

    if (this.chunksQueue.length === WINDOW_SIZE) {
      if (this.chunksCollected % STEP_SIZE === 0) {
        this.pushSample();
      }

      if (__DEV__ && this.chunksCollected % WINDOW_SIZE === 0) {
        this.persistChunks().catch(err => {
          console.error(err);
        });
      }

      this.chunksQueue.unshift();
    }
  }

  private pushSample() {
    // TODO: calculate activityIndex and HRV
    const hrv = Math.floor(Math.random() * 100);
    const activityIndex = Math.floor(Math.random() * 50);

    const state =
      this.currentPercievedStressLevel === 'medium' ||
      this.currentPercievedStressLevel === 'high';

    this.currentSamples.push({
      state,
      activityIndex,
      hrv,
      stress: this.currentPercievedStressLevel,
      timestamp: Date.now()
    });
  }

  private startHeartrateCollection() {
    this.sdk.on('data', r => {
      try {
        this.processReading(r);
      } catch (e) {
        console.error('Reading is corrupted.', e);
      }
    });

    this.sdk.startCollection();
  }

  private startSensorCollection(sensor: Sensor) {
    sensor({ updateInterval: SENSOR_UPDATE_INTERVAL })
      .then(observable => {
        const isAccelerometer = sensor === Accelerometer;

        if (isAccelerometer) {
          this.accelerometer = observable;
        } else {
          this.gyroscope = observable;
        }

        const actionName = isAccelerometer
          ? 'addAccelerometerData'
          : 'addGyroscopeData';

        const data = isAccelerometer
          ? this.accelerometerBuffer
          : this.gyroscopeBuffer;

        observable.subscribe(
          action(actionName, (d: SensorData) => {
            data.push(d);
          })
        );
      })
      .catch(error => {
        console.error(error);
      });
  }

  private persistChunks() {
    return this.persist(`${Date.now()}.json`, this.chunksQueue.toArray());
  }

  private persistSamples() {
    // TODO: remove unreliable samples
    return this.persist('stress.json', this.currentSamples);
  }

  private persistStress() {
    return this.persist('stress.json', this.percievedStress);
  }

  // Helpers

  private getTextContent(node: Document | Element, tag: string) {
    return node.getElementsByTagName(tag)[0].textContent!.trim();
  }

  private processStream(originalPoints: number[], originalQuality: number[]) {
    // Apply quality and split the stream to points
    const points = chunkArray(originalPoints, 2);
    const quality = chunkArray(originalQuality, 2);
    return points.filter((p, i) => quality[i][0] === 255);
  }

  private persist(path: string, data: any): Promise<void> {
    const folder = `${RNFS.ExternalStorageDirectoryPath}/${APP_NAME}/${
      this.collectionStartedAt
    }`;

    const serialized = toJS(data);

    return RNFS.mkdir(folder).then(() =>
      RNFS.writeFile(
        `${folder}/${path}`,
        JSON.stringify(serialized),
        'ascii' // No idea why utf8 doesn't work here
      )
    );
  }
}
