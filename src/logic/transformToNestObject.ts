import set from '../utils/set';
import isKey from '../utils/isKey';
import { FieldValues } from '../types';

export default (data: FieldValues, value: Record<string, any> = {}): any => {
  for (const key in data) {
    !isKey(key) ? set(value, key, data[key]) : (value[key] = data[key]);
  }
  return value;
};
