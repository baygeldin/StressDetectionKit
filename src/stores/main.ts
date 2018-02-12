import remotedev from 'mobx-remotedev';
import { observable, action } from 'mobx';
import { Device } from 'lib/device-kit';

@remotedev
export default class {
  @observable initialized = false;
  @observable devices: Device[] = [];

  @action initialize() {
    this.initialized = true;
  }

  @action addDevice(device: Device) {
    if (!this.devices.find((d) => d.id == device.id)) {
      this.devices.push(device);
    }
  }
}