export default (value: unknown): value is HTMLElement =>
  value instanceof HTMLElement;
