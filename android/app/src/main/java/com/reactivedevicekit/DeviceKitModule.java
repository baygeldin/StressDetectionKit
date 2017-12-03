package com.reactivedevicekit;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;

import java.util.Map;
import java.util.HashMap; 

import com.medm.devicekit.IDeviceDescription;
import com.medm.devicekit.MedMDeviceKit;

public class DeviceKitModule extends ReactContextBaseJavaModule {

  private static final String MODE = "DEMO";

  public DeviceKitModule(ReactApplicationContext reactContext) {
    super(reactContext);
  }

  @Override
  public String getName() {
    return "DeviceKit";
  }

  @Override
  public Map<String, Object> getConstants() {
    final Map<String, Object> constants = new HashMap<>();
    constants.put(MODE, DeviceKitModule.MODE);
    return constants;
  }

  @ReactMethod
  public void getDevices(Promise promise) {
    promise.resolve(MedMDeviceKit.class.getSimpleName());
  }
}
