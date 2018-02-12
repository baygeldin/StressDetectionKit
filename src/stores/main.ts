// import remotedev from 'mobx-remotedev';
// import { Device } from 'DeviceKit'

// @remotedev
// class Store {
//   @observable initialized = false;
//   @observable devices: Device[] = [];

//   @action initialize() {
//     this.initialized = true;
//   }

//   @action addDevice(device: Device) {
//     if (!this.devices.find((d) => d.id == device.id)) {
//       this.devices.push(device);
//     }
//   }
// }

// export default new Store();