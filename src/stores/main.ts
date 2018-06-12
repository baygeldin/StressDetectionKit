import Denque from 'denque';
import {
  ACCELERATED_MODE,
  ACCELEROMETER_ERROR_KEY,
  AGE_KEY,
  BASELINE_HEARTRATE_KEY,
  BASELINE_HRV_KEY,
  CALIBRATION_LENGTH,
  CALIBRATION_PADDING,
  CALIBRATION_UPDATE_INTERVAL,
  CHUNK_LENGTH,
  DEFAULT_ACCELEROMETER_ERROR,
  DEFAULT_AGE,
  DEFAULT_BASELINE_HEARTRATE,
  DEFAULT_BASELINE_HRV,
  SENSOR_UPDATE_INTERVAL,
  STEP_SIZE,
  STUB_SIZE,
  SUPPORTED_HRM_IDS,
  TESTING_MODE,
  WINDOW_SIZE
} from 'lib/constants';
import {
  calcAccelerometerVariance,
  calcHeartRate,
  calcRmssd
} from 'lib/features';
import { startForegroundService, stopForegroundService } from 'lib/foreground';
import {
  generateChunk,
  generateChunks,
  generateSample,
  generateSamples
} from 'lib/generators';
import { persist, readingToStreams } from 'lib/helpers';
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
import DeviceKit, { Device, Reading } from 'react-native-device-kit';
import {
  Accelerometer,
  SensorData,
  SensorObservable
} from 'react-native-sensors';

// There's whole lotta unhandled promises there. This is more or less intentional
// MobX is not as handy when actions are asynchronous and also I'm lazy.

export default class Main {
  // State
  @observable public initialized = false;
  @observable public collecting = false;
  @observable public scanning = false;
  @observable public calibrating = false;

  // Devices
  @observable.shallow public devices: Device[] = [];
  @observable.ref public currentDevice?: Device;

  // Perceived stress
  @observable.shallow public percievedStress: StressMark[] = [];
  @observable public currentPercievedStressLevel: StressLevel = 'none';
  @observable public percievedStressStartedAt: number;

  // Collection
  @observable public collectionStartedAt: number;
  @observable.shallow public pulseBuffer: PulseMark[] = [];
  @observable.shallow public rrIntervalsBuffer: RrIntervalMark[] = [];
  @observable.shallow public accelerometerBuffer: SensorData[] = [];
  @observable.shallow public gyroscopeBuffer: SensorData[] = [];

  // Chunks
  @observable public chunksCollected = 0;

  // Samples
  @observable.shallow public currentSamples: Sample[] = [];

  // Calibration
  @observable public baselineHrv: number;
  @observable public baselineHeartRate: number;
  @observable public accelerometerError: number;
  @observable public age: number;
  @observable public calibrationTimePassed: number;

  // Internal logic
  private accelerometer: SensorObservable;
  private gyroscope: SensorObservable;

  private timer: NodeJS.Timer;

  private chunksQueue = new Denque<Chunk>([]);

  constructor(private sdk: DeviceKit) {}

  @computed
  get lastSample() {
    return this.currentSamples[this.currentSamples.length - 1];
  }

  @computed
  get calibrationTimeRemaining() {
    return CALIBRATION_LENGTH - this.calibrationTimePassed;
  }

  public async initialize(key: string) {
    await this.sdk.register(key);
    const devices = await this.sdk.fetchDevices();
    const baselineHrv = await getFloat(BASELINE_HRV_KEY);
    const baselineHeartRate = await getFloat(BASELINE_HEARTRATE_KEY);
    const accelerometerError = await getFloat(ACCELEROMETER_ERROR_KEY);
    const age = await getFloat(AGE_KEY);

    runInAction('initialize', () => {
      this.initialized = true;

      if (devices[0]) {
        this.currentDevice = devices[0];
      }

      this.accelerometerError =
        accelerometerError || DEFAULT_ACCELEROMETER_ERROR;
      this.baselineHrv = baselineHrv || DEFAULT_BASELINE_HRV;
      this.baselineHeartRate = baselineHeartRate || DEFAULT_BASELINE_HEARTRATE;
      this.age = age || DEFAULT_AGE;
    });
  }

  @action.bound
  public startCalibration() {
    if (this.calibrating) return;

    startForegroundService();

    this.calibrating = true;
    this.calibrationTimePassed = 0;
    this.startSensors();

    this.timer = BackgroundTimer.setTimeout(() => {
      this.flushBuffers(); // Flush initial data as it might mess up results
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
    }, CALIBRATION_PADDING);
  }

  @action.bound
  public stopCalibration() {
    if (!this.calibrating) return;

    stopForegroundService();

    this.calibrating = false;
    this.stopSensors();
    BackgroundTimer.clearInterval(this.timer);
  }

  @action.bound
  public resetBaselineValues() {
    this.accelerometerError = DEFAULT_ACCELEROMETER_ERROR;
    this.baselineHrv = DEFAULT_BASELINE_HRV;
    this.baselineHeartRate = DEFAULT_BASELINE_HEARTRATE;
    this.persistBaselineValues();
  }

  @action.bound
  public startCollection() {
    if (this.collecting) return;

    startForegroundService();

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
  public stopCollection() {
    if (!this.collecting) return;

    stopForegroundService();

    this.collecting = false;
    this.pushStressMark(Date.now());
    this.stopSensors();
    BackgroundTimer.clearInterval(this.timer);

    this.flushChunks(); // Keep samples and chunks consistent
    const { samples, stress } = this.flushSamples();

    if ((__DEV__ || TESTING_MODE) && !ACCELERATED_MODE && samples.length > 0) {
      Promise.all([
        this.persist('samples', samples),
        this.persist('stress', stress),
        this.persist('baselines', {
          baselineHrv: this.baselineHrv,
          baselineHeartRate: this.baselineHeartRate,
          accelerometerError: this.accelerometerError,
          age: this.age
        })
      ]);
    }
  }

  @action.bound
  public startScan() {
    if (this.scanning) return;

    this.scanning = true;
    this.devices = [];

    this.sdk.on('deviceFound', d => this.addDevice(d));
    this.sdk.startScan();
  }

  @action.bound
  public stopScan() {
    if (!this.scanning) return;

    this.scanning = false;

    this.sdk.removeAllListeners('deviceFound');
    this.sdk.stopScan();
  }

  @action.bound
  public restartScan() {
    this.stopScan();
    this.startScan();
  }

  @action.bound
  public addDevice(device: Device) {
    if (
      SUPPORTED_HRM_IDS.includes(device.id) &&
      !this.devices.find(d => d.id === device.id)
    ) {
      this.devices.push(device);
    }
  }

  public setDevice(device: Device) {
    this.removeCurrentDevice();

    this.sdk.addDevice(device).then(
      action('setDevice', () => {
        this.currentDevice = device;
      })
    );
  }

  @action.bound
  public removeCurrentDevice() {
    if (this.currentDevice) {
      this.sdk.removeDevice(this.currentDevice);
      this.currentDevice = undefined;
    }
  }

  @action.bound
  public changeStressLevel(level: StressLevel) {
    if (level === this.currentPercievedStressLevel) return;

    const timestamp = Date.now();

    this.pushStressMark(timestamp);

    this.percievedStressStartedAt = timestamp;
    this.currentPercievedStressLevel = level;
  }

  @action.bound
  public setBaselineHrv(value: number) {
    this.baselineHrv = value;
    setFloat(BASELINE_HRV_KEY, this.baselineHrv);
  }

  @action.bound
  public setBaselineHeartRate(value: number) {
    this.baselineHeartRate = value;
    setFloat(BASELINE_HEARTRATE_KEY, this.baselineHeartRate);
  }

  @action.bound
  public setAccelerometerError(value: number) {
    this.accelerometerError = value;
    setFloat(ACCELEROMETER_ERROR_KEY, this.accelerometerError);
  }

  @action.bound
  public setAge(value: number) {
    this.age = value;
    setFloat(AGE_KEY, this.age);
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
        (__DEV__ || TESTING_MODE) &&
        !ACCELERATED_MODE &&
        this.chunksCollected % WINDOW_SIZE === 0
      ) {
        const chunks = this.chunksQueue.toArray();
        this.persist(timestamp.toString(), chunks);
      }

      this.chunksQueue.shift();
    }
  }

  @action.bound
  private pushSample(timestamp: number) {
    let sample: Sample;

    if (ACCELERATED_MODE) {
      sample = generateSample(
        this.baselineHrv,
        this.baselineHeartRate,
        timestamp
      );
    } else if (__DEV__ && !TESTING_MODE) {
      const stress = this.currentPercievedStressLevel;
      sample = calcSample(
        this.chunksQueue.toArray(),
        this.accelerometerError,
        this.baselineHrv,
        this.baselineHeartRate,
        this.age,
        timestamp,
        ['medium', 'high'].includes(stress)
      );
      sample.stress = stress;
    } else {
      sample = calcSample(
        this.chunksQueue.toArray(),
        this.accelerometerError,
        this.baselineHrv,
        this.baselineHeartRate,
        this.age,
        timestamp
      );
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
        if (__DEV__) {
          // tslint:disable-next-line:no-console
          console.error('Reading is corrupted.', e);
        }
      }
    });

    this.sdk.startCollection();
  }

  private startSensorCollection(sensor: Sensor) {
    sensor({ updateInterval: SENSOR_UPDATE_INTERVAL }).then(stream => {
      const isAccelerometer = sensor === Accelerometer;

      if (isAccelerometer) {
        this.accelerometer = stream;
      } else {
        this.gyroscope = stream;
      }

      const actionName = isAccelerometer
        ? 'addAccelerometerData'
        : 'addGyroscopeData';

      const data = isAccelerometer
        ? this.accelerometerBuffer
        : this.gyroscopeBuffer;

      stream.subscribe(
        action(actionName, (d: SensorData) => {
          data.push(d);
        })
      );
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
      this.baselineHrv = calcRmssd(rrIntervals);
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
      setFloat(BASELINE_HEARTRATE_KEY, this.baselineHeartRate),
      setFloat(AGE_KEY, this.age)
    ]);
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
