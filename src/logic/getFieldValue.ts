import getRadioValue from './getRadioValue';
import getMultipleSelectValue from './getMultipleSelectValue';
import { FieldsObject, FieldValue, Ref, DataType } from '../types';
import isRadioInput from '../utils/isRadioInput';
import isCheckBox from '../utils/isCheckBoxInput';

export default function getFieldValue<Data extends DataType>(fields: FieldsObject<Data>, { type, name, options, checked, value }: Ref): FieldValue {
  if (isRadioInput(type)) {
    let fieldValue = fields[name];
    if (fieldValue === undefined) {
      throw new Error(`Expected Field Value for ${name}`)
    }
    return getRadioValue(fieldValue.options).value;
  }

  if (type === 'select-multiple') return getMultipleSelectValue(options);

  if (isCheckBox(type)) return checked ? value || checked : false;

  return value;
}
