#import <React/RCTEventEmitter.h>
#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(DeviceKit, RCTEventEmitter)

_RCT_EXTERN_REMAP_METHOD(init, initialize, false)

RCT_EXTERN_METHOD(stopScan)
RCT_EXTERN_METHOD(startScan)

RCT_EXTERN_METHOD(stopCollection)
RCT_EXTERN_METHOD(startCollection)

RCT_EXTERN_METHOD(
  listDevices: (RCTPromiseResolveBlock)resolve
  rejecter: (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  addDevice: (Int)sku
  resolver: (RCTPromiseResolveBlock)resolve
  rejecter: (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(removeDevice: (Int)sku)

RCT_EXTERN_METHOD(cancelPairings)

@end
