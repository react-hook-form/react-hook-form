import isUndefined from '../utils/isUndefined';
import isNullOrUndefined from '../utils/isNullOrUndefined';

export default (target: any, isCheckbox: boolean) => {
  if (isNullOrUndefined(target)) {
    return target;
  }

  return isCheckbox
    ? isUndefined(target.checked)
      ? target
      : target.checked
    : isUndefined(target.value)
    ? target
    : target.value;
};
