import type { Ref } from '../types';

import isCheckBoxInput from './isCheckBoxInput';
import isMultipleSelect from './isMultipleSelect';
import isRadioInput from './isRadioInput';

const isSelectEdited = (select: HTMLSelectElement) => {
  const options = [...select.options];

  return !select.multiple &&
    select.size < 2 &&
    !options.some((option) => option.defaultSelected)
    ? select.selectedIndex !== options.findIndex((option) => !option.disabled)
    : options.some((option) => option.selected !== option.defaultSelected);
};

export default (ref: Ref): boolean =>
  isCheckBoxInput(ref)
    ? ref.checked !== ref.defaultChecked
    : ref.type === 'select-one' || isMultipleSelect(ref)
      ? isSelectEdited(ref as HTMLSelectElement)
      : !isRadioInput(ref) &&
        'defaultValue' in ref &&
        ref.value !== ref.defaultValue;
