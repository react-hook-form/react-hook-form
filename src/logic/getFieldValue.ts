import getRadioValue from './getRadioValue';
import getMultipleSelectValue from './getMultipleSelectValue';
import isRadioInput from '../utils/isRadioInput';
import isCheckBox from '../utils/isCheckBoxInput';
import isMultipleSelect from '../utils/isMultipleSelect';
import { FieldsRefs, Ref, FieldValues } from '../types';
import getCheckboxValue from './getCheckboxValue';

export default function getFieldValue<FormValues extends FieldValues>(
  fields: FieldsRefs<FormValues>,
  ref: Ref,
) {
  const { type, name, options, value, files } = ref;

  if (type === 'file') {
    return files;
  }

  if (isRadioInput(type)) {
    const field = fields[name];
    return field ? getRadioValue(field.options).value : '';
  }

  if (isMultipleSelect(type)) {
    return getMultipleSelectValue(options);
  }

  if (isCheckBox(type)) {
    const field = fields[name];
    return field ? getCheckboxValue(field.options).value : false;
  }

  return value;
}
