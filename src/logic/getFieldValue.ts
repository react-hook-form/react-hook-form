import * as React from 'react';
import getRadioValue from './getRadioValue';
import getMultipleSelectValue from './getMultipleSelectValue';
import isRadioInput from '../utils/isRadioInput';
import get from '../utils/get';
import isFileInput from '../utils/isFileInput';
import isCheckBox from '../utils/isCheckBoxInput';
import isMultipleSelect from '../utils/isMultipleSelect';
import getCheckboxValue from './getCheckboxValue';
import { FieldRefs, FieldValues, InternalFieldName } from '../types';

export default function getFieldValue<TFieldValues extends FieldValues>(
  fieldsRef: React.MutableRefObject<FieldRefs<TFieldValues>>,
  name: InternalFieldName<TFieldValues>,
  shallowFieldsStateRef?: React.MutableRefObject<FieldValues>,
  excludeDisabled?: boolean,
) {
  const field = fieldsRef.current[name]!;

  if (field) {
    const {
      ref: { value, disabled },
      ref,
    } = field;

    if (disabled && excludeDisabled) {
      return;
    }

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

  if (shallowFieldsStateRef) {
    return get(shallowFieldsStateRef.current, name);
  }
}
