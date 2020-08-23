import * as React from 'react';
import { Field, FieldRefs } from '../types/form';
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
        for (const { ref } of field.options) {
          if (isDetached(ref)) {
            removeFieldEventListenerAndRef(field);
          }
        }
      } else if (isDetached(field.ref)) {
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
