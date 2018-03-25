export const APP_NAME = 'Stress Detection Kit';
export const DATE_FORMAT = 'h:mm MMMM Do';

// Stress levels colors
export const NONE_STRESS_COLOR = 'lightgreen';
export const LOW_STRESS_COLOR = 'bisque';
export const MEDIUM_STRESS_COLOR = 'tomato';
export const HIGH_STRESS_COLOR = 'crimson';

export const CHUNK_LENGTH = 10000; // in ms
export const STEP_SIZE = 3; // in chunks
export const WINDOW_SIZE = 30; // in chunks

export const CALIBRATION_PADDING = CHUNK_LENGTH;
export const CALIBRATION_LENGTH = CALIBRATION_PADDING + CHUNK_LENGTH * 2;

// Warm up timespan at the beginning of calibration that does not count
//export const CALIBRATION_PADDING = CHUNK_LENGTH * STEP_SIZE;
// Actual duration of calibration
//export const CALIBRATION_LENGTH =
//  CALIBRATION_PADDING + CHUNK_LENGTH * WINDOW_SIZE;
export const CALIBRATION_UPDATE_INTERVAL = 3000; // in ms

export const SENSOR_UPDATE_INTERVAL = 1000; // in ms

export const DEFAULT_BASELINE_RMSSD = 60; // in ms
export const DEFAULT_ACCELEROMETER_ERROR = 0.025; // in m/s^2

// Storage keys
export const BASELINE_RMSSD_KEY = 'baselineRmssd';
export const ACCELEROMETER_ERROR_KEY = 'accelerometerError';
