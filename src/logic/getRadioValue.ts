type RadioFieldResult = {
  isValid: boolean;
  value: number | string;
};

const defaultReturn: RadioFieldResult = {
  isValid: false,
  value: '',
};

export default (options?: HTMLInputElement[]): RadioFieldResult =>
  Array.isArray(options)
    ? options.reduce(
        (previous, option): RadioFieldResult =>
          option && option.checked
            ? {
                isValid: true,
                value: option.value,
              }
            : previous,
        defaultReturn,
      )
    : defaultReturn;
