export default (
  options: HTMLOptionElement[] | HTMLOptionsCollection,
): string[] =>
  [...options]
    .map(({ value }): string => value);
