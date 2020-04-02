import isArray from './isArray';
import { ArrayField } from '../types';

export default <FormArrayValues, KeyName extends string>(
  fields: Partial<ArrayField<FormArrayValues, KeyName>>[],
  indexA: number,
  indexB: number,
) => {
  if (isArray(fields)) {
    const temp = [fields[indexB], fields[indexA]];
    fields[indexA] = temp[0];
    fields[indexB] = temp[1];
  }
};
