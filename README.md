# Stress Detection Kit

Stress monitoring app for Android and iOS. This is an experiment in blending together React Native, MedM DeviceKit SDK and some machine learning. In a nutshell it collects data from heart rate monitors and accelerometer, derive useful features (e.g. heart rate variability and activity index) and pass them to a SciKit-Learn trained and TypeScript ported SVM model every 30 seconds. It also shows charts in real-time.

It has some limitations, but it's just an experiment after all. The main takeaway is creating a cross-platform app that supports many medical devices with a pinch of machine learning is not that painful.

Tools used: React Native, MobX, TypeScript, D3, SciKit-Learn, MedM DeviceKit SDK.

## Screenshots

| ![Android Stats](screenshots/android_stats.png?raw=true "Android Stats") | ![Android Sensors](screenshots/android_sensors.png?raw=true "Android Sensors") | ![Android Dev Mode](screenshots/android_dev.png?raw=true "Android Dev Mode") |
|---|---|---|
| ![iOS Home](screenshots/ios_home.png?raw=true "iOS Home") | ![iOS Settings](screenshots/ios_settings.png?raw=true "iOS Settings") | ![iOS Calibration](screenshots/ios_calibration.png?raw=true "iOS Calibration") |

## Science

As Hans Selye defined it, stress is "the non-specific response of the body to any demand placed upon it". So, stress isn't just an abstract term used to describe bad things happening in our lives, but a very real physiological response to literally anything that pulls us away from homeostasis, be it losing your job or winning the lottery. And, of course, stress is not always that bad (in fact it's necessary!), but when it happens too often or if it's too intense, body reserves deplete and it may cause severe health problems in the long term (even cancer).

The main idea of this app is to detect stress situations in real time based on data about the state of our autonomic nervous system (heart rate variability and index of physical activity) and let users decide which stressors should be eliminated. For example, the current model detects social interaction as stress for me, but I decided to spare this one (otherwise I'd live in the forest by now).

Anyway, if you're interested in the medical part of it and understand Russian, you can check out my [graduation thesis](https://github.com/baygeldin/thesis-text). Now let's move on to technical details.

## Interaction with medical sensors

Interaction with medical sensors is done through [MedM DeviceKit SDK](https://www.medm.com/sdk/). Then in order to make it work with React Native [react-native-device-kit](https://github.com/baygeldin/react-native-device-kit) is used (it was extracted from this project). MedM DeviceKit SDK itself is a proprietary library, so I can't include it in the repository and distribute the app bundle with it, but it's required for building the app. However, if you decide to take a similar approach (i.e. React Native and MedM DeviceKit SDK) for creating cross-platform mobile health app, you can make use of this repository to boost up your performance since it contains solutions to any possible pitfalls you might experience. Check out [this article]() for more details.

## Interaction with machine learning

The model is actually trained using Python and SciKit-Learn library, but it's then serialized to JSON in order to use at run-time in JavaScript environment. The algorithm itself is an SVM with a linear kernel (polynomial kernels are prone to overfitting, especially when there's not enough training data which is exactly the case here) and it was ported to TypeScript for the same reason of bridging the gap between Python and JavaScript. Overall the scheme looks like this:

![ML interaction DFD](screenshots/ml_interaction.png?raw=true "ML interaction DFD")

There are several npm scripts that neatly embed in this process:
* `pull-samples` — pulls labeled samples from Android device to PC (each samples collection has its own unique identifier). There are no samples in this repository (it's a private medical data), but the model itself is there and you could as well collect data and train the model yourself.
* `calc-features-meta` — calculates metainformation for features in the feature vector (such as `std` and `mean` in order to use them for feature standardization via z-score). 
* `regenerate-samples` — regenerated samples from raw data post factum when something changes, be it metainformation, baseline values collected during calibration or the feature vector itself.
* `train-model` — trains the model and shows a 3D plot.
* `serialize-model` — serializes the model to JSON. 
* `train-shortcut` — `calc-features-meta`, `regenerate-samples` and `train-model` together.

## How to build

### Android

1. Put `MedMDeviceKitSDK.aar` file into `MedMDeviceKit/`.
2. `npm install`
3. Provide `MEDM_DEVICEKIT_LICENSE_KEY` environment variable with a licence key.
4. Run `npm run android`.
5. Run the app on device via Android Studio.
6. Open `http://localhost:8081/debugger-ui` (optional).

### iOS

1. Put `MedMDeviceKitSDK.framework` to `MedMDeviceKit/`.
2. `npm install`
3. Provide `MEDM_DEVICEKIT_LICENSE_KEY` environment variable with a licence key.
4. Run `npm run ios`.
5. Run the app on device via Xcode.
6. Open `http://<YOUR_IP>:8081/debugger-ui` (optional).

### Tips

* It's a good idea to keep `configure.sh` script around with `MEDM_DEVICEKIT_LICENSE_KEY` env variable and `source configure.sh` when appropriate. Just don't commit it accidentally!
* In order to build a version with a developer screen set `NODE_ENV` env variable to `development`.
* In order to build a production version set `NODE_ENV` env variable to `production` and change build configuration for Android and build scheme for iOS to `release`. Also, for Android you should execute `release-workaround` npm script.
* There's also an accelerated mode for a faster development in which sensors interaction is mocked. Set `ACCELERATED` env variable to `true` in order to enable it.
