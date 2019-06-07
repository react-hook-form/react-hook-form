import getFieldValue from './getFieldValue';
import isString from '../utils/isString';
import { FieldValue, Ref } from '../types';

export default function getFieldsValues(fields, fieldName?: string | string[]): { [key: string]: FieldValue } {
  return Object.values(fields).reduce((previous: {}, data: Ref): FieldValue => {
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
  }, {});
}
