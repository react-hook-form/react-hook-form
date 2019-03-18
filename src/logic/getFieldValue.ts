import getRadioValue from './getRadioValue';
import getMultipleSelectValue from './getMultipleSelectValue';
import { Field } from '..';
import isRadioInput from '../utils/isRadioInput';

export default function getFieldValue(fields: { [key: string]: Field }, { type, name, options, checked, value }: any) {
  if (isRadioInput(type)) {
    return getRadioValue(fields[name].options).value;
  } else if (type === 'select-multiple') {
    return getMultipleSelectValue(options);
  } else if (type === 'checkbox') {
    return checked;
  }

  return value;
}
