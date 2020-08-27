import * as React from 'react';
import { Field, FieldRefs } from '../types';
import isDetached from './isDetached';

export default function onDomRemove<TFieldValues>(
  fieldsRef: React.MutableRefObject<FieldRefs<TFieldValues>>,
  removeFieldEventListenerAndRef: (
    field: Field | undefined,
    forceDelete?: boolean,
  ) => void,
): MutationObserver {
  const observer = new MutationObserver((): void => {
    for (const field of Object.values(fieldsRef.current)) {
      if (field && field.options) {
        for (const option of field.options) {
          if (option && option.ref && isDetached(option.ref)) {
            removeFieldEventListenerAndRef(field);
          }
        }
      } else if (field && isDetached(field.ref)) {
        removeFieldEventListenerAndRef(field);
      }
    }
  });

  observer.observe(window.document, {
    childList: true,
    subtree: true,
  });

  return observer;
}
