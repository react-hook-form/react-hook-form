import getRadioValue from './getRadioValue';
import getMultipleSelectValue from './getMultipleSelectValue';
import isRadioInput from '../utils/isRadioInput';
import isCheckBox from '../utils/isCheckBoxInput';
import { FieldsObject, FieldValue, Ref, DataType } from '../types';

export default function getFieldValue<Data extends DataType>(
  fields: FieldsObject<Data>,
  { type, name, options, checked, value }: Ref,
): FieldValue {
  if (isRadioInput(type)) {
    const field = fields[name];
    return field ? getRadioValue(field.options).value : '';
  }

  if (type === 'select-multiple') return getMultipleSelectValue(options);

  if (isCheckBox(type)) return checked ? value || checked : false;

  return value;
}
