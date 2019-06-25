import { Ref, MutationWatcher } from '../types';

export default function onDomRemove(element: Ref, onDetachCallback: () => void): MutationWatcher {
  const observer = new MutationObserver((): void => {
    function isDetached(element: any): boolean {
      if (!element || !element.parentNode) return true;

      if (element.parentNode === window.document) {
        return false;
      } else if (element.parentNode === null) {
        return true;
      }

      return isDetached(element.parentNode);
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
