# Stress Detection Kit

Stress monitoring app for Android and iOS. This is an experiment in blending together React Native, MedM DeviceKit SDK and some machine learning. In a nutshell it collects data from heart rate monitors and accelerometer, derive useful features (e.g. heart rate variability and activity index) and pass them to a SciKit-Learn trained and TypeScript ported SVM model every 30 seconds. It also shows charts in real-time.

It has some limitations, but it's just an experiment after all. The main takeaway is creating a cross-platform app that supports many medical devices with a pinch of machine learning is not that painful. I'll try to polish things out and explain the process in more details **later**.

## MedM DeviceKit SDK

MedM DeviceKit SDK is proprietary, so I can't include it in repository and distribute the app bundle with it, but it's required for building the app. So, the question is "What's the point then? How is it helpful to anyone?". The answer is that you can now purchase MedM DeviceKit SDK and create a mobile health app knowing only JavaScript using [react-native-device-kit](https://github.com/baygeldin/react-native-device-kit). It was extracted from this project and currently only Android is tested (see `extract-wrapper` branch), but once iOS is ready I'll merge it to master.

## How to build

These instructions are only valid for the current master branch.

### Android

1. Put `MedMDeviceKitSDK.aar` file into `android/app/libs`.
2. Provide `MEDM_DEVICEKIT_LICENSE_KEY` environment variable with a licence key.
3. Run `npm run android`.
4. Run the app on device via Android Studio.
5. Open `http://localhost:8081/debugger-ui` (optional).

### iOS

1. Put `MedMDeviceKitSDK.framework` to `ios/StressDetectionKit`.
2. Embed binaries into build ("General" tab in project settings, then "Embedded Binaries").
3. Provide `MEDM_DEVICEKIT_LICENSE_KEY` environment variable with a licence key.
4. Run `npm run ios`.
5. Run the app on device via Xcode.
6. Open `http://<YOUR_IP>:8081/debugger-ui` (optional).
