import isArray from '../utils/isArray';
import isObject from '../utils/isObject';
import generateId from './generateId';
import { ArrayField } from '../types';

export const appendId = <Value extends object, KeyName extends string>(
  value: Value,
  keyName: KeyName,
): Partial<ArrayField<Value, KeyName>> => ({
  [keyName]: generateId(),
  ...(isObject(value) ? value : { value }),
});

export const mapIds = <Data extends object, KeyName extends string>(
  data: Data | Data[],
  keyName: KeyName,
) => (isArray(data) ? data : []).map(value => appendId(value, keyName));
