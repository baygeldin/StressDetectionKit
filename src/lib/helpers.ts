import { StressLevels } from 'lib/types';
import { Device } from 'lib/device-kit';
import {
  NONE_STRESS_COLOR,
  LOW_STRESS_COLOR,
  MEDIUM_STRESS_COLOR,
  HIGH_STRESS_COLOR
} from 'lib/constants';

export function chunkArray<T>(array: T[], chunkSize: number) {
  const results: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    results.push(array.slice(i, i + chunkSize));
  }
  return results;
}

export function stressColor(level: StressLevels) {
  switch (level) {
    case 'none':
      return NONE_STRESS_COLOR;
    case 'low':
      return LOW_STRESS_COLOR;
    case 'medium':
      return MEDIUM_STRESS_COLOR;
    case 'high':
      return HIGH_STRESS_COLOR;
  }
}

export function deviceTitle(device: Device) {
  return `${device.name} by ${device.manufacturer}`;
}
