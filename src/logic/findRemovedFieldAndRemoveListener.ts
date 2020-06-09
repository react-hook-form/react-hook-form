import * as React from 'react';
import removeAllEventListeners from './removeAllEventListeners';
import isRadioInput from '../utils/isRadioInput';
import isCheckBoxInput from '../utils/isCheckBoxInput';
import isDetached from '../utils/isDetached';
import isArray from '../utils/isArray';
import unset from '../utils/unset';
import unique from '../utils/unique';
import { Field, FieldRefs, FieldValues, Ref } from '../types/form';
import getFieldValue from './getFieldValue';

const isSameRef = (fieldValue: Field, ref: Ref) =>
  fieldValue && fieldValue.ref === ref;

export default function findRemovedFieldAndRemoveListener<
  TFieldValues extends FieldValues
>(
  fields: FieldRefs<TFieldValues>,
  handleChange: ({ type, target }: Event) => Promise<void | boolean>,
  field: Field,
  unmountFieldsStore: React.MutableRefObject<Record<string, any>>,
  autoUnregister: boolean,
  forceDelete?: boolean,
): void {
  const {
    ref,
    ref: { name, type },
    mutationWatcher,
  } = field;
  const fieldRef = fields[name] as Field;

  if (!autoUnregister) {
    unmountFieldsStore.current[name] = getFieldValue(fields, fieldRef.ref);
  }

  if (!type) {
    delete fields[name];
    return;
  }

  if ((isRadioInput(ref) || isCheckBoxInput(ref)) && fieldRef) {
    const { options } = fieldRef;

    if (isArray(options) && options.length) {
      unique(options).forEach((option, index): void => {
        const { ref, mutationWatcher } = option;
        if ((ref && isDetached(ref) && isSameRef(option, ref)) || forceDelete) {
          removeAllEventListeners(ref, handleChange);

          if (mutationWatcher) {
            mutationWatcher.disconnect();
          }

          unset(options, `[${index}]`);
        }
      });

      if (options && !unique(options).length) {
        delete fields[name];
      }
    } else {
      delete fields[name];
    }
  } else if ((isDetached(ref) && isSameRef(fieldRef, ref)) || forceDelete) {
    removeAllEventListeners(ref, handleChange);

    if (mutationWatcher) {
      mutationWatcher.disconnect();
    }

    delete fields[name];
  }
}
