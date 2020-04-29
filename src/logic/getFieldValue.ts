import getRadioValue from './getRadioValue';
import getMultipleSelectValue from './getMultipleSelectValue';
import isRadioInput from '../utils/isRadioInput';
import isCheckBox from '../utils/isCheckBoxInput';
import { FieldsObject, FieldValue, Ref, DataType } from '../types';

export default function getFieldValue<Data extends DataType>(
  fields: FieldsObject<Data>,
  ref: Ref,
): FieldValue {
  const { type, name, options, checked, value } = ref;
  if (isRadioInput(type)) {
    const field = fields[name];
    return field ? getRadioValue(field.options).value : '';
  }

  if (type === 'select-multiple') return getMultipleSelectValue(options);

  if (isCheckBox(type))
    return checked
      ? ref.attributes && ref.attributes.value
        ? value
        : true
      : false;

  return value;
}
