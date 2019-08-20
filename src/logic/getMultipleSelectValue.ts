export default (options: HTMLOptionElement[] | HTMLOptionsCollection): string[] =>	const filterOptions = (options: HTMLOptionElement[]): string[] =>
  [...options].filter(({ selected }): boolean => selected).map(({ value }): string => value);
