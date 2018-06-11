import { AppRegistry, YellowBox } from 'react-native';

import App from './app';

// NOTE: Remove this line when updating React Native to a stable release where it's fixed.
YellowBox.ignoreWarnings(['Warning: isMounted(...) is deprecated']);

AppRegistry.registerComponent('StressDetectionKit', () => App);
