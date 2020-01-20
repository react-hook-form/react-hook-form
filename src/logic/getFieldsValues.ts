import getFieldValue from './getFieldValue';
import { FieldValues, Ref } from '../types';

export default <FormValues extends FieldValues>(fields: FieldValues) =>
  Object.values(fields).reduce<FormValues>(
    (previous, { ref, ref: { name } }: Ref) => ({
      ...previous,
      ...{ [name]: getFieldValue(fields, ref) },
    }),
    {} as FormValues,
  );
