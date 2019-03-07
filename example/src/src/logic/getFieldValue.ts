import getValidRadioValue from './getValidRadioValue';
import getMultipleSelectValue from './getMultipleSelectValue';
import { RegisterInput } from '../index';

export default function getFieldValue(fields: { [key: string]: RegisterInput }, ref: any) {
  if (ref.type === 'radio') {
    return getValidRadioValue(fields[ref.name].options).value;
  } else if (ref.type === 'select-multiple') {
    return getMultipleSelectValue([...ref.options]);
  } else if (ref.type === 'checkbox') {
    return ref.checked;
  }

  return ref.value;
}
