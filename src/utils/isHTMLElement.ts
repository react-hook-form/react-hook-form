import isUndefined from './isUndefined';

export default (value: any): value is HTMLElement =>
  !isUndefined(HTMLElement) && value instanceof HTMLElement;
