export default <T>(fieldValues: T[], index: number, value: any) => {
  fieldValues[index] = value;
  return fieldValues;
};
