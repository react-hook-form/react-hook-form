import removeAllEventListeners from './removeAllEventListeners';
import isRadioInput from '../utils/isRadioInput';
import isDetached from '../utils/isDetached';
import { Field, FieldsObject, DataType } from '../types';

export default function findRemovedFieldAndRemoveListener<
  Data extends DataType
>(
  fields: FieldsObject<Data>,
  touchedFieldsRef: Set<unknown>,
  fieldsWithValidationRef: Set<unknown>,
  validateWithStateUpdate: Function,
  { ref, mutationWatcher, options }: Field,
  forceDelete: boolean = false,
): void {
  if (!ref || !ref.type) return;

  const { name, type } = ref;
  touchedFieldsRef.delete(name);
  fieldsWithValidationRef.delete(name);

  if (isRadioInput(type) && options) {
    options.forEach(({ ref }, index): void => {
      if (options[index] && isDetached(ref)) {
        removeAllEventListeners(options[index], validateWithStateUpdate);
        (
          options[index].mutationWatcher || { disconnect: (): void => {} }
        ).disconnect();
        options.splice(index, 1);
      }
    });

    if (!options.length) delete fields[name];
  } else if (forceDelete || isDetached(ref)) {
    removeAllEventListeners(ref, validateWithStateUpdate);
    if (mutationWatcher) mutationWatcher.disconnect();
    delete fields[name];
  }
}
