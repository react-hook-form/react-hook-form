export default function getMultipleSelectValue(options: Array<HTMLOptionElement>): Array<string | number> {
  return [...options].filter(({ selected }) => selected).map(({ value }) => value);
}
