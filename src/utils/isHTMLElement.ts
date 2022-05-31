export default (value: unknown): value is HTMLElement => {
  const owner = (value as HTMLElement).ownerDocument;
  const ElementClass = owner.defaultView
    ? owner.defaultView.HTMLElement
    : HTMLElement;
  return value instanceof ElementClass;
};
