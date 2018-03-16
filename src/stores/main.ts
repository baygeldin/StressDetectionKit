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
import ObservableDeque from 'lib/deque';
import { Device, Reading } from 'lib/device-kit';
import DeviceKit from 'lib/device-kit';
import { APP_NAME, WINDOW_SIZE, CHUNK_LENGTH } from 'lib/constants';
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

@remotedev
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

  @observable.ref chunksQueue = new ObservableDeque<Chunk>([]);
  @observable.shallow chunksCollected = 0;

  @observable.shallow currentSamples = [];

  private accelerometer: SensorObservable;
  private gyroscope: SensorObservable;

  constructor(private sdk: DeviceKit) {}

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

    this.sdk.on('data', r => {
      try {
        this.processReading(r);
      } catch (e) {
        console.error('Reading is corrupted.', e);
      }
    });

    const timestamp = Date.now();
    this.stressStartedAt = timestamp;
    this.collectionStartedAt = timestamp;

    this.startSensorCollection(Accelerometer);
    this.startSensorCollection(Gyroscope);

    this.sdk.startCollection();
  }

  private startSensorCollection(sensor: Sensor) {
    sensor({ updateInterval: 1000 })
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
          ? this.accelerometerData
          : this.gyroscopeData;

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
  processReading(reading: Reading) {
    this.heartrateDataRaw.push(reading.data);
    return;

    const doc = new DOMParser().parseFromString(reading.data);

    function getTextContent(nodes: NodeListOf<Element>) {
      return nodes[0].textContent!.trim();
    }

    // According to MedM there is always only one chunk in the reading
    const chunk = doc.getElementsByTagName('chunk')[0];
    const measuredAt = Date.parse(
      getTextContent(doc.getElementsByTagName('measured-at'))
    );
    const start = parseInt(getTextContent(chunk.getElementsByTagName('start')));

    const {
      pulse,
      pulse_quality,
      rr_intervals,
      rr_intervals_quality
    } = JSON.parse(
      getTextContent(chunk.getElementsByTagName('heartrate'))
    ).irregular;

    // Apply quality and split the stream to points
    function processStream(
      originalPoints: number[],
      originalQuality: number[]
    ) {
      const points = chunkArray(originalPoints, 2);
      const quality = chunkArray(originalQuality, 2);
      return points.filter((p, i) => quality[i][0] === 255);
    }

    const pulseStream = processStream(pulse, pulse_quality);
    const rrStream = processStream(rr_intervals, rr_intervals_quality);

    // TODO! Filter points that doesn't have both pulse and RR points!
    for (let i = 0; i < rrStream.length; i++) {
      const offset = rrStream[i][1];
      this.heartrateData.push({
        rr: rrStream[i][0],
        pulse: pulseStream[i][0],
        timestamp: measuredAt + offset * 1000 // bug! wrong timestamp
      });
    }
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
      const timestamp = Date.now();
      this.saveData(timestamp)
        .then(
          action('flushData', () => {
            this.accelerometerData = [];
            this.gyroscopeData = [];
            this.heartrateData = [];
            this.stressData = [];
            this.samplesSaved.push({
              timestamp,
              duration: timestamp - this.collectionStartedAt
            });
          })
        )
        .catch(err => {
          console.error(err);
        });
    }
  }

  private saveData(timestamp: number) {
    const folder = `${
      RNFS.ExternalStorageDirectoryPath
    }/${APP_NAME}/${timestamp}`;

    function write(path: string, data: any): Promise<void> {
      return RNFS.writeFile(
        `${folder}/${path}`,
        JSON.stringify(toJS(data)),
        'ascii' // No idea why utf8 doesn't work here
      );
    }

    return RNFS.mkdir(folder).then(() =>
      Promise.all([
        write('accelerometer.json', this.accelerometerData),
        write('gyroscope.json', this.gyroscopeData),
        write('stress.json', this.stressData),
        write('heartrate.json', this.heartrateData),
        write('raw.json', this.heartrateDataRaw)
      ])
    );
  }

  @action.bound
  startScan() {
    if (this.scanning) return;

    this.sdk.on('deviceFound', d => this.addDevice(d));
    this.sdk.startScan();
    this.scanning = true;
  }

  @action.bound
  stopScan() {
    if (!this.scanning) return;

    this.sdk.removeAllListeners('deviceFound');
    this.sdk.stopScan();
    this.scanning = false;
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

  setDevice(device: Device | number) {
    if (this.currentDevice) {
      this.sdk.removeDevice(this.currentDevice);
    }

    const newDevice =
      typeof device === 'number'
        ? this.devices.find(d => d.id === device)
        : device;

    if (newDevice) {
      this.sdk.addDevice(newDevice).then(
        action('setDevice', () => {
          this.devices = this.devices.filter(d => d.id !== newDevice!.id);
          this.currentDevice = newDevice;
        })
      );
    }
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
    if (level === this.currentStressLevel) return;

    const start = this.stressStartedAt;
    const end = Date.now();
    this.stressStartedAt = end;
    const previousLevel = this.currentStressLevel;
    this.currentStressLevel = level;
    this.stressData.push({ level: previousLevel, start, end });
  }
}
