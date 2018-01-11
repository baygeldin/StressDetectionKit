import { NativeModules, DeviceEventEmitter } from 'react-native'
import { EventEmitter } from 'events'

export interface Device {
  id: String,
  address: String,
  name: String,
  modelName: String,
  manufacturer: String
}

export interface Reading {
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
type DEVICE_EVENTS = DEVICE_FOUND | DEVICE_CONNECTED |
  DEVICE_DISCONNECTED | AMBIGUOUS_DEVICE_FOUND
type STATE_EVENTS = SCAN_FINISHED | COLLECTION_FINISHED
type EVENTS = DATA | DEVICE_EVENTS | STATE_EVENTS

const DeviceKitModule = NativeModules.DeviceKit
const { EVENT_PREFIX, EVENTS } = DeviceKitModule

// Wrapper for native DeviceKit with type declarations
class DeviceKit extends EventEmitter {
  on(event: DATA, fn: (reading: Reading) => void): this
  on(event: DEVICE_EVENTS, fn: (device: Device) => void): this
  on(event: STATE_EVENTS, fn: () => void): this
  on(event: string, fn: (...args: any[]) => void) {
    return super.on(event, fn)
  }

  removeListener(event: EVENTS, fn: (...args: any[]) => void) {
    return super.removeListener(event, fn)
  }

  removeAllListeners(event: EVENTS) {
    return super.removeAllListeners(event)
  }

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
