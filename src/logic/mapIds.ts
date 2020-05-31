import isArray from '../utils/isArray';
import isObject from '../utils/isObject';
import generateId from './generateId';
import { ArrayField } from '../types/form';

export const appendId = <TValue extends object, TKeyName extends string>(
  value: TValue,
  keyName: TKeyName,
): Partial<ArrayField<TValue, TKeyName>> => ({
  [keyName]: generateId(),
  ...(isObject(value) ? value : { value }),
});

export const mapIds = <TData extends object, TKeyName extends string>(
  data: TData | TData[],
  keyName: TKeyName,
) => (isArray(data) ? data : []).map((value) => appendId(value, keyName));
