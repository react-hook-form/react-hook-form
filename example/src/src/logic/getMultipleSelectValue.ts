export default function getMultipleSelectValue(options: Array<HTMLOptionElement>) {
  return options.filter(option => option.selected).map(option => option.value);
}
