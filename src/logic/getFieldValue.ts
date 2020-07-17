import getRadioValue from './getRadioValue';
import getMultipleSelectValue from './getMultipleSelectValue';
import isRadioInput from '../utils/isRadioInput';
import isFileInput from '../utils/isFileInput';
import isCheckBox from '../utils/isCheckBoxInput';
import isMultipleSelect from '../utils/isMultipleSelect';
import getCheckboxValue from './getCheckboxValue';
import { FieldRefs, FieldValues, InternalFieldName } from '../types/form';

export default function getFieldValue<TFieldValues extends FieldValues>(
  fields: FieldRefs<TFieldValues>,
  name: InternalFieldName<TFieldValues>,
  unmountFieldsStateRef?: Record<string, any>,
) {
  const field = fields[name]!;

  if (field) {
    const {
      ref: { value },
      ref,
    } = field;

    if (isFileInput(ref)) {
      return ref.files;
    }

    if (isRadioInput(ref)) {
      return getRadioValue(field.options).value;
    }

    if (isMultipleSelect(ref)) {
      return getMultipleSelectValue(ref.options);
    }

    if (isCheckBox(ref)) {
      return getCheckboxValue(field.options).value;
    }

    return value;
  }

  if (unmountFieldsStateRef) {
    return unmountFieldsStateRef[name];
  }
}
