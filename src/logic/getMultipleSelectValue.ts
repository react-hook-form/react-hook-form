export default (
  options: HTMLOptionElement[] | HTMLOptionsCollection,
): string[] =>
  [...options]
    .filter(({ selected }): boolean => selected)
    .map(({ value }): string => value);
