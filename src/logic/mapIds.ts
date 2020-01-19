import isArray from '../utils/isArray';
import generateId from './generateId';
import { FieldValues } from '../types';

export const appendId = <
  FormArrayValues extends {
    id?: string;
  } & FieldValues = FieldValues
>(
  value: FormArrayValues,
) => ({
  ...value,
  id: generateId(),
});

export const mapIds = (data: any) =>
  (isArray(data) ? data : []).map(value => appendId(value));
