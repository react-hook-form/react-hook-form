import removeAllEventListeners from './removeAllEventListeners';
import isRadioInput from '../utils/isRadioInput';
import { Field, FieldsObject } from '../types';

export default function findRemovedFieldAndRemoveListener(
  fields: { [key: string]: Field },
  validateWithStateUpdate: Function,
  { ref, mutationWatcher, options }: Field,
  forceDelete: boolean = false,
): FieldsObject | undefined {
  if (!ref) return;

  const { name, type } = ref;
  if (isRadioInput(type) && options) {
    options.forEach(
      ({ ref }, index): void => {
        if (!document.body.contains(ref) && options && options[index]) {
          removeAllEventListeners(options[index], validateWithStateUpdate);
          (options[index].mutationWatcher || { disconnect: (): void => {} }).disconnect();
          options.splice(index, 1);
        }
      },
    );

    if (Array.isArray(options) && !options.length) {
      delete fields[name];
      return fields;
    }
  } else if (!document.body.contains(ref) || forceDelete) {
    removeAllEventListeners(ref, validateWithStateUpdate);
    if (mutationWatcher) mutationWatcher.disconnect();
    delete fields[name];
    return fields;
  }

  return fields;
}
