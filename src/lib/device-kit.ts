import { EventEmitter } from 'events';
import { NativeEventEmitter, NativeModules } from 'react-native';

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

const deviceKitModule = NativeModules.DeviceKit;
const eventEmitter = new NativeEventEmitter(deviceKitModule);
const { EVENTS } = deviceKitModule;

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

    for (const e of EVENTS) {
      eventEmitter.addListener(e, d => {
        d !== null ? this.emit(e, d) : this.emit(e);
      });
    }
  }

  public register(key: string): Promise<void> {
    return deviceKitModule.initialize(key);
  }

  public startScan(): Promise<void> {
    return deviceKitModule.startScan();
  }

  public stopScan(): Promise<void> {
    return deviceKitModule.stopScan();
  }

  public addDevice(device: Device): Promise<void> {
    return deviceKitModule.addDevice(device.id);
  }

  public removeDevice(device: Device): Promise<void> {
    return deviceKitModule.removeDevice(device.address);
  }

  public fetchDevices(): Promise<Device[]> {
    return deviceKitModule.listDevices();
  }

  public cancelPairings(): Promise<void> {
    return deviceKitModule.cancelPairings();
  }

  public startCollection(): Promise<void> {
    return deviceKitModule.startCollection();
  }

  public stopCollection(): Promise<void> {
    return deviceKitModule.stopCollection();
  }
}

export default DeviceKit;
