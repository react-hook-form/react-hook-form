import isUndefined from '../utils/isUndefined';

type CheckboxFieldResult = {
  isValid: boolean;
  value: string | string[] | boolean | undefined;
};

const defaultResult: CheckboxFieldResult = {
  value: false,
  isValid: false,
};

const validResult = { value: true, isValid: true };

export default (options?: HTMLInputElement[]): CheckboxFieldResult => {
  if (!Array.isArray(options)) {
    return defaultResult;
  }

  if (options.length > 1) {
    const values = options
      .filter((option) => option && option.checked && !option.disabled)
      .map((option) => option.value);

    return { value: values, isValid: !!values.length };
  }

  const option = options[0];

  if (!option || !option.checked || option.disabled) {
    return defaultResult;
  }

  if (!option.attributes || !('value' in option.attributes)) {
    return validResult;
  }

  return isUndefined(option.value) || option.value === ''
    ? validResult
    : { value: option.value, isValid: true };
};
