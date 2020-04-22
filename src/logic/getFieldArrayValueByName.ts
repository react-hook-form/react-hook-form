import { transformToNestObject } from './transformToNestObject';
import getFieldsValues from './getFieldsValues';
import get from '../utils/get';
import { FieldValues, FieldRefs, FieldName } from '../types';

export default <FormValues extends FieldValues = FieldValues>(
  fields: FieldRefs<FormValues>,
  name?: FieldName<FieldValues>,
) => {
  const results = transformToNestObject(getFieldsValues(fields));
  return name ? get(results, name, results) : results;
};
