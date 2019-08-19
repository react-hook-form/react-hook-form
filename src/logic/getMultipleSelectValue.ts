const filterOptions = (options: HTMLOptionElement[]): string[] =>
  options.filter(({ selected }): boolean => selected).map(({ value }): string => value);

export default (options: HTMLOptionElement[] | HTMLOptionsCollection): string[] =>
  options instanceof HTMLOptionsCollection ? filterOptions([...options]) : filterOptions(options);
