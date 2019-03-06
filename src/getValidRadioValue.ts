export default function getValidRadioValue(fields: Object, filedName: string) {
  return Object.values(fields).reduce(
    (previous, { ref: { name, checked, value } }: any) => {
      if (previous.isValid || !filedName === name) return previous;
      return {
        isValid: checked,
        value,
      };
    },
    {
      isValid: false,
      value: null,
    },
  );
}
