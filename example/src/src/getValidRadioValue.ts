export default function getValidRadioValue(fields: any) {
  return fields.reduce(
    (previous, { ref: { name, checked, value } }: any) => {
      return checked
        ? {
            isValid: true,
            value,
          }
        : previous;
    },
    {
      isValid: false,
      value: null,
    },
  );
}
