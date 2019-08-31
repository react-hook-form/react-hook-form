import getFieldValue from './getFieldValue';
import { FieldValues, FieldValue, Ref } from '../types';

export default function getFieldsValues<Data extends FieldValues>(
  fields: FieldValues,
): Data {
  return Object.values(fields).reduce(
    (previous: FieldValues, { ref, ref: { name } }: Ref): FieldValue => ({
      ...previous,
      ...{ [name]: getFieldValue(fields, ref) },
    }),
    {},
  );
}
