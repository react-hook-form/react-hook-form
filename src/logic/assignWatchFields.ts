import get from '../utils/get';
import { getPath } from '../utils/getPath';
import isEmptyObject from '../utils/isEmptyObject';
import isUndefined from '../utils/isUndefined';
import isObject from '../utils/isObject';
import {
  DeepPartial,
  FieldValue,
  FieldValues,
  InternalFieldName,
  UnpackNestedValue,
} from '../types';

export default <TFieldValues extends FieldValues>(
  fieldValues: TFieldValues,
  fieldName: InternalFieldName<TFieldValues>,
  watchFields: Set<InternalFieldName<TFieldValues>>,
  inputValue: UnpackNestedValue<DeepPartial<TFieldValues>>,
  isSingleField?: boolean,
):
  | FieldValue<TFieldValues>
  | UnpackNestedValue<DeepPartial<TFieldValues>>
  | undefined => {
  let value = undefined;

  watchFields.add(fieldName);

  if (!isEmptyObject(fieldValues)) {
    value = get(fieldValues, fieldName);

    if (isObject(value) || Array.isArray(value)) {
      getPath(fieldName, value).forEach((name) => watchFields.add(name));
    }
  }

  return isUndefined(value)
    ? isSingleField
      ? inputValue
      : get(inputValue, fieldName)
    : value;
};
