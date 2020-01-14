export const isMatchFieldArrayName = (name: string, searchName: string) =>
  name.startsWith(`${searchName}[`);

export const isFieldArray = (fields: Set<string>, searchName: string) =>
  [...fields].reduce(
    (prev, current) =>
      isMatchFieldArrayName(current, searchName) ? false : prev,
    true,
  );
