import Denque from 'denque';
import {
  ACCELERATED_MODE,
  ACCELEROMETER_ERROR_KEY,
  BASELINE_HEARTRATE_KEY,
  BASELINE_HRV_KEY,
  CALIBRATION_LENGTH,
  CALIBRATION_PADDING,
  CALIBRATION_UPDATE_INTERVAL,
  CHUNK_LENGTH,
  DEFAULT_ACCELEROMETER_ERROR,
  DEFAULT_BASELINE_HEARTRATE,
  DEFAULT_BASELINE_HRV,
  SENSOR_UPDATE_INTERVAL,
  STEP_SIZE,
  STUB_SIZE,
  WINDOW_SIZE
} from 'lib/constants';
import DeviceKit, { Device, Reading } from 'lib/device-kit';
import {
  calcAccelerometerVariance,
  calcHeartRate,
  calcRmssd
} from 'lib/features';
import {
  generateChunk,
  generateChunks,
  generateSample,
  generateSamples
} from 'lib/generators';
import { filterSamples, persist, readingToStreams } from 'lib/helpers';
import { calcSample } from 'lib/sample';
import { getFloat, setFloat } from 'lib/storage';
import {
  Chunk,
  PulseMark,
  RrIntervalMark,
  Sample,
  Sensor,
  StressLevel,
  StressMark
} from 'lib/types';
import { action, computed, observable, runInAction } from 'mobx';
import BackgroundTimer from 'react-native-background-timer';
import {
  Accelerometer,
  SensorData,
  SensorObservable
} from 'react-native-sensors';

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
  @observable currentPercievedStressLevel: StressLevel = 'none';
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
  @observable baselineHrv: number;
  @observable baselineHeartRate: number;
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
  get calibrationTimeRemaining() {
    return CALIBRATION_LENGTH - this.calibrationTimePassed;
  }

  async initialize(key: string) {
    await this.sdk.register(key);
    const devices = await this.sdk.fetchDevices();
    const baselineHrv = await getFloat(BASELINE_HRV_KEY);
    const baselineHeartRate = await getFloat(BASELINE_HEARTRATE_KEY);
    const accelerometerError = await getFloat(ACCELEROMETER_ERROR_KEY);

    runInAction('initialize', () => {
      this.initialized = true;

      if (devices[0]) {
        this.currentDevice = devices[0];
      }

      this.accelerometerError =
        accelerometerError || DEFAULT_ACCELEROMETER_ERROR;
      this.baselineHrv = baselineHrv || DEFAULT_BASELINE_HRV;
      this.baselineHeartRate = baselineHeartRate || DEFAULT_BASELINE_HEARTRATE;
    });
  }

  @action.bound
  startCalibration() {
    if (this.calibrating) return;

    this.calibrating = true;
    this.calibrationTimePassed = 0;
    this.flushBuffers();
    this.startSensors();

    this.timer = BackgroundTimer.setInterval(
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
    BackgroundTimer.clearInterval(this.timer);
  }

  @action.bound
  resetBaselineValues() {
    this.accelerometerError = DEFAULT_ACCELEROMETER_ERROR;
    this.baselineHrv = DEFAULT_BASELINE_HRV;
    this.baselineHeartRate = DEFAULT_BASELINE_HEARTRATE;
    this.persistBaselineValues();
  }

  @action.bound
  startCollection() {
    if (this.collecting) return;

    this.collecting = true;

    const timestamp = Date.now();
    this.currentPercievedStressLevel = 'none';
    this.percievedStressStartedAt = timestamp;
    this.collectionStartedAt = timestamp;
    this.flushChunks();
    this.flushBuffers();
    this.flushSamples();
    this.startSensors();

    this.timer = BackgroundTimer.setInterval(
      () => this.pushChunk(),
      CHUNK_LENGTH
    );

    if (ACCELERATED_MODE) this.stubInitialCollection(STUB_SIZE);
  }

  @action.bound
  stopCollection() {
    if (!this.collecting) return;

    this.collecting = false;
    this.pushStressMark(Date.now());
    this.stopSensors();
    BackgroundTimer.clearInterval(this.timer);

    const { samples, stress } = this.flushSamples();

    if (__DEV__ && !ACCELERATED_MODE) {
      Promise.all([
        this.persist('samples', filterSamples(samples, stress)),
        this.persist('stress', stress),
        this.persist('baselines', {
          baselineHrv: this.baselineHrv,
          baselineHeartRate: this.baselineHeartRate,
          accelerometerError: this.accelerometerError
        })
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
  removeCurrentDevice() {
    if (this.currentDevice) {
      this.sdk.removeDevice(this.currentDevice);
      this.currentDevice = undefined;
    }
  }

  @action.bound
  changeStressLevel(level: StressLevel) {
    if (level === this.currentPercievedStressLevel) return;

    const timestamp = Date.now();

    this.pushStressMark(timestamp);

    this.percievedStressStartedAt = timestamp;
    this.currentPercievedStressLevel = level;
  }

  // Private

  private pushStressMark(timestamp: number) {
    this.percievedStress.push({
      level: this.currentPercievedStressLevel,
      start: this.percievedStressStartedAt,
      end: timestamp
    });
  }

  private startSensors() {
    if (ACCELERATED_MODE) return;
    this.startHeartrateCollection();
    this.startSensorCollection(Accelerometer);
    // this.startSensorCollection(Gyroscope);
  }

  private stopSensors() {
    if (ACCELERATED_MODE) return;
    this.sdk.stopCollection();
    this.accelerometer.stop();
    // this.gyroscope.stop();
  }

  @action.bound
  private pushChunk() {
    const timestamp = Date.now();
    const chunk = ACCELERATED_MODE
      ? generateChunk(timestamp)
      : Object.assign(this.flushBuffers(), { timestamp });
    this.chunksQueue.push(chunk);

    this.chunksCollected++;

    if (this.chunksQueue.length === WINDOW_SIZE) {
      if (this.chunksCollected % STEP_SIZE === 0) {
        this.pushSample(timestamp);
      }

      if (
        __DEV__ &&
        !ACCELERATED_MODE &&
        this.chunksCollected % WINDOW_SIZE === 0
      ) {
        const chunks = this.chunksQueue.toArray();
        this.persist(timestamp.toString(), chunks).catch(err => {
          console.error(err);
        });
      }

      this.chunksQueue.shift();
    }
  }

  @action.bound
  private pushSample(timestamp: number) {
    const sample = ACCELERATED_MODE
      ? generateSample(this.baselineHrv, this.baselineHeartRate, timestamp)
      : calcSample(
          this.chunksQueue.toArray(),
          this.accelerometerError,
          this.baselineHrv,
          this.baselineHeartRate,
          timestamp
        );

    if (__DEV__) {
      sample.stress = this.currentPercievedStressLevel;
      sample.state = ['medium', 'high'].includes(sample.stress);
    }

    this.currentSamples.push(sample);
  }

  @action.bound
  private processReading(reading: Reading) {
    const stream = readingToStreams(reading);
    this.pulseBuffer.push(...stream.pulse);
    this.rrIntervalsBuffer.push(...stream.rrIntervals);
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
      this.baselineHrv = calcRmssd(
        rrIntervals.filter(m => m.timestamp > start)
      );
    }

    if (buffers.pulse.length) {
      this.baselineHeartRate = calcHeartRate(buffers.pulse);
    }

    this.persistBaselineValues();
  }

  private persistBaselineValues() {
    Promise.all([
      setFloat(ACCELEROMETER_ERROR_KEY, this.accelerometerError),
      setFloat(BASELINE_HRV_KEY, this.baselineHrv),
      setFloat(BASELINE_HEARTRATE_KEY, this.baselineHeartRate)
    ]).catch(err => {
      console.error(err);
    });
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
      // gyroscope: this.gyroscopeBuffer.splice(0),
      pulse: this.pulseBuffer.splice(0),
      rrIntervals: this.rrIntervalsBuffer.splice(0)
    };
  }

  @action.bound
  private flushChunks() {
    this.chunksQueue.clear();
    this.chunksCollected = 0;
  }

  private stubInitialCollection(samplesCount: number) {
    const timestamp = Date.now();

    const chunks = generateChunks(WINDOW_SIZE - 1, timestamp);
    this.chunksQueue.splice(0, 0, ...chunks);
    this.chunksCollected = WINDOW_SIZE + (samplesCount - 1) * STEP_SIZE;

    const samples = generateSamples(samplesCount, timestamp);
    this.currentSamples.splice(0, 0, ...samples);
  }

  private persist(title: string, data: any) {
    return persist(this.collectionStartedAt.toString(), `${title}.json`, data);
  }
}
