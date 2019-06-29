export default (options: HTMLOptionElement[]): string[] =>
  options.filter(({ selected }): boolean => selected).map(({ value }): string => value);
