import type { Ref } from '../types';

import isCheckBoxInput from './isCheckBoxInput';
import isMultipleSelect from './isMultipleSelect';
import isRadioInput from './isRadioInput';

const isSelectEdited = (select: HTMLSelectElement) => {
  const options = [...select.options];

  return !select.multiple &&
    select.size < 2 &&
    !options.some((option) => option.defaultSelected)
    ? select.selectedIndex !==
        options.findIndex(
          (option) =>
            !option.disabled &&
            !option.parentElement?.matches('optgroup[disabled]'),
        )
    : options.some((option) => option.selected !== option.defaultSelected);
};

const isInputEdited = (input: HTMLInputElement | HTMLTextAreaElement) => {
  if (input.type !== 'range' && input.type !== 'color') {
    return input.value !== input.defaultValue;
  }

  const untouched = input.ownerDocument.createElement('input');

  for (const { name, value } of Array.from(input.attributes)) {
    if (['type', 'min', 'max', 'step', 'value'].includes(name)) {
      untouched.setAttribute(name, value);
    }
  }

  return input.value !== untouched.value;
};

export default (ref: Ref): boolean =>
  isCheckBoxInput(ref)
    ? ref.checked !== ref.defaultChecked
    : ref.type === 'select-one' || isMultipleSelect(ref)
      ? isSelectEdited(ref as HTMLSelectElement)
      : !isRadioInput(ref) && 'defaultValue' in ref && isInputEdited(ref);
