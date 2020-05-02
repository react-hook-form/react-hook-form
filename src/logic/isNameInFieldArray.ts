export const isMatchFieldArrayName = (name: string, searchName: string) =>
  RegExp(
    `^${searchName}[\\d+]`.replace(/\[/g, '\\[').replace(/\]/g, '\\]'),
  ).test(name);

export default (names: Set<string>, name: string) =>
  [...names].some((current) => isMatchFieldArrayName(name, current));
