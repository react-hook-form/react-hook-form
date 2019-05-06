import getFieldValue from './getFieldValue';
import isString from '../utils/isString';
import { FieldValue, Ref } from '../types';

export default function getFieldsValues(fields, filedName?: string | string[]): FieldValue {
  return Object.values(fields).reduce((previous, data: Ref): FieldValue => {
    const {
      ref,
      ref: { name },
    } = data;
    const value = getFieldValue(fields, ref);

    if (isString(filedName)) {
      return name === filedName ? value : previous;
    }

    if (Array.isArray(filedName)) {
      if (filedName.includes(name)) {
        previous[name] = value;
      }
    } else {
      previous[name] = value;
    }

    return previous;
  }, {});
}
