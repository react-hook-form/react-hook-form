import { RegisterInput } from '..';

export default function detectRegistered(
  fields: { [key: string]: RegisterInput },
  { ref: { type, name, value } }: any,
): boolean {
  return !!(type === 'radio'
    ? Object.values(fields).find(
        ({ ref: { name: localName }, options }) =>
          name === localName && options ? !!options.find(option => option.ref.value === value) : false,
      )
    : fields[name]);
}
