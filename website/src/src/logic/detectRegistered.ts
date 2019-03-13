import { RegisterInput } from '..';
import isRadioInput from '../utils/isRadioInput';

export default function detectRegistered(
  fields: { [key: string]: RegisterInput },
  { ref: { type, name, value } }: any,
): boolean {
  return !!(isRadioInput(type)
    ? Object.values(fields).find(
        ({ ref: { name: localName }, options }) =>
          name === localName && options ? !!options.find(option => option.ref.value === value) : false,
      )
    : fields[name]);
}
