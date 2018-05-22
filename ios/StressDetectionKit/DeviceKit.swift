import Foundation

@objc(DeviceKit)
class DeviceKit: RCTEventEmitter, ScannerCallback, DataCallback {
  static let MODULE_NAME = "DeviceKit"

  static let INIT_ERROR = "INIT_ERROR"
  static let PAIR_ERROR = "PAIR_ERROR"

  static let EVENT_PREFIX = MODULE_NAME
  static let DATA_EVENT = "data"
  static let DEVICE_FOUND_EVENT = "deviceFound"
  static let DEVICE_CONNECTED_EVENT = "deviceConnected"
  static let DEVICE_DISCONNECTED_EVENT = "deviceDisconnected"
  static let AMBIGUOUS_DEVICE_FOUND_EVENT = "ambiguousDeviceFound"
  static let SCAN_FINISHED_EVENT = "scanFinished"
  static let COLLECTION_FINISHED_EVENT = "collectionFinished"

  override func constantsToExport() -> [AnyHashable : Any]! {
    return [
      "EVENT_PREFIX": EVENT_PREFIX,
      "EVENTS": supportedEvents()
    ]
  }

  private var scannerToken: ScannerStopToken = nil
  private var collectionToken: CollectorStopToken = nil
  private var cancellationTokens: Array<DeviceAddingCancellationToken> = []

  private var foundDevices: Array<DeviceInfo> = []

  private func emitEvent(_ eventName: String, withData data: Any?) {
    print(Constants.APP_TAG, "Send \(eventName) event.")
    sendEvent(withName: "\(DeviceKit.EVENT_PREFIX):\(eventName)", body: data)
  }

  private func mapDeviceDescription(_ device: DeviceInfo) -> [String: Any] {
    return [
      "id": device.sku,
      "address": device.address,
      "name": device.name,
      "modelName": device.modelName,
      "manufacturer": device.manufacturer
    ]
  }

  func initialize(_ key: String, resolver resolve: RCTPromiseResolveBlock,
    rejecter reject: RCTPromiseRejectBlock) {
    do {
      try MedMDeviceKit.init(key)
      resolve(nil)
    } catch let error {
      reject(INIT_ERROR, error)
    }
  }

  func startScan() {
    print(Constants.APP_TAG, "Start scanning for devices.")
    scannerToken = MedMDeviceKit.getScanner().start(ScanerHandler(
      onNewDeviceFoundDelegate: {
        device in
        self.foundDevices.append(device)
        self.emitEvent(DeviceKit.DEVICE_FOUND_EVENT, withData: self.mapDeviceDescription(device))
      },
      onAmbiguousDeviceFoundDelegate: {
        devices in
        for d in devices {
          self.emitEvent(DeviceKit.AMBIGUOUS_DEVICE_FOUND_EVENT, withData: self.mapDeviceDescription(d))
        }
      },
      onScanFinishedDelegate: { self.emitEvent(DeviceKit.SCAN_FINISHED_EVENT, withData: nil) }
    ))
  }

  func stopScan() {
    print(Constants.APP_TAG, "Stop scanning for devices.")
    scannerToken?.stopScan()
  }
  
  class ScanerHandler: NSObject, ScannerCallback {
    var onNewDeviceFoundDelegate: (DeviceInfo) -> ()
    var onAmbiguousDeviceFoundDelegate: (Array<DeviceInfo>) -> ()
    var onScanFinishedDelegate: () -> ()
    
    func onNewDeviceFound(_ device: DeviceInfo!) { onNewDeviceFoundDelegate(device) }
    func onAmbiguousDeviceFound(_ devices: Array<DeviceInfo>) { onAmbiguousDeviceFoundDelegate(devices) }
    func onScanFinished() { onScanFinishedDelegate() }
    
    init(onNewDeviceFoundDelegate: @escaping (DeviceInfo) -> (),
      onAmbiguousDeviceFoundDelegate: @escaping (Array<DeviceInfo>) -> (),
      onScanFinishedDelegate: @escaping () -> ()) {
      self.onNewDeviceFoundDelegate = onNewDeviceFoundDelegate
      self.onAmbiguousDeviceFoundDelegate = onAmbiguousDeviceFoundDelegate
      self.onScanFinishedDelegate = onScanFinished
    }
  }

  class AddDeviceHandler: AddDeviceCallback {
    var obj: DeviceKit
    var resolve: RCTPromiseResolveBlock
    var reject: RCTPromiseRejectBlock

    init(object: DeviceKit, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
      self.obj = object
      self.reject = reject
      self.resolve = resolve
    }

    func onFailure(device: DeviceInfo) {
      let deviceString = obj.mapDeviceDescription(device).toString()
      self.reject(PAIR_ERROR,
        NSError(userInfo: "The following device could not be paired: \(deviceString)"))
    }

    func onSuccess(device: DeviceInfo) {
      self.resolve(nil)
    }
  }

  func addDevice(_ sku: Int, resolver resolve: RCTPromiseResolveBlock, 
    rejecter reject: RCTPromiseRejectBlock) {
    let handler = AddDeviceHandler(self, resolve, reject)
    print(Constants.APP_TAG, "Pair \(device.modelName) device with \(device.sku) SKU.")
    cancellationTokens.append(MedMDeviceKit.getDeviceManager().addDevice(handler, device))
  }

  func removeDevice(address: String) {
    print(Constants.APP_TAG, "Remove device with \(address) address.")
    MedMDeviceKit.getDeviceManager().removeDevice(address)
  }

  func listDevices(resolver resolve: RCTPromiseResolveBlock, 
    rejecter reject: RCTPromiseRejectBlock) {
      resolve([MedMDeviceKit.getDeviceManager().devicesList.map { mapDeviceDescription($0) }])
  }

  func cancelPairings() {
    print(Constants.APP_TAG, "Cancel all pairings.")
    for token in cancellationTokens { token.cancel() }
  }

  func onNewData(device: DeviceInfo, data: String) {
    let deviceMap = device != nil ? mapDeviceDescription(device) : nil
    emitEvent(DATA_EVENT, ["data": data, "device": deviceMap])
  }

  func onDataCollectionStopped() {
    emitEvent(COLLECTION_FINISHED_EVENT, nil)
  }

  func onConnected(device: DeviceInfo) {
    emitEvent(DEVICE_CONNECTED_EVENT, mapDeviceDescription(device))
  }

  func onDisconnected(device: DeviceInfo) {
    emitEvent(DEVICE_DISCONNECTED_EVENT, mapDeviceDescription(device))
  }

  func startCollection() {
    print(Constants.APP_TAG, "Start data collection.")
    collectionToken = MedMDeviceKit.getCollector().start(self, self)
  }

  func stopCollection() {
    print(Constants.APP_TAG, "Stop data collection.")
    collectionToken?.stopCollect()
  }

  override func supportedEvents() -> [String]! {
    return [
      DATA_EVENT, DEVICE_FOUND_EVENT, DEVICE_CONNECTED_EVENT,
      DEVICE_DISCONNECTED_EVENT, AMBIGUOUS_DEVICE_FOUND_EVENT,
      SCAN_FINISHED_EVENT, COLLECTION_FINISHED_EVENT
    ]
  }

  override static func requiresMainQueueSetup() -> Bool {
    return true
  }
}
