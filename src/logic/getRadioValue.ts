type RadioFieldResult = {
  isValid: boolean;
  value: number | string | null | undefined;
};

const defaultReturn: RadioFieldResult = {
  isValid: false,
  value: null,
};

export default (options?: HTMLInputElement[]): RadioFieldResult =>
  Array.isArray(options)
    ? options.reduce(
        (previous, option): RadioFieldResult =>
          option && (option.disabled || option.checked)
            ? {
                isValid: true,
                value: option.disabled ? undefined : option.value,
              }
            : previous,
        defaultReturn,
      )
    : defaultReturn;
