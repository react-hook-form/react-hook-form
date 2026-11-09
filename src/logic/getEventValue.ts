import isCheckBoxInput from '../utils/isCheckBoxInput';
import isFileInput from '../utils/isFileInput';
import isMultipleSelect from '../utils/isMultipleSelect';
import isObject from '../utils/isObject';

type Event = {
  target: HTMLInputElement & HTMLSelectElement;
};

export default (event: unknown) =>
  isObject(event) && (event as Event).target
    ? isCheckBoxInput((event as Event).target)
      ? (event as Event).target.checked
      : isFileInput((event as Event).target)
        ? (event as Event).target.files
        : isMultipleSelect((event as Event).target)
          ? (event as Event).target.selectedOptions
            ? [...(event as Event).target.selectedOptions]
                .filter(
                  (option) =>
                    !option.disabled && !option.closest?.('optgroup[disabled]'),
                )
                .map(({ value }) => value)
            : (event as Event).target.value
          : (event as Event).target.value
    : event;
