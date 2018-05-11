package com.stressdetectionkit;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.location.Location;
import android.support.v4.content.LocalBroadcastManager;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class TimerModule extends ReactContextBaseJavaModule {
    public TimerModule(ReactApplicationContext reactContext) {
        super(reactContext);
        BroadcastReceiver geoLocationReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                TimerModule.this.sendEvent("hi");
            }
        };
        LocalBroadcastManager.getInstance(getReactApplicationContext()).registerReceiver(geoLocationReceiver, new IntentFilter("TimerUpdate"));
    }

    @Override
    public String getName() {
        return "Timer";
    }

    @ReactMethod
    public void startService(Promise promise) {
        String result = "Success";
        try {
            Intent intent = new Intent(TimerService.FOREGROUND);
            intent.setClass(this.getReactApplicationContext(), TimerService.class);
            getReactApplicationContext().startService(intent);
        } catch (Exception e) {
            promise.reject(e);
            return;
        }
        promise.resolve(result);
    }

    @ReactMethod
    public void stopService(Promise promise) {
        String result = "Success";
        try {
            Intent intent = new Intent(TimerService.FOREGROUND);
            intent.setClass(this.getReactApplicationContext(), TimerService.class);
            this.getReactApplicationContext().stopService(intent);
        } catch (Exception e) {
            promise.reject(e);
            return;
        }
        promise.resolve(result);
    }

    private void sendEvent(String message) {
        WritableMap map = Arguments.createMap();
        map.putString("test", message);

        getReactApplicationContext().getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("updateTimer", map);
    }
}