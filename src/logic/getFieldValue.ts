import getRadioValue from './getRadioValue';
import getMultipleSelectValue from './getMultipleSelectValue';
import isRadioInput from '../utils/isRadioInput';
import isFileInput from '../utils/isFileInput';
import isCheckBox from '../utils/isCheckBoxInput';
import isMultipleSelect from '../utils/isMultipleSelect';
import getCheckboxValue from './getCheckboxValue';
import getFieldValueAs from './getFieldValueAs';
import { Field } from '../types';

export default function getFieldValue(
  field?: Field,
  shouldReturnAsValue?: boolean,
) {
  if (field && field._f) {
    const { ref } = field._f;

    if (ref.disabled) {
      return;
    }

    if (isFileInput(ref)) {
      return ref.files;
    }

    if (isRadioInput(ref)) {
      return getRadioValue(field._f.refs).value;
    }

    if (isMultipleSelect(ref)) {
      return getMultipleSelectValue(ref.options);
    }

    if (isCheckBox(ref)) {
      return getCheckboxValue(field._f.refs).value;
    }

    return getFieldValueAs(ref.value, field._f, shouldReturnAsValue);
  }
}
