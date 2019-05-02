import getRadioValue from './getRadioValue';
import getMultipleSelectValue from './getMultipleSelectValue';
import { FieldsObject, FieldValue, Ref } from '../type';
import isRadioInput from '../utils/isRadioInput';
import isCheckBox from '../utils/isCheckBox';

export default function getFieldValue(fields: FieldsObject, { type, name, options, checked, value }: Ref): FieldValue {
  if (isRadioInput(type)) {
    return getRadioValue(fields[name].options).value;
  }

  if (type === 'select-multiple') {
    return getMultipleSelectValue(options);
  }

  if (isCheckBox(type)) {
    return checked;
  }

  return value;
}
