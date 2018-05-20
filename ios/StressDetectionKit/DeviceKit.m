#import "React/RCTBridgeModule.h"
#import "React/RCTEventEmitter.h"

@interface RCT_EXTERN_MODULE(DeviceKit, RCTEventEmitter)

RCT_EXTERN_METHOD(init)

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