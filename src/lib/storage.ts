import { APP_NAME } from 'lib/constants';
import { AsyncStorage } from 'react-native';

function _get(name: string, fn: (data: string) => any) {
  return AsyncStorage.getItem(`@${APP_NAME}:${name}`).then(fn, () => undefined);
}

function _set(name: string, data: any, fn: (data: any) => string) {
  return AsyncStorage.setItem(`@${APP_NAME}:${name}`, fn(data));
}

export function get(name: string) {
  return _get(name, data => data);
}

export function getFloat(name: string) {
  return _get(name, data => parseFloat(data));
}

export function set(name: string, data: any) {
  return _set(name, data, data => data.toString());
}

export function setFloat(name: string, data: number) {
  return set(name, data);
}
