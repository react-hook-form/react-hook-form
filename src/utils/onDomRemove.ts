import { Ref, MutationWatcher } from '../types';

export default function onDomRemove(element: Ref, onDetachCallback: () => void): MutationWatcher {
  const observer = new MutationObserver((): void => {
    function isDetached(el): boolean {
      if (el.parentNode === window.document) {
        return false;
      } else if (el.parentNode === null) {
        return true;
      }

      return isDetached(el.parentNode);
    }

    if (isDetached(element)) {
      observer.disconnect();
      onDetachCallback();
    }
  });

  observer.observe(window.document, {
    childList: true,
    subtree: true,
  });

  return observer;
}
