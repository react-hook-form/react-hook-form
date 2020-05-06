import transformToNestObject from './transformToNestObject';
import getFieldsValues from './getFieldsValues';
import get from '../utils/get';
import { FieldValues, FieldRefs, InternalFieldName } from '../types';

export default <TFieldValues extends FieldValues = FieldValues>(
  fields: FieldRefs<TFieldValues>,
  name?: InternalFieldName<FieldValues>,
) => {
  const results = transformToNestObject(getFieldsValues(fields));
  return name ? get(results, name, results) : results;
};
