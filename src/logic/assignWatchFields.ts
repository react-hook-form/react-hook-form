import transformToNestObject from './transformToNestObject';
import get from '../utils/get';
import getPath from '../utils/getPath';
import isEmptyObject from '../utils/isEmptyObject';
import isUndefined from '../utils/isUndefined';
import {
  DeepPartial,
  FieldValue,
  FieldValues,
  InternalFieldName,
  Unpacked,
} from '../types';

export default <TFieldValues extends FieldValues>(
  fieldValues: TFieldValues,
  fieldName: InternalFieldName<TFieldValues>,
  watchFields: Set<InternalFieldName<TFieldValues>>,
  inputValue: Unpacked<DeepPartial<TFieldValues>>,
  isSingleField?: boolean,
):
  | FieldValue<TFieldValues>
  | Unpacked<DeepPartial<TFieldValues>>
  | undefined => {
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
