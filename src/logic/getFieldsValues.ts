import getFieldValue from './getFieldValue';
import isString from '../utils/isString';
import { FieldValues, FieldValue, Ref } from '../types';

export default function getFieldsValue<Data extends FieldValues>(
  fields: FieldValues,
  fieldName?: string | string[],
): Data {
  return Object.values(fields).reduce(
    (previous: FieldValues, { ref, ref: { name } }: Ref): FieldValue => {
      const value = getFieldValue(fields, ref);

      if (isString(fieldName)) return name === fieldName ? value : previous;

      if (!fieldName) {
        previous[name] = value;
      } else if (Array.isArray(fieldName) && fieldName.includes(name)) {
        previous[name] = value;
      }

      return previous;
    },
    {},
  );
}
