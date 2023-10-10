import { FieldPath, FieldValues } from '../types';

export default function <TFieldValues extends FieldValues>(
  focusField: FieldPath<TFieldValues> | undefined,
  name: FieldPath<TFieldValues>,
): boolean {
  if (!focusField) {
    return false;
  }
  if (name === focusField) {
    return true;
  }
  if (focusField.length <= name.length) {
    return false;
  }
  return focusField.substring(0, name.length + 1) === name + '.';
}
