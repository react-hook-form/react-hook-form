import removeAllEventListeners from './removeAllEventListeners';
import isRadioInput from '../utils/isRadioInput';
import isCheckBoxInput from '../utils/isCheckBoxInput';
import isDetached from '../utils/isDetached';
import { Field, FieldRefs, FieldValues } from '../types';

export default function findRemovedFieldAndRemoveListener<
  FormValues extends FieldValues
>(
  fields: FieldRefs<FormValues>,
  validateWithStateUpdate: Function | undefined = () => {},
  field: Field,
  forceDelete?: boolean | undefined,
): void {
  if (!field) {
    return;
  }

  const { ref, mutationWatcher, options } = field;

  if (!ref.type) {
    return;
  }

  const { name, type } = ref;

  if ((isRadioInput(type) || isCheckBoxInput(type)) && options) {
    options.forEach(({ ref }, index): void => {
      const option = options[index];
      if ((option && isDetached(ref)) || forceDelete) {
        const mutationWatcher = option.mutationWatcher;

        removeAllEventListeners(option, validateWithStateUpdate);

        if (mutationWatcher) {
          mutationWatcher.disconnect();
        }
        options.splice(index, 1);
      }
    });

    if (!options.length) {
      delete fields[name];
    }
  } else if (isDetached(ref) || forceDelete) {
    removeAllEventListeners(ref, validateWithStateUpdate);

    if (mutationWatcher) {
      mutationWatcher.disconnect();
    }
    delete fields[name];
  }
}
