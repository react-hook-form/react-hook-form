export default function getMultipleSelectValue(options: HTMLOptionElement[]): string[] {
  return options.filter(({ selected }) => selected).map(({ value }) => value);
}
