import isArray from '../utils/isArray';
import isObject from '../utils/isObject';
import generateId from './generateId';
import { FieldValues } from '../types';

export const appendId = <FormArrayValues extends FieldValues = FieldValues>(
  value: FormArrayValues,
  keyName: string,
) => ({
  [keyName]: generateId(),
  ...(isObject(value) ? value : { value }),
});

export const mapIds = (data: any, keyName: string) =>
  (isArray(data) ? data : []).map((value) => appendId(value, keyName));
