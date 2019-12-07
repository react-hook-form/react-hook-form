import removeAllEventListeners from './removeAllEventListeners';
import isRadioInput from '../utils/isRadioInput';
import isCheckBoxInput from '../utils/isCheckBoxInput';
import isDetached from '../utils/isDetached';
import isArray from '../utils/isArray';
import { Field, FieldRefs, FieldValues } from '../types';

export default function findRemovedFieldAndRemoveListener<
  FormValues extends FieldValues
>(
  fields: FieldRefs<FormValues>,
  handleChange: ({ type, target }: MouseEvent) => Promise<void | boolean>,
  field: Field,
  forceDelete?: boolean | undefined,
): void {
  if (!field) {
    return;
  }

  const { ref, mutationWatcher } = field;

  if (!ref.type || !fields[ref.name]) {
    return;
  }

  const { name, type } = ref;
  const options = fields[name];

  if (isRadioInput(type) || isCheckBoxInput(type)) {
    if (isArray(options) && options.length) {
      options.forEach(({ ref }, index): void => {
        const option = options[index];
        if ((option && isDetached(ref)) || forceDelete) {
          const mutationWatcher = option.mutationWatcher;

          removeAllEventListeners(option, handleChange);

          if (mutationWatcher) {
            mutationWatcher.disconnect();
          }
          options.splice(index, 1);
        }
      });
    } else {
      delete fields[name];
    }
  } else if (isDetached(ref) || forceDelete) {
    removeAllEventListeners(ref, handleChange);

    if (mutationWatcher) {
      mutationWatcher.disconnect();
    }
    delete fields[name];
  }
}
