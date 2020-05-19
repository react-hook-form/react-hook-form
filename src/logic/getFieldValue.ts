import getRadioValue from './getRadioValue';
import getMultipleSelectValue from './getMultipleSelectValue';
import isRadioInput from '../utils/isRadioInput';
import isFileInput from '../utils/isFileInput';
import isCheckBox from '../utils/isCheckBoxInput';
import isMultipleSelect from '../utils/isMultipleSelect';
import getCheckboxValue from './getCheckboxValue';
import { FieldRefs, Ref, FieldValues } from '../types/types';

export default function getFieldValue<TFieldValues extends FieldValues>(
  fields: FieldRefs<TFieldValues>,
  ref: Ref,
) {
  const { name, value } = ref;
  const field = fields[name];

  if (isFileInput(ref)) {
    return ref.files;
  }

  if (isRadioInput(ref)) {
    return field ? getRadioValue(field.options).value : '';
  }

  if (isMultipleSelect(ref)) {
    return getMultipleSelectValue(ref.options);
  }

  if (isCheckBox(ref)) {
    return field ? getCheckboxValue(field.options).value : false;
  }

  return value;
}
