export default function onDomRemove(element, onDetachCallback) {
  const observer = new MutationObserver(function() {
    function isDetached(el) {
      if (el.parentNode === window.document) {
        return false;
      } else if (el.parentNode === null) {
        return true;
      } else {
        return isDetached(el.parentNode);
      }
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
