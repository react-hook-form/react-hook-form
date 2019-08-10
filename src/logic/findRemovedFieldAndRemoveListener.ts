import removeAllEventListeners from './removeAllEventListeners';
import isRadioInput from '../utils/isRadioInput';
import isDetached from '../utils/isDetached';
import { Field, FieldsObject, DataType } from '../types';

export default function findRemovedFieldAndRemoveListener<
  Data extends DataType
>(
  fields: FieldsObject<Data>,
  validateWithStateUpdate: Function | undefined = () => {},
  { ref, mutationWatcher, options }: Field,
  forceDelete: boolean = false,
): void {
  if (!ref || !ref.type) return;
  const { name, type } = ref;

  if (isRadioInput(type) && options) {
    options.forEach(({ ref }, index): void => {
      if (options[index] && isDetached(ref) || forceDelete) {
        removeAllEventListeners(options[index], validateWithStateUpdate);
        (
          options[index].mutationWatcher || { disconnect: (): void => {} }
        ).disconnect();
        options.splice(index, 1);
      }
    });

    if (!options.length) delete fields[name];
  } else if (isDetached(ref) || forceDelete) {
    removeAllEventListeners(ref, validateWithStateUpdate);
    if (mutationWatcher) mutationWatcher.disconnect();
    delete fields[name];
  }
}
