import { Control } from '../../types';
import get from '../../utils/get';
import isHTMLElement from '../../utils/isHTMLElement';

export default function getFormNode<T>({
  _fields,
  _names,
}: Pick<Control<T>, '_fields' | '_names'>): HTMLFormElement | null {
  for (const name of _names.mount) {
    const field = get(_fields, name);
    if (field && field._f) {
      const fieldReference = Array.isArray(field._f.refs)
        ? field._f.refs[0]
        : field._f.ref;

      if (isHTMLElement(fieldReference)) {
        return fieldReference.closest('form');
      }
    }
  }

  return null;
}
