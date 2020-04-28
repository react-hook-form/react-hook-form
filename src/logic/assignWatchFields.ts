import transformToNestObject from './transformToNestObject';
import get from '../utils/get';
import getPath from '../utils/getPath';
import isEmptyObject from '../utils/isEmptyObject';
import isUndefined from '../utils/isUndefined';
import {
  UnpackedDeepPartial,
  FieldValue,
  FieldValues,
  FieldName,
} from '../types';

export default <FormValues extends FieldValues>(
  fieldValues: FormValues,
  fieldName: FieldName<FormValues>,
  watchFields: Set<FieldName<FormValues>>,
  combinedDefaultValues: UnpackedDeepPartial<FormValues>,
): FieldValue<FormValues> | UnpackedDeepPartial<FormValues> | undefined => {
  let value;

  watchFields.add(fieldName);

  if (isEmptyObject(fieldValues)) {
    value = undefined;
  } else if (!isUndefined(fieldValues[fieldName])) {
    value = fieldValues[fieldName];
    watchFields.add(fieldName);
  } else {
    value = get(transformToNestObject(fieldValues), fieldName);

    if (!isUndefined(value)) {
      getPath<FormValues>(fieldName, value).forEach((name: string) =>
        watchFields.add(name),
      );
    }
  }

  return isUndefined(value) ? get(combinedDefaultValues, fieldName) : value;
};
