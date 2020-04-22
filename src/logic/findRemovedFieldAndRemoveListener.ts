import removeAllEventListeners from './removeAllEventListeners';
import isRadioInput from '../utils/isRadioInput';
import isCheckBoxInput from '../utils/isCheckBoxInput';
import isDetached from '../utils/isDetached';
import isArray from '../utils/isArray';
import unset from '../utils/unset';
import { Field, FieldRefs, FieldValues, Ref } from '../types';

const isSameRef = (fieldValue: Field, ref: Ref) =>
  fieldValue && fieldValue.ref === ref;

export default function findRemovedFieldAndRemoveListener<
  FormValues extends FieldValues
>(
  fields: FieldRefs<FormValues>,
  handleChange: ({ type, target }: Event) => Promise<void | boolean>,
  field: Field,
  forceDelete?: boolean,
): void {
  const {
    ref,
    ref: { name, type },
    mutationWatcher,
  } = field;
  const fieldValue = fields[name] as Field;

  if (!type) {
    delete fields[name];
    return;
  }

  if ((isRadioInput(ref) || isCheckBoxInput(ref)) && fieldValue) {
    const { options } = fieldValue;

    if (isArray(options) && options.length) {
      options.filter(Boolean).forEach((option, index): void => {
        const { ref, mutationWatcher } = option;
        if ((ref && isDetached(ref) && isSameRef(option, ref)) || forceDelete) {
          removeAllEventListeners(ref, handleChange);

          if (mutationWatcher) {
            mutationWatcher.disconnect();
          }

          unset(options, [`[${index}]`]);
        }
      });

      if (options && !options.filter(Boolean).length) {
        delete fields[name];
      }
    } else {
      delete fields[name];
    }
  } else if ((isDetached(ref) && isSameRef(fieldValue, ref)) || forceDelete) {
    removeAllEventListeners(ref, handleChange);

    if (mutationWatcher) {
      mutationWatcher.disconnect();
    }

    delete fields[name];
  }
}
