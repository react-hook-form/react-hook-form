export default (value: unknown): value is HTMLElement => {
  const ElementClass =
    (value as HTMLElement)?.ownerDocument?.defaultView?.HTMLElement ??
    HTMLElement;
  return value instanceof ElementClass;
};
