import * as React from 'react';
import removeAllEventListeners from './removeAllEventListeners';
import getFieldValue from './getFieldValue';
import isRadioInput from '../utils/isRadioInput';
import set from '../utils/set';
import isCheckBoxInput from '../utils/isCheckBoxInput';
import isDetached from '../utils/isDetached';
import isArray from '../utils/isArray';
import unset from '../utils/unset';
import filterOutFalsy from '../utils/filterOutFalsy';
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
  unmountFieldsStateRef: React.MutableRefObject<Record<string, any>>,
  shouldUnregister?: boolean,
  forceDelete?: boolean,
): void {
  const {
    ref,
    ref: { name, type },
  } = field;
  const fieldRef = fieldsRef.current[name] as Field;

  if (!shouldUnregister) {
    const value = getFieldValue(fieldsRef, name, unmountFieldsStateRef);

    if (!isUndefined(value)) {
      set(unmountFieldsStateRef.current, name, value);
    }
  }

  if (!type) {
    delete fieldsRef.current[name];
    return;
  }

  if ((isRadioInput(ref) || isCheckBoxInput(ref)) && fieldRef) {
    const { options } = fieldRef;

    if (isArray(options) && options.length) {
      filterOutFalsy(options).forEach((option, index): void => {
        const { ref } = option;
        if ((ref && isDetached(ref) && isSameRef(option, ref)) || forceDelete) {
          removeAllEventListeners(ref, handleChange);
          unset(options, `[${index}]`);
        }
      });

      if (options && !filterOutFalsy(options).length) {
        delete fieldsRef.current[name];
      }
    } else {
      delete fieldsRef.current[name];
    }
  } else if ((isDetached(ref) && isSameRef(fieldRef, ref)) || forceDelete) {
    removeAllEventListeners(ref, handleChange);

    delete fieldsRef.current[name];
  }
}
