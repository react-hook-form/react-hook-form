import getRadioValue from './getRadioValue';
import getMultipleSelectValue from './getMultipleSelectValue';
import { FieldsObject, FieldValue, Ref, DataType } from '../types';
import isRadioInput from '../utils/isRadioInput';
import isCheckBox from '../utils/isCheckBoxInput';

export default function getFieldValue<Data extends DataType>(fields: FieldsObject<Data>, { type, name, options, checked, value }: Ref): FieldValue {
  if (isRadioInput(type)) {
    return getRadioValue(fields[name]!.options).value;
  }

  if (type === 'select-multiple') return getMultipleSelectValue(options);

  if (isCheckBox(type)) return checked;

  return value;
}
