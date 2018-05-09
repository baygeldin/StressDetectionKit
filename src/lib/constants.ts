/// Common

export const APP_NAME = 'Stress Detection Kit';
export const DATE_FORMAT = 'h:mm MMMM Do';

/// Developer

export const ACCELERATED_MODE = !!process.env.ACCELERATED;
export const TESTING_MODE = !!process.env.TESTING;
export const STUB_SIZE = 5; // in samples

/// Business logic

// Beets BLU, Zephyr Smart, Mio Global, Mobile Action
export const SUPPORTED_HRM_IDS = [59, 46, 110, 112];

// Samples config
export const CHUNK_LENGTH = ACCELERATED_MODE ? 1000 : 10000; // in ms
export const STEP_SIZE = 3; // in chunks
export const WINDOW_SIZE = 30; // in chunks
export const STEP_LENGTH = STEP_SIZE * CHUNK_LENGTH;
export const WINDOW_LENGTH = WINDOW_SIZE * CHUNK_LENGTH;

// Calibration config
export const CALIBRATION_PADDING = ACCELERATED_MODE ? 1000 : 5000;
export const CALIBRATION_LENGTH =
  CHUNK_LENGTH * (ACCELERATED_MODE ? 2 : WINDOW_SIZE);
export const CALIBRATION_UPDATE_INTERVAL = ACCELERATED_MODE ? 500 : 3000; // in ms

// Accerelrometer and gyroscope config
export const SENSOR_UPDATE_INTERVAL = 1000; // in ms

// Default values
export const DEFAULT_BASELINE_HRV = 40; // in ms
export const DEFAULT_BASELINE_HEARTRATE = 60; // in bpm
export const DEFAULT_ACCELEROMETER_ERROR = 0.025; // in m/s^2

/// Storage

export const BASELINE_HRV_KEY = 'baselineHrv';
export const BASELINE_HEARTRATE_KEY = 'baselineHeartRate';
export const ACCELEROMETER_ERROR_KEY = 'accelerometerError';

/// Views

// Charts
export const CHART_HEIGHT = 150;
export const DEFAULT_HRV_MIN = 30;
export const DEFAULT_HEARTRATE_MIN = 50;
export const DEFAULT_ACTIVITY_MIN = 0.5;

// Chunks required to start showing statistics
export const CHUNKS_REQUIRED = WINDOW_SIZE + STEP_SIZE;

// Stress levels colors
export const NONE_STRESS_COLOR = 'lightgreen';
export const LOW_STRESS_COLOR = 'bisque';
export const MEDIUM_STRESS_COLOR = 'tomato';
export const HIGH_STRESS_COLOR = 'crimson';

// Colors
export const GREEN = 'forestgreen';
export const RED = 'crimson';
export const BLUE = 'steelblue';
export const BLACK = 'black';
export const WHITE = 'white';
