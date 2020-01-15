import getRadioValue from './getRadioValue';
import getMultipleSelectValue from './getMultipleSelectValue';
import isRadioInput from '../utils/isRadioInput';
import isFileInput from '../utils/isFileInput';
import isCheckBox from '../utils/isCheckBoxInput';
import isMultipleSelect from '../utils/isMultipleSelect';
import getCheckboxValue from './getCheckboxValue';
import { FieldRefs, Ref, FieldValues } from '../types';
import isString from '../utils/isString';

export default function getFieldValue<FormValues extends FieldValues>(
  fields: FieldRefs<FormValues>,
  ref: Ref,
) {
  const { type, name, options, files } = ref;
  const field = fields[name];
  let value = ref.value;

  if (isString(value) && field) {
    if (field.trim) {
      value = value.trim();
    }
    if (field.transform) {
      value = field.transform(value);
    }
  }

  if (isFileInput(type)) {
    value = files;
  } else if (isRadioInput(type)) {
    value = field ? getRadioValue(field.options).value : '';
  } else if (isMultipleSelect(type)) {
    value = getMultipleSelectValue(options);
  } else if (isCheckBox(type)) {
    value = field ? getCheckboxValue(field.options).value : false;
  }

  return value;
}
