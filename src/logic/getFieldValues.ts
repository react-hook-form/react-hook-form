import getFieldValue from './getFieldValue';
import { FieldValues, Ref } from '../types';

export default <Data extends FieldValues>(fields: FieldValues): Data =>
  Object.values(fields).reduce(
    (previous: FieldValues, { ref, ref: { name } }: Ref): any => ({
      ...previous,
      ...{ [name]: getFieldValue(fields, ref) },
    }),
    {},
  );
