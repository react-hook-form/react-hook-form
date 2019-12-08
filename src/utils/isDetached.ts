import { Ref } from '../types';
import isHtmlElement from './isHtmlElement';

export default function isDetached(element: Ref): boolean {
  if (!element) {
    return true;
  }

  if (!isHtmlElement(element) || element.nodeType === Node.DOCUMENT_NODE) {
    return false;
  }

  return isDetached(element.parentNode);
}
