import { NativeModules, DeviceEventEmitter } from 'react-native'
import { EventEmitter } from 'events'
import { removeListener, removeAllListeners } from 'cluster';

interface Device {
  id: String,
  address: String,
  name: String,
  modelName: String,
  manufacturer: String
}

interface Reading {
  data: String,
  source: Device
}

type DATA = 'data'
type DEVICE_FOUND = 'deviceFound'
type DEVICE_CONNECTED = 'deviceConnected'
type DEVICE_DISCONNECTED = 'deviceDisconnected'
type AMBIGUOUS_DEVICE_FOUND = 'ambiguousDeviceFound'
type SCAN_FINISHED = 'scanFinished'
type COLLECTION_FINISHED = 'collectionFinished'
type EVENTS = DATA | DEVICE_FOUND | DEVICE_CONNECTED | DEVICE_DISCONNECTED |
  AMBIGUOUS_DEVICE_FOUND | SCAN_FINISHED | COLLECTION_FINISHED

// typeof EVENTS... compare to EVENTS array and throw error if anything.

declare class DeviceKitEmitter extends EventEmitter {
  on(event: DATA, fn: (reading: Reading) => void): this
  on(event: DEVICE_FOUND, fn: (device: Device) => void): this
  on(event: DEVICE_CONNECTED, fn: (device: Device) => void): this
  on(event: DEVICE_DISCONNECTED, fn: (device: Device) => void): this
  on(event: AMBIGUOUS_DEVICE_FOUND, fn: (device: Device) => void): this
  on(event: SCAN_FINISHED, fn: () => void): this
  on(event: COLLECTION_FINISHED, fn: () => void): this
  removeListener(event: EVENTS, fn: (...args: any[]) => void): this
  removeAllListeners(event: EVENTS): this
}

const DeviceKitModule = NativeModules.DeviceKit
const { EVENT_PREFIX, EVENTS } = DeviceKitModule

// Wrapper for native DeviceKit with type declarations
class DeviceKit extends DeviceKitEmitter {
  init(key: string): Promise<void> {
    for (let e of EVENTS) {
      DeviceEventEmitter.addListener(`${EVENT_PREFIX}:${e}`, (d) => {
        d !== null ? this.emit(e, d) : this.emit(e)
      })
    }

    return DeviceKitModule.init(key)
  }

  startScan() {
    DeviceKitModule.startScan()
  }

  stopScan() {
    DeviceKitModule.stopScan()
  }

  addDevice(device: Device): Promise<void> {
    return DeviceKitModule.addDevice(device.address, device.name, device.id)
  }

  removeDevice(device: Device) {
    DeviceKitModule.removeDevice(device.address)
  }

  cancelPairings() {
    DeviceKitModule.cancelPairings()
  }

  startCollection() {
    DeviceKitModule.startCollection()
  }

  stopCollection() {
    DeviceKitModule.stopCollection()
  }
}

export default new DeviceKit()
