export default function getMultipleSelectValue(options: Array<any>) {
  return options.filter(option => option.selected).map(option => option.value);
}
