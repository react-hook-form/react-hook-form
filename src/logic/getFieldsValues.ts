import getFieldValue from './getFieldValue';
import isString from '../utils/isString';
import { DataType, FieldValue, Ref } from '../types';

export default function getFieldsValues(
  fields: DataType,
  fieldName?: string | string[],
): FormData {
  return Object.values(fields).reduce(
    (previous: DataType, data: Ref): FieldValue => {
      const {
        ref,
        ref: { name },
      } = data;
      const value = getFieldValue(fields, ref);

      if (isString(fieldName)) {
        return name === fieldName ? value : previous;
      }

      if (Array.isArray(fieldName)) {
        if (fieldName.includes(name)) {
          previous[name] = value;
        }
      } else {
        previous[name] = value;
      }

      return previous;
    },
    {},
  );
}
