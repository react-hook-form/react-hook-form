import { Ref } from '../types';

export default function isDetached(element: Ref): boolean {
  // null elements are detached (probably a null parent)
  if (!element) return true;
  // If we can find our way up to a document node, we assume we are still attached!
  if (element.nodeType === Node.DOCUMENT_NODE) return false;

  return isDetached(element.parentNode);
}
