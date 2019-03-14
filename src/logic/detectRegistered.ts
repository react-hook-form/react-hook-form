import { Field } from '..';
import isRadioInput from '../utils/isRadioInput';

export default function detectRegistered(
  fields: { [key: string]: Field },
  { ref: { type, name, value } }: any,
): boolean {
  return !!(isRadioInput(type)
    ? Object.values(fields).find(
        ({ ref: { name: localName }, options }) =>
          name === localName && options ? !!options.find(option => option.ref.value === value) : false,
      )
    : fields[name]);
}
