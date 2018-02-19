import remotedev from 'mobx-remotedev';
import { observable, action } from 'mobx';
import { Device, Reading } from 'lib/device-kit';
import DeviceKit from 'lib/device-kit';

@remotedev
export default class Main {
  @observable initialized = false;
  @observable collecting = false;
  @observable scanning = false;
  @observable.shallow devices: Device[] = [];
  @observable.ref currentDevice?: Device;
  @observable.shallow readings: Reading[] = [];

  constructor(private sdk: DeviceKit) {}

  initialize(key: string) {
    this.sdk.register(key).then(
      action('initialize', () => {
        this.initialized = true;
      })
    );
  }

  @action
  startCollection() {
    if (this.collecting) return;

    this.collecting = true;
    this.sdk.on('data', r => this.addReading(r));
    this.sdk.startCollection();
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
  }

  startScan() {
    if (this.scanning) return;

    this.sdk.on('deviceFound', d => this.addDevice(d));
    this.sdk.startScan();
    this.scanning = true;
  }

  stopScan() {
    if (!this.scanning) return;

    this.sdk.removeAllListeners('deviceFound');
    this.sdk.stopScan();
    this.scanning = false;
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
          this.currentDevice = newDevice;
        })
      );
    }
  }
}
