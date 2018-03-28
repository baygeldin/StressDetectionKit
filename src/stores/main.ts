import { observable, action, computed, toJS, runInAction } from 'mobx';
import {
  Accelerometer,
  Gyroscope,
  SensorData,
  SensorObservable
} from 'react-native-sensors';
import RNFS from 'react-native-fs';
import { DOMParser } from 'xmldom';
import Denque from 'denque';
import { clearInterval, setInterval } from 'timers';
import { Device, Reading } from 'lib/device-kit';
import DeviceKit from 'lib/device-kit';
import {
  APP_NAME,
  WINDOW_SIZE,
  STEP_SIZE,
  CHUNK_LENGTH,
  SENSOR_UPDATE_INTERVAL,
  CALIBRATION_LENGTH,
  CALIBRATION_UPDATE_INTERVAL,
  CALIBRATION_PADDING,
  DEFAULT_ACCELEROMETER_ERROR,
  DEFAULT_BASELINE_RMSSD,
  ACCELEROMETER_ERROR_KEY,
  BASELINE_RMSSD_KEY
} from 'lib/constants';
import { chunkBySize } from 'lib/helpers';
import {
  Chunk,
  Sample,
  StressLevels,
  PulseMark,
  RrIntervalMark,
  StressMark,
  Sensor
} from 'lib/types';
import { calcAccelerometerVariance, calcRmssd } from 'lib/features';
import { getFloat, setFloat } from 'lib/storage';

export default class Main {
  // State
  @observable initialized = false;
  @observable collecting = false;
  @observable scanning = false;
  @observable calibrating = false;

  // Devices
  @observable.shallow devices: Device[] = [];
  @observable.ref currentDevice?: Device;

  // Perceived stress
  @observable.shallow percievedStress: StressMark[] = [];
  @observable currentPercievedStressLevel: StressLevels = 'none';
  @observable percievedStressStartedAt: number;

  // Collection
  @observable collectionStartedAt: number;
  @observable.shallow pulseBuffer: PulseMark[] = [];
  @observable.shallow rrIntervalsBuffer: RrIntervalMark[] = [];
  @observable.shallow accelerometerBuffer: SensorData[] = [];
  @observable.shallow gyroscopeBuffer: SensorData[] = [];

  // Chunks
  private chunksQueue = new Denque<Chunk>([]);
  @observable chunksCollected = 0;

  // Samples
  @observable.shallow currentSamples: Sample[] = [];

  // Calibration
  @observable baselineRmssd: number;
  @observable accelerometerError: number;
  @observable calibrationTimePassed: number;

  // Internal logic
  private accelerometer: SensorObservable;
  private gyroscope: SensorObservable;

  private timer: NodeJS.Timer;

  constructor(private sdk: DeviceKit) {}

  @computed
  get lastSample() {
    return this.currentSamples[this.currentSamples.length - 1];
  }

  @computed
  get calibrationProgress() {
    return this.calibrationTimePassed / CALIBRATION_LENGTH;
  }

  @computed
  get calibrationTimeRemaining() {
    return CALIBRATION_LENGTH - this.calibrationTimePassed;
  }

  async initialize(key: string) {
    await this.sdk.register(key);
    const devices = await this.sdk.fetchDevices();
    const baselineRmssd = await getFloat(BASELINE_RMSSD_KEY);
    const accelerometerError = await getFloat(ACCELEROMETER_ERROR_KEY);

    runInAction('initialize', () => {
      this.initialized = true;

      if (devices[0]) {
        this.currentDevice = devices[0];
      }

      this.accelerometerError =
        accelerometerError || DEFAULT_ACCELEROMETER_ERROR;
      this.baselineRmssd = baselineRmssd || DEFAULT_BASELINE_RMSSD;
    });
  }

  @action.bound
  startCalibration() {
    if (this.calibrating) return;

    this.calibrating = true;
    this.calibrationTimePassed = 0;
    this.flushBuffers();
    this.startSensors();

    this.timer = setInterval(
      action('updateCalibrationProgress', () => {
        if (!this.calibrating) return;

        this.calibrationTimePassed += CALIBRATION_UPDATE_INTERVAL;
        if (this.calibrationTimePassed >= CALIBRATION_LENGTH) {
          this.stopCalibration();
          this.computeBaselineValues();
        }
      }),
      CALIBRATION_UPDATE_INTERVAL
    );
  }

  @action.bound
  stopCalibration() {
    if (!this.calibrating) return;

    this.calibrating = false;
    this.stopSensors();
    clearInterval(this.timer);
  }

  @action.bound
  resetBaselineValues() {
    this.accelerometerError = DEFAULT_ACCELEROMETER_ERROR;
    this.baselineRmssd = DEFAULT_BASELINE_RMSSD;
    this.persistBaselineValues();
  }

  @action.bound
  startCollection() {
    if (this.collecting) return;

    this.collecting = true;

    const timestamp = Date.now();
    this.percievedStressStartedAt = timestamp;
    this.collectionStartedAt = timestamp;
    this.flushBuffers();
    this.startSensors();
    this.timer = setInterval(() => this.pushChunk(), CHUNK_LENGTH);
  }

  @action.bound
  stopCollection() {
    if (!this.collecting) return;

    this.collecting = false;
    this.changeStressLevel('none');
    this.stopSensors();
    clearInterval(this.timer);

    const { samples, stress } = this.flushSamples();

    if (__DEV__) {
      Promise.all([
        this.persistSamples(samples),
        this.persistStress(stress)
      ]).catch(err => {
        console.error(err);
      });
    }
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

  private startSensors() {
    this.startSensorCollection(Accelerometer);
    this.startSensorCollection(Gyroscope);
    this.startHeartrateCollection();
  }

  private stopSensors() {
    this.sdk.stopCollection();
    this.accelerometer.stop();
    this.gyroscope.stop();
  }

  @action.bound
  private pushChunk() {
    this.chunksQueue.push(
      Object.assign(this.flushBuffers(), { timestamp: Date.now() })
    );

    this.chunksCollected++;

    if (this.chunksQueue.length === WINDOW_SIZE) {
      if (this.chunksCollected % STEP_SIZE === 0) {
        this.pushSample();
      }

      if (__DEV__ && this.chunksCollected % WINDOW_SIZE === 0) {
        this.persistChunks(this.chunksQueue.toArray()).catch(err => {
          console.error(err);
        });
      }

      this.chunksQueue.shift();
    }
  }

  @action.bound
  private pushSample() {
    // TODO: calculate activityIndex and HRV
    const rmssd = Math.floor(Math.random() * 100);
    const activityIndex = Math.floor(Math.random() * 50);
    const rmssdDiff = rmssd - this.baselineRmssd;

    const state =
      this.currentPercievedStressLevel === 'medium' ||
      this.currentPercievedStressLevel === 'high';

    this.currentSamples.push({
      state,
      activityIndex,
      rmssd,
      rmssdDiff,
      stress: this.currentPercievedStressLevel,
      timestamp: Date.now()
    });
  }

  @action.bound
  private processReading(reading: Reading) {
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

  @action.bound
  private computeBaselineValues() {
    const buffers = this.flushBuffers();

    if (buffers.accelerometer.length) {
      const error = calcAccelerometerVariance(buffers.accelerometer);
      this.accelerometerError = error;
    }

    if (buffers.rrIntervals.length) {
      const rrIntervals = buffers.rrIntervals.sort(
        (a, b) => a.timestamp - b.timestamp
      );
      const lastTimestamp = rrIntervals[rrIntervals.length - 1].timestamp;
      const start = lastTimestamp - CALIBRATION_LENGTH + CALIBRATION_PADDING;
      this.baselineRmssd = calcRmssd(
        rrIntervals.filter(m => m.timestamp > start)
      );
    }

    this.persistBaselineValues();
  }

  private persistBaselineValues() {
    Promise.all([
      setFloat(ACCELEROMETER_ERROR_KEY, this.accelerometerError),
      setFloat(BASELINE_RMSSD_KEY, this.baselineRmssd)
    ]).catch(err => {
      console.error(err);
    });
  }

  private persistChunks(chunks: Chunk[]) {
    return this.persist(`${Date.now()}.json`, chunks);
  }

  private persistSamples(samples: Sample[]) {
    // TODO: remove unreliable samples
    return this.persist('stress.json', samples);
  }

  private persistStress(stress: StressMark[]) {
    return this.persist('stress.json', stress);
  }

  @action.bound
  private flushSamples() {
    return {
      samples: this.currentSamples.splice(0),
      stress: this.percievedStress.splice(0)
    };
  }

  @action.bound
  private flushBuffers() {
    return {
      accelerometer: this.accelerometerBuffer.splice(0),
      gyroscope: this.gyroscopeBuffer.splice(0),
      pulse: this.pulseBuffer.splice(0),
      rrIntervals: this.rrIntervalsBuffer.splice(0)
    };
  }

  // Helpers

  private getTextContent(node: Document | Element, tag: string) {
    return node.getElementsByTagName(tag)[0].textContent!.trim();
  }

  private processStream(originalPoints: number[], originalQuality: number[]) {
    // Apply quality and split the stream to points
    const points = chunkBySize(originalPoints, 2);
    const quality = chunkBySize(originalQuality, 2);
    return points.filter((p, i) => quality[i][0] === 255);
  }

  private persist(path: string, data: any): Promise<void> {
    const folder = `${RNFS.ExternalStorageDirectoryPath}/${APP_NAME}/${
      this.collectionStartedAt
    }`;

    return RNFS.mkdir(folder).then(() =>
      RNFS.writeFile(
        `${folder}/${path}`,
        JSON.stringify(data),
        'ascii' // No idea why utf8 doesn't work here
      )
    );
  }
}
