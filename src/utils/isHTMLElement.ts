import isObject from './isObject';

export default (value: any): value is HTMLElement =>
  isObject(value) && (value as HTMLElement).nodeType === Node.ELEMENT_NODE;
