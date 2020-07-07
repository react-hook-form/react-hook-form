import * as React from 'react';
import transformToNestObject from './transformToNestObject';
import getFieldsValues from './getFieldsValues';
import get from '../utils/get';
import { FieldValues, FieldRefs, InternalFieldName } from '../types/form';

export default <TFieldValues extends FieldValues = FieldValues>(
  fieldsRef: React.MutableRefObject<FieldRefs<TFieldValues>>,
  name?: InternalFieldName<FieldValues>,
) => {
  const results = transformToNestObject(getFieldsValues(fieldsRef));
  return name ? get(results, name, results) : results;
};
