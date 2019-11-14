import getRadioValue from './getRadioValue';
import getMultipleSelectValue from './getMultipleSelectValue';
import isRadioInput from '../utils/isRadioInput';
import isCheckBox from '../utils/isCheckBoxInput';
import isMultipleSelect from '../utils/isMultipleSelect';
import getCheckboxValue from './getCheckboxValue';
import { Ref } from '../types';

export default function getFieldValue(ref: Ref) {
  const { type, options, value, files } = ref;

  if (type === 'file') {
    return files;
  }

  if (isRadioInput(type)) {
    return ref ? getRadioValue(ref.options).value : '';
  }

  if (isMultipleSelect(type)) {
    return getMultipleSelectValue(options);
  }

  if (isCheckBox(type)) {
    return ref ? getCheckboxValue(ref.options).value : false;
  }

  return value;
}
