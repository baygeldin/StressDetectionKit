import { StressLevels } from 'lib/types';
import { Device } from 'lib/device-kit';
import {
  NONE_STRESS_COLOR,
  LOW_STRESS_COLOR,
  MEDIUM_STRESS_COLOR,
  HIGH_STRESS_COLOR
} from 'lib/constants';

export function chunkBySize<T>(array: T[], size: number) {
  const results: T[][] = [];

  for (let i = 0; i < array.length; i += size) {
    results.push(array.slice(i, i + size));
  }

  return results;
}

export function chunkByPattern<T>(array: T[], pattern: (elem: T) => any) {
  const results: T[][] = [];

  for (let i = 0; i < array.length; ) {
    const chunk: T[] = [];
    const state = pattern(array[i]);

    while (state === pattern(array[i]) || isNaN(state)) {
      chunk.push(array[i]);
      i++;
    }

    results.push(chunk);
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
