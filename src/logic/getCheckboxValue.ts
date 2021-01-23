import isUndefined from '../utils/isUndefined';

type CheckboxFieldResult = {
  isValid: boolean;
  value: string | string[] | boolean;
};

const defaultResult: CheckboxFieldResult = {
  value: false,
  isValid: false,
};

const validResult = { value: true, isValid: true };

export default (options?: HTMLInputElement[]): CheckboxFieldResult => {
  if (Array.isArray(options)) {
    if (options.length > 1) {
      const values = options
        .filter((option) => option && option.checked)
        .map(({ value }) => value);
      return { value: values, isValid: !!values.length };
    }

    const { checked, value, attributes } = options[0];

    return checked
      ? // @ts-expect-error attributes doesn't exist but do in browser
        attributes && !isUndefined(attributes.value)
        ? isUndefined(value)
          ? validResult
          : { value: value, isValid: true }
        : validResult
      : defaultResult;
  }

  return defaultResult;
};
