import getFieldValue from './getFieldValue';
import { FieldValues, FieldValue, Ref } from '../types';

export default function getFieldsValues<Data extends FieldValues>(
  fields: FieldValues,
): Data {
  return Object.values(fields).reduce(
    (previous: FieldValues, { ref }: Ref): FieldValue => ({
      ...previous,
      ...getFieldValue(fields, ref),
    }),
    {},
  );
}
