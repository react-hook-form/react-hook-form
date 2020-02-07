export default (value: any): value is HTMLElement =>
  !!(value && value.nodeType === 1);
