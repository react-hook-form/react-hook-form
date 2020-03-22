import transformToNestObject from './transformToNestObject';
import getDefaultValue from './getDefaultValue';
import get from '../utils/get';
import getPath from '../utils/getPath';
import isEmptyObject from '../utils/isEmptyObject';
import isUndefined from '../utils/isUndefined';
import isObject from '../utils/isObject';
import isArray from '../utils/isArray';
import { DeepPartial, FieldValue, FieldValues, FieldName } from '../types';

export default <FormValues extends FieldValues>(
  fieldValues: FormValues,
  fieldName: FieldName<FormValues>,
  watchFields: Set<FieldName<FormValues>>,
  combinedDefaultValues: DeepPartial<FormValues>,
  watchFieldArray?: Record<FieldName<FormValues>, Record<string, any>>,
): FieldValue<FormValues> | DeepPartial<FormValues> | undefined => {
  let value;

  watchFields.add(fieldName);

  if (isEmptyObject(fieldValues)) {
    value = watchFieldArray ? watchFieldArray : undefined;
  } else if (!isUndefined(fieldValues[fieldName])) {
    value = fieldValues[fieldName];
    watchFields.add(fieldName);
  } else {
    value = get(transformToNestObject(fieldValues), fieldName);

    if (
      isArray(watchFieldArray) &&
      isArray(value) &&
      value.length !== watchFieldArray.length
    ) {
      value = watchFieldArray;
    }

    if (!isUndefined(value)) {
      getPath<FormValues>(fieldName, value).forEach((name) =>
        watchFields.add(name),
      );
    }
  }

  return isUndefined(value)
    ? isObject(combinedDefaultValues)
      ? getDefaultValue(combinedDefaultValues, fieldName)
      : combinedDefaultValues
    : value;
};
