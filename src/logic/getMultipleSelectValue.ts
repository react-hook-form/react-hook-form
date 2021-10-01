export default (options: HTMLCollectionOf<HTMLOptionElement>): string[] =>
  [...options].map(({ value }): string => value);
