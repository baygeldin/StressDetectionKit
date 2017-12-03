package com.reactivedevicekit;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.bridge.WritableNativeArray;

import java.util.Map;
import java.util.HashMap; 
import java.util.ArrayList;
import java.util.Arrays;

import com.medm.devicekit.IDeviceDescription;
import com.medm.devicekit.MedMDeviceKit;
import com.medm.devicekit.MedMDeviceKitNotInitializedException;

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
    // promise.resolve(MedMDeviceKit.class.getSimpleName());
    ArrayList<IDeviceDescription> devices = new ArrayList<IDeviceDescription>();
    WritableNativeArray serialized = new WritableNativeArray();

    try {
      devices = new ArrayList<IDeviceDescription>(Arrays.asList(MedMDeviceKit.getDeviceManager().getDevicesList()));
    } catch (MedMDeviceKitNotInitializedException ex)
    {
      ex.printStackTrace();
    }

    for (IDeviceDescription device : devices) {
      WritableNativeMap hash = new WritableNativeMap();
      hash.putString("MAC", device.getAddress());
      hash.putString("Name", device.getDBTitle());
      serialized.pushMap(hash);
    }

    promise.resolve(serialized);
  }
}
