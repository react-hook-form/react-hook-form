import getRadioValue from './getRadioValue';
import getMultipleSelectValue from './getMultipleSelectValue';
import { Field } from '..';
import isRadioInput from '../utils/isRadioInput';
import isCheckBox from '../utils/isCheckBox';

export default function getFieldValue(fields: { [key: string]: Field }, { type, name, options, checked, value }: any) {
  if (isRadioInput(type)) {
    return getRadioValue(fields[name].options).value;
  } else if (type === 'select-multiple') {
    return getMultipleSelectValue(options);
  } else if (isCheckBox(type)) {
    return checked;
  }

  return value;
}
