import * as React from 'react';
import { FieldRefs } from '../types/form';
import isDetached from './isDetached';

export default function onDomRemove<TFieldValues>(
  fieldsRef: React.MutableRefObject<FieldRefs<TFieldValues>>,
  removeFieldEventListenerAndRef: any,
): MutationObserver {
  const observer = new MutationObserver((): void => {
    for (const field of Object.values(fieldsRef.current)) {
      if (field && isDetached(field.ref)) {
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
