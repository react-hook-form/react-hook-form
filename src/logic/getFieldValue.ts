import getRadioValue from './getRadioValue';
import getMultipleSelectValue from './getMultipleSelectValue';
import isRadioInput from '../utils/isRadioInput';
import isCheckBox from '../utils/isCheckBoxInput';
import isMultipleSelect from '../utils/isMultipleSelect';
import getCheckboxValue from './getCheckboxValue';
import { FieldRefs, Ref, FieldValues } from '../types';

export default function getFieldValue<FormValues extends FieldValues>(
  fields: FieldRefs<FormValues>,
  ref: Ref,
) {
  const { type, name, options, value, files } = ref;
  const field = fields[name];

  if (type === 'file') {
    return files;
  }

  if (isRadioInput(type)) {
    return field ? getRadioValue(field.options).value : '';
  }

  if (isMultipleSelect(type)) {
    return getMultipleSelectValue(options);
  }

  if (isCheckBox(type)) {
    return field ? getCheckboxValue(field.options).value : false;
  }

  return value;
}
