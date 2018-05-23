import Foundation

@objc(DeviceKit)
class DeviceKit: RCTEventEmitter {
  private typealias `Self` = DeviceKit

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

  override func constantsToExport() -> [AnyHashable : Any] {
    return [
      "EVENT_PREFIX": EVENT_PREFIX,
      "EVENTS": supportedEvents()
    ]
  }

  private var scannerToken: ScannerStopToken? = nil
  private var collectionToken: CollectorStopToken? = nil
  private var cancellationTokens: Array<DeviceAddingCancellationToken> = []

  private var foundDevices: Array<DeviceInfo> = []

  private func emitEvent(_ eventName: String, withData data: Any?) {
    print(Constants.APP_TAG, "Send \(eventName) event.")
    sendEvent(withName: "\(Self.EVENT_PREFIX):\(eventName)", body: data)
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

  func initialize(_ key: String,
    resolver resolve: RCTPromiseResolveBlock,
    rejecter reject: RCTPromiseRejectBlock) {
    do {
      try MedMDeviceKit.init(key)
      resolve(nil)
    } catch let error {
      reject(Self.INIT_ERROR, error)
    }
  }
  
  private class ScanerHandler: NSObject, ScannerCallback {
    let onNewDeviceFoundDelegate: (DeviceInfo) -> ()
    let onAmbiguousDeviceFoundDelegate: (Array<DeviceInfo>) -> ()
    let onScanFinishedDelegate: () -> ()
    
    func onNewDeviceFound(_ device: DeviceInfo!) { onNewDeviceFoundDelegate(device) }
    func onAmbiguousDeviceFound(_ devices: Array<DeviceInfo>) { onAmbiguousDeviceFoundDelegate(devices) }
    func onScanFinished() { onScanFinishedDelegate() }
    
    init(onNewDeviceFound: @escaping (DeviceInfo) -> (),
      onAmbiguousDeviceFound: @escaping (Array<DeviceInfo>) -> (),
      onScanFinished: @escaping () -> ()) {
      self.onNewDeviceFoundDelegate = onNewDeviceFound
      self.onAmbiguousDeviceFoundDelegate = onAmbiguousDeviceFound
      self.onScanFinishedDelegate = onScanFinished
    }
  }

  func startScan(resolver resolve: RCTPromiseResolveBlock, 
    rejecter reject: RCTPromiseRejectBlock) {
    print(Constants.APP_TAG, "Start scanning for devices.")
    scannerToken = MedMDeviceKit.getScanner().start(ScanerHandler(
      onNewDeviceFound: {
        device in
        self.foundDevices.append(device)
        self.emitEvent(Self.DEVICE_FOUND_EVENT, withData: self.mapDeviceDescription(device))
      },
      onAmbiguousDeviceFound: {
        devices in
        for d in devices {
          self.emitEvent(Self.AMBIGUOUS_DEVICE_FOUND_EVENT, withData: self.mapDeviceDescription(d))
        }
      },
      onScanFinished: { self.emitEvent(Self.SCAN_FINISHED_EVENT, withData: nil) }
    ))
    resolve(nil)
  }

  func stopScan(resolver resolve: RCTPromiseResolveBlock, 
    rejecter reject: RCTPromiseRejectBlock) {
    print(Constants.APP_TAG, "Stop scanning for devices.")
    scannerToken?.stopScan()
    resolve(nil)
  }

  private class AddDeviceHandler: AddDeviceCallback {
    let onSuccessDelegate: (DeviceInfo) -> ()
    let onFailureDelegate: (DeviceInfo) -> ()
    
    func onSuccess(_ device: DeviceInfo!) { onSuccessDelegate(device) }
    func onFailure(_ device: DeviceInfo!) { onFailureDelegate(device) }
    
    init(onSuccess: @escaping (DeviceInfo) -> (),
      onFailure: @escaping (DeviceInfo) -> ()) {
      self.onSuccessDelegate = onSuccess
      self.onFailureDelegate = onFailure
    }
  }

  func addDevice(_ sku: Int,
    resolver resolve: RCTPromiseResolveBlock, 
    rejecter reject: RCTPromiseRejectBlock) {
    print(Constants.APP_TAG, "Pair \(device.modelName) device with \(device.sku) SKU.")
    let handler = AddDeviceHandler(
      onSuccess: { resolve(nil) },
      onFailure: {
        device in
        let deviceString = self.mapDeviceDescription(device).toString()
        reject(Self.PAIR_ERROR,
          NSError(userInfo: "The following device could not be paired: \(deviceString)"))
      }
    )
    let device = foundDevices.first{ where: { $0.sku == sku } }!
    cancellationTokens.append(MedMDeviceKit.getDeviceManager().addDevice(handler, device))
  }

  func removeDevice(_ address: String,
    resolver resolve: RCTPromiseResolveBlock, 
    rejecter reject: RCTPromiseRejectBlock) {
    print(Constants.APP_TAG, "Remove device with \(address) address.")
    MedMDeviceKit.getDeviceManager().removeDeviceByAddress(address)
    resolve(nil)
  }

  func listDevices(resolver resolve: RCTPromiseResolveBlock, 
    rejecter reject: RCTPromiseRejectBlock) {
      resolve(MedMDeviceKit.getDeviceManager().devicesList.map { mapDeviceDescription($0) })
  }

  func cancelPairings(resolver resolve: RCTPromiseResolveBlock, 
    rejecter reject: RCTPromiseRejectBlock) {
    print(Constants.APP_TAG, "Cancel all pairings.")
    for token in cancellationTokens { token.cancel() }
    resolve(nil)
  }
  
  private class DataHandler: DataCallback {
    let onNewDataDelegate: (DeviceInfo, String) -> ()
    let onDataCollectionStoppedDelegate: () -> ()
    
    func onNewData(_ device: DeviceInfo!, data: String) { onNewDataDelegate(device, data) }
    func onDataCollectionStopped() { onDataCollectionStoppedDelegate() }
    
    init(onNewData: @escaping (DeviceInfo) -> (),
      onDataCollectionStopped: @escaping (DeviceInfo) -> ()) {
      self.onNewDataDelegate = onNewData
      self.onDataCollectionStoppedDelegate = onDataCollectionStopped
    }
  }

  private class DeviceStatusHandler: DeviceStatusCallback {
    let onConnectedDelegate: (DeviceInfo) -> ()
    let onDisconnectedDelegate: (DeviceInfo) -> ()
    
    func onConnected(_ device: DeviceInfo!) { onConnectedDelegate(device) }
    func onDisconnected(_ device: DeviceInfo!) { onDisconnectedDelegate(device) }
    
    init(onConnected: @escaping (DeviceInfo) -> (),
      onDisconnected: @escaping (DeviceInfo) -> ()) {
      self.onConnectedDelegate = onConnected
      self.onDisconnectedDelegate = onDisconnected
    }
  }

  func startCollection(resolver resolve: RCTPromiseResolveBlock, 
    rejecter reject: RCTPromiseRejectBlock) {
    print(Constants.APP_TAG, "Start data collection.")
    collectionToken = MedMDeviceKit.getCollector().start(DataHandler(
      onNewData: {
        device, data in
        let deviceMap = device != nil ? self.mapDeviceDescription(device) : nil
        self.emitEvent(Self.DATA_EVENT, withData: ["data": data, "device": deviceMap])
      },
      onDataCollectionStopped: { self.emitEvent(Self.COLLECTION_FINISHED_EVENT, withData: nil) }
    ), DeviceStatusHandler(
      onConnected: {
        device in
        self.emitEvent(Self.DEVICE_CONNECTED_EVENT, withData: self.mapDeviceDescription(device))
      },
      onDisconnected: {
        device in
        self.emitEvent(Self.DEVICE_DISCONNECTED_EVENT, withData: self.mapDeviceDescription(device))
      }
    ))
    resolve(nil)
  }

  func stopCollection(resolver resolve: RCTPromiseResolveBlock, 
    rejecter reject: RCTPromiseRejectBlock) {
    print(Constants.APP_TAG, "Stop data collection.")
    collectionToken?.stopCollect()
    resolve(nil)
  }

  override func supportedEvents() -> [String]! {
    return [
      Self.DATA_EVENT, Self.DEVICE_FOUND_EVENT, Self.DEVICE_CONNECTED_EVENT,
      Self.DEVICE_DISCONNECTED_EVENT, Self.AMBIGUOUS_DEVICE_FOUND_EVENT,
      Self.SCAN_FINISHED_EVENT, Self.COLLECTION_FINISHED_EVENT
    ]
  }

  override static func requiresMainQueueSetup() -> Bool {
    return true
  }
}
