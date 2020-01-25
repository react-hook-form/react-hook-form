import getFieldValue from './getFieldValue';
import { FieldValues, FieldRefs, Field } from '../types';

export default <FormValues extends FieldValues>(
  fields: FieldRefs<FormValues>,
) =>
  (Object.values(fields) as Field[]).reduce(
    (previous, { ref, ref: { name } }) => ({
      ...previous,
      ...{ [name]: getFieldValue(fields, ref) },
    }),
    {} as FormValues,
  );
