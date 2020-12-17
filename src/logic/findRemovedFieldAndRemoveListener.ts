import * as React from 'react';
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
  field: Field,
  shallowFieldsStateRef: React.MutableRefObject<FieldValues>,
  shouldUnregister?: boolean,
  forceDelete?: boolean,
): void {
  const {
    ref,
    ref: { name },
  } = field;
  const fieldRef = fieldsRef.current[name] as Field;

  if (!shouldUnregister) {
    const value = getFieldValue(fieldsRef, name, shallowFieldsStateRef);

    !isUndefined(value) && set(shallowFieldsStateRef.current, name, value);
  }

  if (!ref.type || !fieldRef) {
    delete fieldsRef.current[name];
    return;
  }

  if (isRadioInput(ref) || isCheckBoxInput(ref)) {
    if (Array.isArray(fieldRef.options) && fieldRef.options.length) {
      compact(fieldRef.options).forEach((option = {}, index): void => {
        if (
          (isDetached(option.ref) && isSameRef(option, option.ref)) ||
          forceDelete
        ) {
          unset(fieldRef.options, `[${index}]`);
        }
      });

      if (fieldRef.options && !compact(fieldRef.options).length) {
        delete fieldsRef.current[name];
      }
    } else {
      delete fieldsRef.current[name];
    }
  } else if ((isDetached(ref) && isSameRef(fieldRef, ref)) || forceDelete) {
    delete fieldsRef.current[name];
  }
}
