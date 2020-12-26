import * as React from 'react';
import getRadioValue from './getRadioValue';
import getMultipleSelectValue from './getMultipleSelectValue';
import isRadioInput from '../utils/isRadioInput';
import isFileInput from '../utils/isFileInput';
import isCheckBox from '../utils/isCheckBoxInput';
import isMultipleSelect from '../utils/isMultipleSelect';
import getCheckboxValue from './getCheckboxValue';
import isUndefined from '../utils/isUndefined';
import { FieldRefs, InternalFieldName } from '../types';

export default function getFieldValue(
  fieldsRef: React.MutableRefObject<FieldRefs>,
  name: InternalFieldName,
  excludeDisabled?: boolean,
) {
  const field = fieldsRef.current[name]!;

  if (field) {
    const {
      ref: { value, disabled },
      ref,
      value: controllerValue,
      valueAsNumber,
      valueAsDate,
      setValueAs,
    } = field;

    if (disabled && excludeDisabled) {
      return;
    }

    if (!isUndefined(controllerValue)) {
      return controllerValue;
    }

    if (isFileInput(ref)) {
      return ref.files;
    }

    if (isRadioInput(ref)) {
      return getRadioValue(field.refs).value;
    }

    if (isMultipleSelect(ref)) {
      return getMultipleSelectValue(ref.options);
    }

    if (isCheckBox(ref)) {
      return getCheckboxValue(field.refs).value;
    }

    return valueAsNumber
      ? +value
      : valueAsDate
      ? (ref as HTMLInputElement).valueAsDate
      : setValueAs
      ? setValueAs(value)
      : value;
  }
}
