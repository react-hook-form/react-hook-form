export default function getMultipleSelectValue(options: HTMLOptionElement[]): string[] {
  return options.filter(({ selected }): boolean => selected).map(({ value }): string => value);
}
