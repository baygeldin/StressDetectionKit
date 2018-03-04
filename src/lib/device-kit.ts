import { NativeModules, DeviceEventEmitter } from 'react-native';
import { EventEmitter } from 'events';

export interface Device {
  id: number;
  address: string;
  name: string;
  modelName: string;
  manufacturer: string;
}

export interface Reading {
  data: string;
  source?: Device;
}

type DATA = 'data';
type DEVICE_FOUND = 'deviceFound';
type DEVICE_CONNECTED = 'deviceConnected';
type DEVICE_DISCONNECTED = 'deviceDisconnected';
type AMBIGUOUS_DEVICE_FOUND = 'ambiguousDeviceFound';
type SCAN_FINISHED = 'scanFinished';
type COLLECTION_FINISHED = 'collectionFinished';
type DEVICE_EVENTS =
  | DEVICE_FOUND
  | DEVICE_CONNECTED
  | DEVICE_DISCONNECTED
  | AMBIGUOUS_DEVICE_FOUND;
type STATE_EVENTS = SCAN_FINISHED | COLLECTION_FINISHED;
type EVENTS = DATA | DEVICE_EVENTS | STATE_EVENTS;

const DeviceKitModule = NativeModules.DeviceKit;
const { EVENT_PREFIX, EVENTS } = DeviceKitModule;

interface DeviceKit {
  on(event: DATA, fn: (reading: Reading) => void): this;
  on(event: DEVICE_EVENTS, fn: (device: Device) => void): this;
  on(event: STATE_EVENTS, fn: () => void): this;
  once(event: DATA, fn: (reading: Reading) => void): this;
  once(event: DEVICE_EVENTS, fn: (device: Device) => void): this;
  once(event: STATE_EVENTS, fn: () => void): this;
  emit(event: DATA, data: Reading): boolean;
  emit(event: DEVICE_EVENTS, data: Device): boolean;
  emit(event: STATE_EVENTS): boolean;
  removeListener(event: EVENTS, fn: (...args: any[]) => void): this;
  removeAllListeners(event: EVENTS): this;
}

class DeviceKit extends EventEmitter {
  constructor() {
    super();

    for (let e of EVENTS) {
      DeviceEventEmitter.addListener(`${EVENT_PREFIX}:${e}`, d => {
        d !== null ? this.emit(e, d) : this.emit(e);
      });
    }
  }

  register(key: string): Promise<void> {
    return DeviceKitModule.init(key);
  }

  startScan() {
    DeviceKitModule.startScan();
  }

  stopScan() {
    DeviceKitModule.stopScan();
  }

  addDevice(device: Device): Promise<void> {
    return DeviceKitModule.addDevice(device.id);
  }

  removeDevice(device: Device) {
    DeviceKitModule.removeDevice(device.address);
  }

  fetchDevices(): Promise<Device[]> {
    return DeviceKitModule.listDevices();
  }

  cancelPairings() {
    DeviceKitModule.cancelPairings();
  }

  startCollection() {
    DeviceKitModule.startCollection();
  }

  stopCollection() {
    DeviceKitModule.stopCollection();
  }
}

export default DeviceKit;
