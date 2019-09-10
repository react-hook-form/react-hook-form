import getFieldValue from './getFieldValue';
import { FieldValues, Ref } from '../types';

export default (fields: FieldValues) =>
  Object.values(fields).reduce(
    (previous: FieldValues, { ref, ref: { name } }: Ref): any => ({
      ...previous,
      ...{ [name]: getFieldValue(fields, ref) },
    }),
    {},
  );
