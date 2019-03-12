import getRadioValue from './getRadioValue';
import getMultipleSelectValue from './getMultipleSelectValue';
import { RegisterInput } from '../index';

export default function getFieldValue(
  fields: { [key: string]: RegisterInput },
  { type, name, options, checked, value }: any,
) {
  if (type === 'radio') {
    return getRadioValue(fields[name].options).value;
  } else if (type === 'select-multiple') {
    return getMultipleSelectValue(options);
  } else if (type === 'checkbox') {
    return checked;
  }

  return value;
}
