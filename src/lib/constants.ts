/// Common

export const APP_NAME = 'Stress Detection Kit';
export const DATE_FORMAT = 'h:mm MMMM Do';

/// Developer

export const ACCELERATED_MODE = true;

/// Business logic

// Samples config
export const CHUNK_LENGTH = ACCELERATED_MODE ? 1000 : 10000; // in ms
export const STEP_SIZE = 3; // in chunks
export const WINDOW_SIZE = 30; // in chunks
export const STEP_LENGTH = STEP_SIZE * CHUNK_LENGTH;
export const WINDOW_LENGTH = WINDOW_SIZE * CHUNK_LENGTH;

// Calibration config
export const CALIBRATION_PADDING =
  CHUNK_LENGTH * (ACCELERATED_MODE ? 1 : STEP_SIZE);
export const CALIBRATION_LENGTH =
  CALIBRATION_PADDING + CHUNK_LENGTH * (ACCELERATED_MODE ? 2 : WINDOW_SIZE);
export const CALIBRATION_UPDATE_INTERVAL = 3000; // in ms

// Accerelrometer and gyroscope config
export const SENSOR_UPDATE_INTERVAL = 1000; // in ms

// Default values
export const DEFAULT_BASELINE_RMSSD = 60; // in ms
export const DEFAULT_ACCELEROMETER_ERROR = 0.025; // in m/s^2

/// Storage

export const BASELINE_RMSSD_KEY = 'baselineRmssd';
export const ACCELEROMETER_ERROR_KEY = 'accelerometerError';

/// Views

export const CHART_HEIGHT = 150;

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
