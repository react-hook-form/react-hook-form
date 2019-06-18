import removeAllEventListeners from './removeAllEventListeners';
import isRadioInput from '../utils/isRadioInput';
import { Field, FieldsObject, DataType } from '../types';

export default function findRemovedFieldAndRemoveListener<
  Data extends DataType
>(
  fields: FieldsObject<Data>,
  touchedFieldsRef: { current: string[] },
  validateWithStateUpdate: Function,
  { ref, mutationWatcher, options }: Field,
  forceDelete: boolean = false,
): FieldsObject<Data> | undefined {
  if (!ref || !ref.type) return;

  const { name, type } = ref;
  touchedFieldsRef.current = touchedFieldsRef.current.filter(
    inputName => inputName !== name,
  );

  if (isRadioInput(type) && options) {
    options.forEach(
      ({ ref }, index): void => {
        if (
          ref instanceof HTMLElement &&
          !document.body.contains(ref) &&
          options &&
          options[index]
        ) {
          removeAllEventListeners(options[index], validateWithStateUpdate);
          (
            options[index].mutationWatcher || { disconnect: (): void => {} }
          ).disconnect();
          options.splice(index, 1);
        }
      },
    );

    if (Array.isArray(options) && !options.length) {
      delete fields[name];
      return fields;
    }
  } else if (
    (ref instanceof HTMLElement && !document.body.contains(ref)) ||
    forceDelete
  ) {
    removeAllEventListeners(ref, validateWithStateUpdate);
    if (mutationWatcher) mutationWatcher.disconnect();
    delete fields[name];
    return fields;
  }

  return fields;
}
