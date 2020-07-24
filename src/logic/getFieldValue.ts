import * as React from 'react';
import getRadioValue from './getRadioValue';
import getMultipleSelectValue from './getMultipleSelectValue';
import isRadioInput from '../utils/isRadioInput';
import isFileInput from '../utils/isFileInput';
import isCheckBox from '../utils/isCheckBoxInput';
import isMultipleSelect from '../utils/isMultipleSelect';
import getCheckboxValue from './getCheckboxValue';
import {
  FieldRefs,
  FieldValues,
  InternalFieldName,
  FieldValue,
  UnpackNestedValue,
} from '../types/form';
import { DeepPartial } from '../types/utils';

export default function getFieldValue<TFieldValues extends FieldValues>(
  fieldsRef: React.MutableRefObject<FieldRefs<TFieldValues>>,
  name: InternalFieldName<TFieldValues>,
  optinalState?: {
    unmountFieldsStateRef: React.MutableRefObject<Record<string, any>>;
    defaultValuesRef: React.MutableRefObject<
      | FieldValue<UnpackNestedValue<TFieldValues>>
      | UnpackNestedValue<DeepPartial<TFieldValues>>
    >;
  },
) {
  const field = fieldsRef.current[name]!;

  if (field) {
    const {
      ref: { value },
      ref,
    } = field;

    if (isFileInput(ref)) {
      return ref.files;
    }

    if (isRadioInput(ref)) {
      return getRadioValue(field.options).value;
    }

    if (isMultipleSelect(ref)) {
      return getMultipleSelectValue(ref.options);
    }

    if (isCheckBox(ref)) {
      return getCheckboxValue(field.options).value;
    }

    return value;
  }

  return (
    optinalState &&
    (optinalState.unmountFieldsStateRef.current[name] ||
      optinalState.defaultValuesRef.current[name])
  );
}
