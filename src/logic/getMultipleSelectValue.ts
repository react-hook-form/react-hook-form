export default function getMultipleSelectValue(options: HTMLOptionElement[]) {
  return options.filter(({ selected }) => selected).map(({ value }) => value);
}
