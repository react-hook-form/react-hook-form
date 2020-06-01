import transformToNestObject from './transformToNestObject';
import get from '../utils/get';
import getPath from '../utils/getPath';
import isEmptyObject from '../utils/isEmptyObject';
import isUndefined from '../utils/isUndefined';
import { DeepPartial } from '../types/utils';
import {
  FieldValue,
  FieldValues,
  InternalFieldName,
  UnpackNestedValue,
} from '../types/form';

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
  let value;

  watchFields.add(fieldName);

  if (isEmptyObject(fieldValues)) {
    value = undefined;
  } else if (!isUndefined(fieldValues[fieldName])) {
    value = fieldValues[fieldName];
  } else {
    value = get(transformToNestObject(fieldValues), fieldName);

    if (!isUndefined(value)) {
      getPath<TFieldValues>(fieldName, value).forEach((name: string) =>
        watchFields.add(name),
      );
    }
  }

  return isUndefined(value)
    ? isSingleField
      ? inputValue
      : get(inputValue, fieldName)
    : value;
};
