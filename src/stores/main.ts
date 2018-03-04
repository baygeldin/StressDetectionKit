import remotedev from 'mobx-remotedev';
import { observable, action, toJS } from 'mobx';
import {
  Accelerometer,
  Gyroscope,
  SensorData,
  SensorObservable
} from 'react-native-sensors';
import RNFS from 'react-native-fs';
import { Device, Reading } from 'lib/device-kit';
import DeviceKit from 'lib/device-kit';
import { APP_NAME } from 'lib/constants';

type StressLevels = 'low' | 'medium' | 'high';

interface StressMark {
  timestamp: number;
  level: StressLevels;
}

type Sensor = typeof Accelerometer | typeof Gyroscope;

@remotedev
export default class Main {
  @observable initialized = false;
  @observable collecting = false;
  @observable scanning = false;
  @observable.shallow devices: Device[] = [];
  @observable.ref currentDevice?: Device;
  @observable.shallow readings: Reading[] = [];
  @observable.shallow accelerometerData: SensorData[] = [];
  @observable.shallow gyroscopeData: SensorData[] = [];
  @observable.shallow stressMarks: StressMark[] = [];

  private accelerometer: SensorObservable;
  private gyroscope: SensorObservable;

  constructor(private sdk: DeviceKit) {}

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

  @action
  startCollection() {
    if (this.collecting) return;

    this.collecting = true;

    this.sdk.on('data', r => this.addReading(r));
    this.sdk.startCollection();

    this.startSensorCollection(Accelerometer);
    this.startSensorCollection(Gyroscope);
  }

  private startSensorCollection(sensor: Sensor) {
    sensor({ updateInterval: 500 })
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

  @action
  addReading(reading: Reading) {
    this.readings.push(reading);
  }

  @action
  stopCollection() {
    if (!this.collecting) return;

    this.collecting = false;
    this.sdk.stopCollection();
    this.accelerometer.stop();
    this.gyroscope.stop();

    if (__DEV__) {
      this.saveData()
        .then(() => {
          console.log('Stream data is written.');
        })
        .catch(err => {
          console.error(err);
        });
    }
  }

  private saveData() {
    const timestamp = Date.now();
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
        write('stress.json', this.stressMarks),
        write('heartrate.json', this.readings.map(r => r.data))
      ])
    );
  }

  @action
  startScan() {
    if (this.scanning) return;

    this.sdk.on('deviceFound', d => this.addDevice(d));
    this.sdk.startScan();
    this.scanning = true;
  }

  @action
  stopScan() {
    if (!this.scanning) return;

    this.sdk.removeAllListeners('deviceFound');
    this.sdk.stopScan();
    this.scanning = false;
  }

  restartScan() {
    this.stopScan();
    this.startScan();
  }

  @action
  addDevice(device: Device) {
    if (!this.devices.find(d => d.id === device.id)) {
      this.devices.push(device);
    }
  }

  setDevice(device: Device | number) {
    if (this.currentDevice) {
      this.sdk.removeDevice(this.currentDevice);
    }

    let newDevice =
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

  @action
  removeDevice() {
    if (this.currentDevice) {
      this.sdk.removeDevice(this.currentDevice);
      this.currentDevice = undefined;
    }
  }

  @action
  addStressMark(level: StressLevels) {
    this.stressMarks.push({ level, timestamp: Date.now() });
  }
}
