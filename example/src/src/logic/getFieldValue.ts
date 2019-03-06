import getValidRadioValue from "../getValidRadioValue";
import getMultipleSelectValue from "../getMultipleSelectValue";

export default function getFieldValue(fields, ref) {
  let value;

  if (ref.type === 'radio') {
    value = getValidRadioValue(fields[ref.name].options).value;
  } else if (ref.type === 'select-multiple') {
    value = getMultipleSelectValue([...ref.options])
  } else if (ref.type === 'checkbox') {
    value = ref.checked;
  } else {
    value = ref.value;
  }

  return value;
}
