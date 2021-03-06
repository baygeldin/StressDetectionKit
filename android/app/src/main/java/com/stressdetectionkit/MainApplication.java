package com.stressdetectionkit;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.medm.reactnative.RNDeviceKitPackage;
import com.ocetnik.timer.BackgroundTimerPackage;
import com.rnfs.RNFSPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.oblador.vectoricons.VectorIconsPackage;
import com.sensors.RNSensorsPackage;
import com.horcrux.svg.SvgPackage;
import org.devio.rn.splashscreen.SplashScreenReactPackage;
import com.solinor.bluetoothstatus.RNBluetoothManagerPackage;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

    private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
        @Override
        public boolean getUseDeveloperSupport() {
            return BuildConfig.DEBUG;
        }

        @Override
        protected List<ReactPackage> getPackages() {
            return Arrays.<ReactPackage>asList(
                    new MainReactPackage(),
                    new RNDeviceKitPackage(),
                    new BackgroundTimerPackage(),
                    new RNFSPackage(),
                    new VectorIconsPackage(),
                    new RNSensorsPackage(),
                    new SvgPackage(),
                    new SplashScreenReactPackage(),
                    new ForegroundPackage(),
                    new RNBluetoothManagerPackage()
            );
        }

        @Override
        protected String getJSMainModuleName() {
            return "index";
        }
    };

    @Override
    public ReactNativeHost getReactNativeHost() {
        return mReactNativeHost;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        SoLoader.init(this, /* native exopackage */ false);
    }
}
