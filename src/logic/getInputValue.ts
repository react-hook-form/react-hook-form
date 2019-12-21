import isUndefined from '../utils/isUndefined';

export default function getValue(target: any, isCheckbox: boolean) {
  return isCheckbox
    ? isUndefined(target.checked)
      ? target
      : target.checked
    : isUndefined(target.value)
    ? target
    : target.value;
}
