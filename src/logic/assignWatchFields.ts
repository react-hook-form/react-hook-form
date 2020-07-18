import get from '../utils/get';
import { getPath } from '../utils/getPath';
import isEmptyObject from '../utils/isEmptyObject';
import isUndefined from '../utils/isUndefined';
import isNullOrUndefined from '../utils/isNullOrUndefined';
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
  } else {
    value = get(fieldValues, fieldName);

    if (!isNullOrUndefined(value)) {
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
