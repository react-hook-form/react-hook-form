import getRadioValue from './getRadioValue';
import getMultipleSelectValue from './getMultipleSelectValue';
import isRadioInput from '../utils/isRadioInput';
import isFileInput from '../utils/isFileInput';
import isCheckBox from '../utils/isCheckBoxInput';
import isMultipleSelect from '../utils/isMultipleSelect';
import getCheckboxValue from './getCheckboxValue';
import { Field } from '../types';

export default function getFieldValue(
  field?: Field,
  excludeDisabled?: boolean,
) {
  if (field) {
    const { ref, valueAsNumber, valueAsDate, setValueAs } = field;

    if (ref.disabled && excludeDisabled) {
      return;
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
      ? +ref.value
      : valueAsDate
      ? (ref as HTMLInputElement).valueAsDate
      : setValueAs
      ? setValueAs(ref.value)
      : ref.value;
  }
}
