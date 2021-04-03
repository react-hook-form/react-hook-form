import { Field } from '../types';
import isCheckBox from '../utils/isCheckBoxInput';
import isFileInput from '../utils/isFileInput';
import isMultipleSelect from '../utils/isMultipleSelect';
import isRadioInput from '../utils/isRadioInput';
import isUndefined from '../utils/isUndefined';

import getCheckboxValue from './getCheckboxValue';
import getFieldValueAs from './getFieldValueAs';
import getMultipleSelectValue from './getMultipleSelectValue';
import getRadioValue from './getRadioValue';

export default function getFieldValue(field?: Field) {
  if (field && field._f) {
    const ref = field._f.ref;

    if (ref.disabled) {
      return;
    }

    if (isFileInput(ref)) {
      return ref.files;
    }

    if (isRadioInput(ref)) {
      return getRadioValue(field._f.refs).value;
    }

    if (isMultipleSelect(ref)) {
      return getMultipleSelectValue(ref.options);
    }

    if (isCheckBox(ref)) {
      return getCheckboxValue(field._f.refs).value;
    }

    return getFieldValueAs(
      isUndefined(ref.value) ? field._f.ref.value : ref.value,
      field._f,
    );
  }
}
