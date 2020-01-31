import isArray from '../utils/isArray';
import isObject from '../utils/isObject';
import generateId from './generateId';
import { FieldValues } from '../types';

export const appendId = <
  FormArrayValues extends {
    id?: string;
  } & FieldValues = FieldValues
>(
  value: FormArrayValues,
) => ({
  ...(isObject(value) ? { ...value } : { value }),
  id: generateId(),
});

export const mapIds = (data: any) =>
  (isArray(data) ? data : []).map(value => appendId(value));
