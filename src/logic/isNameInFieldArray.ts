export const isMatchFieldArrayName = (name: string, searchName: string) =>
  name.startsWith(`${searchName}[`);

export default (names: Set<string>, name: string) =>
  [...names].reduce(
    (prev, current) => (isMatchFieldArrayName(name, current) ? true : prev),
    false,
  );
