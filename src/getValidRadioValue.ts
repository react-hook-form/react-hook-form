export default function getValidRadioValue(fields: Object, filedName: string) {
  return Object.values(fields).reduce(
    (previous, { ref: { name, checked, value } }: any) => {
      if (filedName === name) {
        return {
          isValid: previous.checked ? true : checked,
          value: checked ? value : '',
        };
      }

      return previous;
    },
    {
      isValid: false,
      value: null,
    },
  );
}
