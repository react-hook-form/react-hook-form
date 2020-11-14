import * as React from 'react';
import removeAllEventListeners from './removeAllEventListeners';
import getFieldValue from './getFieldValue';
import isRadioInput from '../utils/isRadioInput';
import set from '../utils/set';
import isCheckBoxInput from '../utils/isCheckBoxInput';
import isDetached from '../utils/isDetached';
import unset from '../utils/unset';
import compact from '../utils/compact';
import isUndefined from '../utils/isUndefined';
import { Field, FieldRefs, FieldValues, Ref } from '../types';

const isSameRef = (fieldValue: Field, ref: Ref) =>
  fieldValue && fieldValue.ref === ref;

export default function findRemovedFieldAndRemoveListener<
  TFieldValues extends FieldValues
>(
  fieldsRef: React.MutableRefObject<FieldRefs<TFieldValues>>,
  handleChange: ({ type, target }: Event) => Promise<void | boolean>,
  field: Field,
  shallowFieldsStateRef: React.MutableRefObject<FieldValues>,
  shouldUnregister?: boolean,
  forceDelete?: boolean,
): void {
  const ref = field.ref;
  const fieldRef = fieldsRef.current[ref.name] as Field;

  if (!shouldUnregister) {
    const value = getFieldValue(fieldsRef, ref.name, shallowFieldsStateRef);

    !isUndefined(value) && set(shallowFieldsStateRef.current, ref.name, value);
  }

  if (!ref.type) {
    delete fieldsRef.current[ref.name];
    return;
  }

  if ((isRadioInput(ref) || isCheckBoxInput(ref)) && fieldRef) {
    if (Array.isArray(fieldRef.options) && fieldRef.options.length) {
      compact(fieldRef.options).forEach((option, index): void => {
        if (
          (option.ref &&
            isDetached(option.ref) &&
            isSameRef(option, option.ref)) ||
          forceDelete
        ) {
          removeAllEventListeners(option.ref, handleChange);
          unset(fieldRef.options, `[${index}]`);
        }
      });

      if (fieldRef.options && !compact(fieldRef.options).length) {
        delete fieldsRef.current[ref.name];
      }
    } else {
      delete fieldsRef.current[ref.name];
    }
  } else if ((isDetached(ref) && isSameRef(fieldRef, ref)) || forceDelete) {
    removeAllEventListeners(ref, handleChange);

    delete fieldsRef.current[ref.name];
  }
}
