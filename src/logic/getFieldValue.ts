import getRadioValue from './getRadioValue';
import getMultipleSelectValue from './getMultipleSelectValue';
import isRadioInput from '../utils/isRadioInput';
import isCheckBox from '../utils/isCheckBoxInput';
import isUndefined from '../utils/isUndefined';
import isMultipleSelect from '../utils/isMultipleSelect';
import { FieldsRefs, Ref, FieldValues } from '../types';

export default function getFieldValue<FormValues extends FieldValues>(
  fields: FieldsRefs<FormValues>,
  ref: Ref,
) {
  const { type, name, options, checked, value, files } = ref;

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
    if (checked) {
      return ref.attributes && ref.attributes.value
        ? isUndefined(value) || value === ''
          ? true
          : value
        : true;
    }
    return false;
  }

  return value;
}
